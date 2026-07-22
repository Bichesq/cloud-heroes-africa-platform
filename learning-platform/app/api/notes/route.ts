import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getNote, saveNote } from "@/lib/store/notes";

const saveNoteSchema = z.strictObject({
  unitId: z.string().min(1),
  body: z.string().max(20000, "Too long"),
});

export async function GET(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unitId = new URL(request.url).searchParams.get("unitId");
  if (!unitId) return NextResponse.json({ error: "unitId required" }, { status: 400 });

  const note = await getNote(student.id, unitId);
  return NextResponse.json(note ?? { unitId, body: "", updatedAt: null });
}

export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = saveNoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }

  const note = await saveNote(student.id, parsed.data.unitId, parsed.data.body);
  return NextResponse.json(note);
}
