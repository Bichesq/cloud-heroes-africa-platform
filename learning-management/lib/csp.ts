/* Content-Security-Policy for every response (SECURITY.md §2: set in
 * application code, no inline scripts, scripts only from trusted origins).
 * Nonce-based: the proxy generates a fresh nonce per request and Next.js
 * applies it to its own scripts. Dev additionally needs 'unsafe-eval' for
 * React/Next dev tooling. Pure — unit-tested. */

export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // HeroUI / React Aria set inline style attributes for positioning.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // Sign-in posts to our own /api/auth, then redirects to Microsoft.
    "form-action 'self' https://login.microsoftonline.com",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
