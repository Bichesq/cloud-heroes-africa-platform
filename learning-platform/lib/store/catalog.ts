import type { KnowledgeCheck, LpAssessment, LpProgram } from "@/types";
import { readStore } from "./json-store";

/* Published learning content, authored by Learning Management. LP only
 * reads it (requirement §11.2). */

export async function getPrograms(): Promise<LpProgram[]> {
  const programs = await readStore<LpProgram>("lp-programs.json");
  return programs.filter((p) => p.published);
}

export async function getProgram(programId: string): Promise<LpProgram | null> {
  const programs = await getPrograms();
  return programs.find((p) => p.id === programId) ?? null;
}

export async function getKnowledgeCheck(
  kcId: string
): Promise<KnowledgeCheck | null> {
  const kcs = await readStore<KnowledgeCheck>("lp-knowledge-checks.json");
  return kcs.find((k) => k.id === kcId) ?? null;
}

export async function getAssessments(): Promise<LpAssessment[]> {
  return readStore<LpAssessment>("lp-assessments.json");
}

export async function getAssessment(id: string): Promise<LpAssessment | null> {
  const all = await getAssessments();
  return all.find((a) => a.id === id) ?? null;
}

/** Readiness assessments attached to a program (kind = "readiness"). */
export async function getReadinessAssessments(
  programId: string
): Promise<LpAssessment[]> {
  const all = await getAssessments();
  return all.filter(
    (a) => a.kind === "readiness" && a.scope === "program" && a.scopeId === programId
  );
}
