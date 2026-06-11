import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, inviteCode } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "reCAPTCHA token missing." },
      { status: 400 }
    );
  }

  const isHuman = await verifyRecaptchaToken(token);

  if (!isHuman) {
    return NextResponse.json(
      { error: "reCAPTCHA verification failed. Please try again." },
      { status: 400 }
    );
  }

  if (!inviteCode?.trim()) {
    return NextResponse.json(
      { error: "Invite code is required." },
      { status: 400 }
    );
  }

  // TODO: validate inviteCode against DB/backend here
  // For now: any non-empty code passes

  return NextResponse.json({ ok: true });
}