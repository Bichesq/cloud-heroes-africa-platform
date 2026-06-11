"use client";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";

export default function InviteForm() {
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail]           = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const recaptchaRef                = useRef<ReCAPTCHA>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError("Please enter your invite code.");
      return;
    }

    // Get the reCAPTCHA token — null means the user hasn't ticked the box yet
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setError("Please complete the reCAPTCHA check.");
      return;
    }

    setLoading(true);

    try {
      // Verify token + invite code server-side
      const res = await fetch("/api/invite/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please try again.");
        recaptchaRef.current?.reset(); // reset checkbox so user can retry
        setLoading(false);
        return;
      }

      // Verification passed — proceed to Google OAuth
      await signIn("google", { callbackUrl: "/profile" });

    } catch {
      setError("Something went wrong. Please try again.");
      recaptchaRef.current?.reset();
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Invite code</label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="e.g. CHA-2025-XXXX"
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          required
        />
      </div>

      {/* reCAPTCHA v2 checkbox */}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium
                   hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Verifying..." : "Continue"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Can&apos;t access your account?{" "}
        <a href="/support" className="underline">Get help signing in</a>
      </p>
    </form>
  );
}