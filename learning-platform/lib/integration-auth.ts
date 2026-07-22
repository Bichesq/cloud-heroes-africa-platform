import { NextResponse } from "next/server";
import { getStudent } from "@/lib/students";
import type { Student } from "@/types";

/* Server-to-server guard for /api/integration/* — Student Hub's widgets call
 * these with a shared header token and the student's email (no cookie
 * dependency). Temporary bridge until the shared Postgres backend lets every
 * surface query the same data directly (requirements §11.1/§12). */

export async function integrationStudent(
  request: Request
): Promise<Student | NextResponse> {
  const token = request.headers.get("x-integration-token");
  if (!process.env.INTEGRATION_TOKEN || token !== process.env.INTEGRATION_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const student = await getStudent(email);
  if (!student) {
    return NextResponse.json({ error: "Unknown student" }, { status: 404 });
  }
  return student;
}
