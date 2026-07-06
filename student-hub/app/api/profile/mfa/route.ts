import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getStudent, updateStudentProfile } from "@/lib/mock-api";
import { logAudit } from "@/lib/audit";
import type { MfaMethod, Passkey } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/* MFA + passkey management. POC scope: records persist on the student
 * record and drive the derived mfaEnabled flag, but no OTP email is sent
 * and no WebAuthn ceremony runs. Sensitive actions (disable/remove) should
 * additionally require a recent re-auth / MFA challenge when the real
 * implementation lands. */

const actionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("add-email-method") }),
  z.strictObject({ action: z.literal("disable-method"), id: z.string().min(1) }),
  z.strictObject({
    action: z.literal("add-passkey"),
    label: z.string().trim().min(1).max(60),
  }),
  z.strictObject({ action: z.literal("remove-passkey"), id: z.string().min(1) }),
]);

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 3)}***@${domain}`;
}

const describeMethods = (methods: MfaMethod[]) =>
  methods.map((m) => `${m.method} (${m.identifier})`);
const describePasskeys = (passkeys: Passkey[]) => passkeys.map((p) => p.label);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid MFA action" }, { status: 400 });
  }

  const student = await getStudent(session.user.email);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const action = parsed.data;
  let mfaMethods = student.mfaMethods;
  let passkeys = student.passkeys;
  let auditAction: string;

  switch (action.action) {
    case "add-email-method": {
      if (mfaMethods.some((m) => m.active && m.method === "email")) {
        return NextResponse.json(
          { error: "Email MFA is already enabled." },
          { status: 409 }
        );
      }
      const method: MfaMethod = {
        id: randomUUID(),
        method: "email",
        transport: maskEmail(session.user.email),
        identifier: `MFA-${randomUUID().slice(0, 4).toUpperCase()}`,
        lastUsed: null,
        active: true,
        createdAt: now,
      };
      mfaMethods = [...mfaMethods, method];
      auditAction = "mfa.enable";
      break;
    }
    case "disable-method": {
      if (!mfaMethods.some((m) => m.id === action.id)) {
        return NextResponse.json({ error: "Method not found" }, { status: 404 });
      }
      mfaMethods = mfaMethods.filter((m) => m.id !== action.id);
      auditAction = "mfa.disable";
      break;
    }
    case "add-passkey": {
      const passkey: Passkey = {
        id: randomUUID(),
        label: action.label,
        registeredAt: now,
        lastUsed: null,
      };
      passkeys = [...passkeys, passkey];
      auditAction = "passkey.add";
      break;
    }
    case "remove-passkey": {
      if (!passkeys.some((p) => p.id === action.id)) {
        return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
      }
      passkeys = passkeys.filter((p) => p.id !== action.id);
      auditAction = "passkey.remove";
      break;
    }
  }

  const updated = await updateStudentProfile(session.user.email, {
    mfaMethods,
    passkeys,
  });
  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await logAudit({
    studentId: student.id,
    actor: session.user.email,
    actorRole: "student",
    action: auditAction,
    changes: [
      auditAction.startsWith("mfa")
        ? {
            field: "mfaMethods",
            from: describeMethods(student.mfaMethods),
            to: describeMethods(updated.mfaMethods),
          }
        : {
            field: "passkeys",
            from: describePasskeys(student.passkeys),
            to: describePasskeys(updated.passkeys),
          },
    ],
  });

  return NextResponse.json({ ok: true, student: updated });
}
