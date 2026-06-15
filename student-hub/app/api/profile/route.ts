import { getSession } from "@/lib/auth";
import { getStudent, updateStudentProfile } from "@/lib/mock-api";
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
  const updated = await updateStudentProfile(session.user.email, body);

  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, student: updated });
}