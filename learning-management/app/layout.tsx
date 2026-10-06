import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Heroes Africa — Learning Management",
  description: "Internal authoring app for Cloud Heroes Africa programs",
};

/* Reading the per-request nonce (set by proxy.ts) makes every route
 * dynamically rendered, which is what lets Next.js stamp that nonce onto its
 * scripts — a statically prerendered page would carry no nonce and be
 * blocked by the CSP. Light theme only in sub-step 1 (the Figma theme toggle
 * arrives with the full shell); no inline theme script, so no inline JS. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers();
  return (
    <html lang="en" className="light" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
