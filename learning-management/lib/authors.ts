import { prisma } from "@/lib/prisma";
import type { AllowedIdentity } from "@/lib/tenant";

/* LpAuthor upsert on sign-in (mirrors the Student upsert-on-login pattern in
 * the learner apps). The Entra object id is the stable identity: an existing
 * author row already bound to a DIFFERENT oid is refused rather than
 * silently re-bound — that would let a re-issued email take over someone
 * else's program roles. Returns null when sign-in must be denied. */
export async function upsertAuthorOnSignIn(identity: AllowedIdentity): Promise<{ id: string } | null> {
  const existing = await prisma.lpAuthor.findUnique({ where: { email: identity.email } });

  if (existing) {
    if (existing.entraOid && existing.entraOid !== identity.oid) return null;
    return prisma.lpAuthor.update({
      where: { id: existing.id },
      data: {
        entraOid: existing.entraOid ?? identity.oid,
        name: identity.name || existing.name,
      },
      select: { id: true },
    });
  }

  // Same oid under a new email (renamed account) → keep the one author row.
  const byOid = await prisma.lpAuthor.findUnique({ where: { entraOid: identity.oid } });
  if (byOid) {
    return prisma.lpAuthor.update({
      where: { id: byOid.id },
      data: { email: identity.email, name: identity.name || byOid.name },
      select: { id: true },
    });
  }

  return prisma.lpAuthor.create({
    data: { email: identity.email, entraOid: identity.oid, name: identity.name },
    select: { id: true },
  });
}

/** Development-only (lib/dev-login.ts): create/find the author by email.
 * Never touches entraOid, so a real Microsoft sign-in later binds it. */
export async function upsertDevAuthor(email: string): Promise<{ id: string } | null> {
  return prisma.lpAuthor.upsert({
    where: { email },
    create: { email },
    update: {},
    select: { id: true },
  });
}

export async function findAuthorIdByEmail(email: string): Promise<string | null> {
  const row = await prisma.lpAuthor.findUnique({ where: { email }, select: { id: true } });
  return row?.id ?? null;
}
