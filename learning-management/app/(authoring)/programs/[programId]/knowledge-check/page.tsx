import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";

/* Sidebar "Knowledge Check" without a unit: open the program's first unit's
 * Knowledge Check (Associated Unit then switches between units). */
export default async function KnowledgeCheckIndex({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  await requireProgramPage(programId);
  const first = await prisma.lpUnit.findFirst({
    where: { module: { programId } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  redirect(first ? `/programs/${programId}/knowledge-check/${first.id}` : `/programs/${programId}/structure`);
}
