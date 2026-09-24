import { prisma } from "@/lib/prisma";

/* Programs an author holds ANY role on — Creator, Instructor, Contributor,
 * Director or Owner (plan decision #2, 2026-09-24: per-program visibility,
 * no platform-wide author role). The Programs list (sub-step 2) and every
 * program-scoped screen start from this; per-action permissions (Editor vs
 * Viewer, Owner/Director for Settings & Access) are layered on top there. */
export async function getAuthorPrograms(authorId: string) {
  return prisma.lpProgram.findMany({
    where: {
      OR: [
        { creatorAuthorId: authorId },
        { instructors: { some: { authorId } } },
        { contributors: { some: { authorId } } },
        { directors: { some: { authorId } } },
        { owners: { some: { authorId } } },
      ],
    },
    select: { id: true, title: true, published: true },
    orderBy: { title: "asc" },
  });
}
