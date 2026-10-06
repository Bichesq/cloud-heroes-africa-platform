"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { checkImage, MAX_IMAGE_BYTES } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, canCreatePrograms, requireProgramCapability } from "@/lib/program-access";
import { requireAuthor } from "@/lib/session";
import { mediaStorage } from "@/lib/storage";
import { programId as programIdSchema, programSetupSchema, slugify, type ProgramSetupInput } from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* Program Setup (§6.1) save — create and edit. Rules (plan §7):
 *  - create: Director on at least one program; the creator becomes the new
 *    program's Creator, Owner and Director.
 *  - edit: Owner / Director / Editor; changing the Creator needs Owner or
 *    Director.
 * Roles are read from the database on every request (never from the JWT),
 * so a role change takes effect on the author's next request. */

function readSetupFields(formData: FormData): unknown {
  // Allowlist: only these keys are read; everything else in the form is ignored.
  const fields: Record<string, unknown> = {
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
  };
  if (formData.has("creatorAuthorId")) fields.creatorAuthorId = formData.get("creatorAuthorId");
  return fields;
}

type ThumbnailRead = { kind: "none" } | { kind: "file"; bytes: Uint8Array; imageKind: "png" | "jpg" } | { kind: "error"; error: string };

async function readThumbnail(formData: FormData): Promise<ThumbnailRead> {
  const file = formData.get("thumbnail");
  if (file === null || typeof file === "string" || file.size === 0) return { kind: "none" };
  if (file.size > MAX_IMAGE_BYTES) return { kind: "error", error: "Images must be 2 MB or smaller." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkImage(bytes);
  return check.ok ? { kind: "file", bytes, imageKind: check.kind } : { kind: "error", error: check.error };
}

function fieldErrorsOf(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= key === "creatorAuthorId" ? "Choose a Creator from the list." : issue.message;
  }
  return out;
}

async function authorExists(id: string): Promise<boolean> {
  return (await prisma.lpAuthor.count({ where: { id } })) === 1;
}

export async function saveProgramSetup(programIdOrNew: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = programSetupSchema.safeParse(readSetupFields(formData));
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const thumbnail = await readThumbnail(formData);
  if (thumbnail.kind === "error") return { ok: false, error: thumbnail.error, fieldErrors: { thumbnail: thumbnail.error } };

  if (programIdOrNew === "new") return createProgram(parsed.data, thumbnail);

  const id = programIdSchema.safeParse(programIdOrNew);
  if (!id.success) return { ok: false, error: GENERIC_ERROR };
  return updateProgram(id.data, parsed.data, thumbnail);
}

async function storeThumbnail(thumbnail: ThumbnailRead): Promise<string | null> {
  return thumbnail.kind === "file" ? mediaStorage.put(thumbnail.bytes, thumbnail.imageKind) : null;
}

async function createProgram(input: ProgramSetupInput, thumbnail: ThumbnailRead): Promise<FormState> {
  const author = await requireAuthor();
  if (!(await canCreatePrograms(author.id))) {
    console.warn(JSON.stringify({ event: "lm.authz_denied", authorId: author.id, capability: "createProgram" }));
    return { ok: false, error: GENERIC_ERROR };
  }

  const newKey = await storeThumbnail(thumbnail);
  const base = slugify(input.title);
  let createdId: string | null = null;

  // The slug is the id (same as the seeded programs). On a clash, retry once
  // with a random suffix; the unique constraint is the real guard.
  for (const candidate of [base, `${base.slice(0, 53)}-${crypto.randomUUID().slice(0, 6)}`]) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.lpProgram.create({
          data: {
            id: candidate,
            slug: candidate,
            title: input.title,
            blurb: input.description,
            creatorAuthorId: author.id,
            thumbnailKey: newKey,
            owners: { create: { authorId: author.id, addedById: author.id } },
            directors: { create: { authorId: author.id, addedById: author.id } },
          },
        });
        await recordAudit(tx, {
          programId: candidate,
          actorAuthorId: author.id,
          action: "program_created",
          details: { title: input.title },
        });
      });
      createdId = candidate;
      break;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      console.error("lm.program_create_failed", e);
      break;
    }
  }

  if (!createdId) {
    if (newKey) await mediaStorage.delete(newKey);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidatePath("/");
  redirect(`/programs/${createdId}/setup?created=1`);
}

async function updateProgram(programId: string, input: ProgramSetupInput, thumbnail: ThumbnailRead): Promise<FormState> {
  let access;
  try {
    access = await requireProgramCapability(programId, "editSetup");
  } catch (e) {
    if (e instanceof AccessDeniedError) return { ok: false, error: GENERIC_ERROR };
    throw e;
  }
  const { author, can } = access;

  const current = await prisma.lpProgram.findUnique({
    where: { id: programId },
    select: { title: true, blurb: true, creatorAuthorId: true, thumbnailKey: true },
  });
  if (!current) return { ok: false, error: GENERIC_ERROR };

  // Creator: only compared when the form carried the field.
  let nextCreator: string | null | undefined;
  if (input.creatorAuthorId !== undefined) {
    const requested = input.creatorAuthorId === "" ? null : input.creatorAuthorId;
    if (requested !== current.creatorAuthorId) {
      if (!can.changeCreator) {
        console.warn(JSON.stringify({ event: "lm.authz_denied", authorId: author.id, programId, capability: "changeCreator" }));
        return { ok: false, error: GENERIC_ERROR };
      }
      if (requested !== null && !(await authorExists(requested))) {
        return { ok: false, error: "Check the highlighted fields.", fieldErrors: { creatorAuthorId: "Choose a Creator from the list." } };
      }
      nextCreator = requested;
    }
  }

  const newKey = await storeThumbnail(thumbnail);
  const changed: Record<string, { before: string; after: string }> = {};
  if (input.title !== current.title) changed.title = { before: current.title, after: input.title };
  if (input.description !== current.blurb) changed.description = { before: current.blurb, after: input.description };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.lpProgram.update({
        where: { id: programId },
        data: {
          title: input.title,
          blurb: input.description,
          ...(nextCreator !== undefined ? { creatorAuthorId: nextCreator } : {}),
          ...(newKey ? { thumbnailKey: newKey } : {}),
        },
      });
      if (Object.keys(changed).length > 0) {
        await recordAudit(tx, { programId, actorAuthorId: author.id, action: "program_updated", details: changed });
      }
      if (nextCreator !== undefined) {
        await recordAudit(tx, {
          programId,
          actorAuthorId: author.id,
          action: "creator_changed",
          subjectAuthorId: nextCreator,
          details: { before: current.creatorAuthorId, after: nextCreator },
        });
      }
      if (newKey) {
        await recordAudit(tx, { programId, actorAuthorId: author.id, action: "thumbnail_changed" });
      }
    });
  } catch (e) {
    console.error("lm.program_update_failed", e);
    if (newKey) await mediaStorage.delete(newKey);
    return { ok: false, error: GENERIC_ERROR };
  }

  if (newKey && current.thumbnailKey) await mediaStorage.delete(current.thumbnailKey);
  revalidatePath("/");
  revalidatePath(`/programs/${programId}`, "layout");
  return { ok: true, message: "Program saved." };
}
