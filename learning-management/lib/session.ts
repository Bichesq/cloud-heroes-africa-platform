import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CurrentAuthor = { id: string; email: string; name: string };

/* Server-side gate for every authoring page and action. The proxy is only
 * the outer gate; this re-checks the session AND that the author row still
 * exists (a JWT outlives a deleted author), redirecting to /signin
 * otherwise — default deny (SECURITY.md §3). Program-specific permission
 * checks build on this in sub-step 2. */
export async function requireAuthor(): Promise<CurrentAuthor> {
  const session = await auth();
  const authorId = session?.user?.authorId;
  if (!authorId) redirect("/signin");

  const author = await prisma.lpAuthor.findUnique({
    where: { id: authorId },
    select: { id: true, email: true, name: true },
  });
  if (!author) redirect("/signin");
  return author;
}
