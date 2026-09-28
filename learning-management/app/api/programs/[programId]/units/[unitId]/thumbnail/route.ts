import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capabilitiesFor, getProgramRoles, PROGRAM_ID_PATTERN } from "@/lib/program-access";
import { mediaStorage } from "@/lib/storage";
import { unitId as unitIdSchema } from "@/lib/validation";

/* Unit thumbnail (plan §9). Same rules as the program thumbnail route:
 * authors with a role on THIS program only; the storage key comes from the
 * database, never the URL. `?draft=1` serves a pending (unpublished)
 * thumbnail when there is one. */

const notFound = () => new NextResponse(null, { status: 404 });

export async function GET(req: Request, ctx: { params: Promise<{ programId: string; unitId: string }> }) {
  const { programId, unitId } = await ctx.params;
  if (!PROGRAM_ID_PATTERN.test(programId) || !unitIdSchema.safeParse(unitId).success) return notFound();

  const session = await auth();
  const authorId = session?.user?.authorId;
  if (!authorId) return new NextResponse(null, { status: 401 });
  if (!capabilitiesFor(await getProgramRoles(authorId, programId)).view) return notFound();

  const unit = await prisma.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: { thumbnailKey: true, draft: { select: { thumbnailKey: true } } },
  });
  const wantDraft = new URL(req.url).searchParams.get("draft") === "1";
  const key = (wantDraft ? unit?.draft?.thumbnailKey : null) ?? unit?.thumbnailKey;
  if (!key) return notFound();

  const file = await mediaStorage.get(key);
  if (!file) return notFound();
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
