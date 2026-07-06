import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { getStudent, updateStudentProfile } from "@/lib/mock-api";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const PUBLIC_PREFIX = "/uploads/avatars/";

/** Avatar upload — local-folder storage for the POC (swap for cloud later). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const student = await getStudent(session.user.email);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const ext = ACCEPTED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPG or PNG images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 2 MB or smaller." },
      { status: 400 }
    );
  }

  const filename = `${student.id}-${Date.now()}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer())
  );

  // Replace (don't accumulate) any previous local upload.
  if (student.avatarUrl?.startsWith(PUBLIC_PREFIX)) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", student.avatarUrl));
    } catch {
      // previous file already gone — nothing to clean up
    }
  }

  const avatarUrl = `${PUBLIC_PREFIX}${filename}`;
  const updated = await updateStudentProfile(session.user.email, { avatarUrl });
  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await logAudit({
    studentId: student.id,
    actor: session.user.email,
    actorRole: "student",
    action: "profile.avatar",
    changes: [{ field: "avatarUrl", from: student.avatarUrl ?? null, to: avatarUrl }],
  });

  return NextResponse.json({ ok: true, avatarUrl });
}
