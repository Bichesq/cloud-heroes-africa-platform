import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuthor, type CurrentAuthor } from "@/lib/session";
import {
  capabilitiesFor,
  PROGRAM_ID_PATTERN,
  type Capability,
  type ProgramCapabilities,
  type ProgramRoles,
} from "@/lib/permissions";

export { capabilitiesFor, PROGRAM_ID_PATTERN, type Capability, type ProgramCapabilities, type ProgramRoles };

/* Program-scoped authorization — the single place every page, server action
 * and route asks "may THIS author do THIS on THIS program?" (SECURITY.md §3:
 * checked server-side, per object, default deny).
 *
 * The rules themselves are pure, in lib/permissions.ts. */

export async function getProgramRoles(authorId: string, programId: string): Promise<ProgramRoles> {
  const program = await prisma.lpProgram.findUnique({
    where: { id: programId },
    select: {
      creatorAuthorId: true,
      instructors: { where: { authorId }, select: { authorId: true } },
      contributors: { where: { authorId }, select: { role: true } },
      directors: { where: { authorId }, select: { authorId: true } },
      owners: { where: { authorId }, select: { authorId: true } },
    },
  });
  if (!program) {
    return { isCreator: false, isInstructor: false, contributorRole: null, isDirector: false, isOwner: false };
  }
  return {
    isCreator: program.creatorAuthorId === authorId,
    isInstructor: program.instructors.length > 0,
    contributorRole: program.contributors[0]?.role ?? null,
    isDirector: program.directors.length > 0,
    isOwner: program.owners.length > 0,
  };
}

export class AccessDeniedError extends Error {
  constructor() {
    super("Access denied");
  }
}

function logDenied(authorId: string, programId: string, capability: string) {
  // SECURITY.md §3: log authorization failures (no request data beyond ids).
  console.warn(JSON.stringify({ event: "lm.authz_denied", authorId, programId, capability }));
}

export type ProgramAccess = {
  author: CurrentAuthor;
  roles: ProgramRoles;
  can: ProgramCapabilities;
};

/** Pages: a program the author can't see is a 404, whether or not it exists,
 * so ids can't be probed. A missing capability beyond `view` is also a 404. */
export async function requireProgramPage(programId: string, capability: Capability = "view"): Promise<ProgramAccess> {
  const author = await requireAuthor();
  if (!PROGRAM_ID_PATTERN.test(programId)) notFound();
  const roles = await getProgramRoles(author.id, programId);
  const can = capabilitiesFor(roles);
  if (!can.view || !can[capability]) {
    logDenied(author.id, programId, capability);
    notFound();
  }
  return { author, roles, can };
}

/** Server actions / routes: throws, and the caller returns a generic error. */
export async function requireProgramCapability(programId: string, capability: Capability): Promise<ProgramAccess> {
  const author = await requireAuthor();
  if (!PROGRAM_ID_PATTERN.test(programId)) throw new AccessDeniedError();
  const roles = await getProgramRoles(author.id, programId);
  const can = capabilitiesFor(roles);
  if (!can[capability]) {
    logDenied(author.id, programId, capability);
    throw new AccessDeniedError();
  }
  return { author, roles, can };
}

/** Creating a program: Director on at least one program (plan §7). */
export async function canCreatePrograms(authorId: string): Promise<boolean> {
  const row = await prisma.lpProgramDirector.findFirst({ where: { authorId }, select: { authorId: true } });
  return row !== null;
}

/* Programs an author holds ANY role on — Creator, Instructor, Contributor,
 * Director or Owner (decision #2). */
export function authorProgramFilter(authorId: string) {
  return {
    OR: [
      { creatorAuthorId: authorId },
      { instructors: { some: { authorId } } },
      { contributors: { some: { authorId } } },
      { directors: { some: { authorId } } },
      { owners: { some: { authorId } } },
    ],
  };
}

export async function getAuthorPrograms(authorId: string) {
  return prisma.lpProgram.findMany({
    where: authorProgramFilter(authorId),
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
      creatorAuthor: { select: { name: true, email: true } },
      contributors: { where: { authorId }, select: { role: true } },
      directors: { where: { authorId }, select: { authorId: true } },
      owners: { where: { authorId }, select: { authorId: true } },
      _count: { select: { modules: true } },
    },
    orderBy: { title: "asc" },
  });
}
