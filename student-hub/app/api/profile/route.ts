import { getSession } from "@/lib/auth";
import { saveStudent, getStudent } from "@/lib/mock-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const student = await getStudent(session.user.email);
  return NextResponse.json({ student });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();

  await saveStudent({
    email: session.user.email,
    given_name: session.user.given_name,
    family_name: session.user.family_name,
    ...body,
  });

  return NextResponse.json({ ok: true });
}