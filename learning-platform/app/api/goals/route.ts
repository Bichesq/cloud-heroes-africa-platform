import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getGoals, removeGoal, setGoal } from "@/lib/store/goals";

const setGoalSchema = z.strictObject({
  unitId: z.string().min(1),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

const removeGoalSchema = z.strictObject({
  unitId: z.string().min(1),
});

export async function GET() {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getGoals(student.id));
}

export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = setGoalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  }

  const goal = await setGoal(student.id, parsed.data.unitId, parsed.data.targetDate);
  return NextResponse.json(goal, { status: 201 });
}

export async function DELETE(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = removeGoalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await removeGoal(student.id, parsed.data.unitId);
  return NextResponse.json({ ok: true });
}
