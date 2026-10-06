import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capabilitiesFor, getProgramRoles, PROGRAM_ID_PATTERN } from "@/lib/program-access";
import { mediaStorage } from "@/lib/storage";

/* Program thumbnail (plan decision #5). The file is served only to authors
 * with a role on THIS program (SECURITY.md §3). The storage key comes from
 * the database, never from the URL, so the path can't be steered. Anything
 * the author can't see is a plain 404, the same as a missing file. */

const notFound = () => new NextResponse(null, { status: 404 });

export async function GET(_req: Request, ctx: { params: Promise<{ programId: string }> }) {
  const { programId } = await ctx.params;
  if (!PROGRAM_ID_PATTERN.test(programId)) return notFound();

  const session = await auth();
  const authorId = session?.user?.authorId;
  if (!authorId) return new NextResponse(null, { status: 401 });

  const can = capabilitiesFor(await getProgramRoles(authorId, programId));
  if (!can.view) return notFound();

  const program = await prisma.lpProgram.findUnique({ where: { id: programId }, select: { thumbnailKey: true } });
  if (!program?.thumbnailKey) return notFound();

  const file = await mediaStorage.get(program.thumbnailKey);
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
