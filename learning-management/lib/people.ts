import type { PersonOption } from "@/components/people/types";
import { displayName } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/* Everyone who can be picked in a people dropdown: every known LpAuthor
 * (a Microsoft account that has signed in, or was bootstrapped). Only loaded
 * for authors allowed to manage the list in question. */
export async function listPeople(): Promise<PersonOption[]> {
  const authors = await prisma.lpAuthor.findMany({
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    take: 1000,
  });
  return authors.map(toPersonOption);
}

export function toPersonOption(a: { id: string; name: string; email: string }): PersonOption {
  return { id: a.id, label: displayName(a), email: a.email };
}
