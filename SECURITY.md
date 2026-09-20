# SECURITY.md - Secure Coding Standards

**Instruction to Claude / any AI coding assistant:** Reference this file before 
generating any code in this project. Every rule below applies to all code you 
write, regardless of which feature or file is being worked on. Flag and correct 
any code that violates these rules before presenting it as final - do not wait 
to be asked.

**Scope:** This file covers only practices implemented directly in application 
code. It intentionally excludes infrastructure and tooling (WAF, RASP, CAPTCHA, 
SIEM, dependency scanners, penetration testing) - those belong to deployment/
ops configuration, not the codebase itself.

---

## 1. Injection (SQL, Command, LDAP, NoSQL)

- Never concatenate or interpolate user input directly into a query, command, or filter string.
- Use parameterized queries / prepared statements for all SQL. Never build SQL via string formatting.
- For NoSQL, use the driver's native query object syntax with validated input.
- For LDAP, escape special characters (*, (, ), \, NUL) per RFC 4515.
- Never call shell/OS commands with user input. If unavoidable, use an allowlist and pass arguments as an array, not a concatenated string.
- Validate input type, length, and format (allowlist, not denylist) before it reaches any query or command layer.
- Apply least-privilege database credentials per operation.

## 2. Cross-Site Scripting (XSS)

- Never insert user-controlled data into HTML via raw string concatenation or unescaped interpolation.
- Use the framework's default auto-escaping (JSX, Jinja2 autoescape, Django templates, Vue/Angular) - never disable it.
- Never use dangerouslySetInnerHTML, innerHTML, document.write(), or eval() with user-originated data.
- Apply context-appropriate encoding: HTML entity encoding, JS string encoding, URL encoding - not interchangeable.
- Set a Content-Security-Policy header in application code, disallowing inline scripts and restricting script sources to trusted origins.
- Set cookies HttpOnly, Secure, SameSite=Strict.
- If rich text/HTML input is required, sanitize server-side with a vetted library (e.g., DOMPurify) against an explicit allowlist.

## 3. Broken Access Control / IDOR

- Never rely on client-side checks (hidden fields, disabled buttons, UI role flags) for authorization.
- For every resource fetch/update/delete, verify the authenticated user is permitted to access that specific object (ownership or role/permission check) - not just that they're logged in.
- Treat every ID in a URL, query param, or body as attacker-controlled input.
- Default to deny; explicitly grant access per resource/action.
- Apply checks at the data-access layer, not only route-level middleware - nested/indirect object references can bypass route-only checks.
- Use non-sequential, non-guessable IDs (UUIDs) as defense-in-depth - not a replacement for authorization checks.
- Apply identical authorization logic across all interfaces exposing the resource (REST, GraphQL, admin panel, exports).
- Log and alert on repeated authorization failures from a single user/session.

## 4. Authentication & Session Management

- Hash passwords with bcrypt, argon2, or scrypt. Never MD5, SHA1, unsalted SHA256, or plaintext.
- Never log, print, or return passwords or hashes in responses or debug output.
- Regenerate session ID on login and on any privilege change.
- Set auth cookies HttpOnly, Secure, SameSite=Strict/Lax. Never store tokens in localStorage/sessionStorage.
- Enforce token/session expiration server-side. Use short-lived access tokens with refresh tokens where applicable.
- Rate-limit and lock out login, password reset, and MFA endpoints at the application layer.
- Use generic error messages for failed logins - never reveal whether an email exists or why login failed.
- Invalidate all active sessions server-side on logout and password change.
- Password reset tokens must be single-use, time-limited, cryptographically random, and tied to the specific user.
- MFA must be verified server-side as a required flow step, not a client-side gate.

## 5. Password Policy

- Enforce minimum length (12+ characters recommended) at registration and password change - validated server-side, not just via client-side hints.
- Reject common/breached passwords via a check against a known-weak-password list, rather than relying on arbitrary character-class rules alone.
- Enforce uniqueness against the user's previous N password hashes on password changes, to prevent immediate reuse.
- Reject passwords matching the user's email, username, or other profile fields at validation time.
- Apply the same validation function on both registration and password-reset code paths - do not duplicate logic that can drift out of sync.

## 6. Honeypot Fields (Anti-Bot, Code-Level)

- Add a hidden form field (invisible via CSS, not `type="hidden"`, so bots that parse the DOM still fill it) to login/signup/comment forms.
- On submission, if the honeypot field is non-empty, silently reject or discard the request server-side rather than returning an error - do not reveal to the bot that it was detected.
- Never rely on the honeypot field alone as the sole anti-automation defense - combine with rate limiting (below).
- Avoid obviously identifiable field names (e.g., `honeypot`, `bot_trap`) that automated tools may learn to skip.

## 7. Rate Limiting (Application-Layer)

- Implement request throttling in application code/middleware for authentication-sensitive endpoints - do not assume this is fully handled at the infrastructure layer.
- Track attempts per identifier (account, IP, and device fingerprint combined where possible - IP alone is insufficient behind shared NATs/proxies).
- Apply exponential backoff or temporary lockout once a threshold is exceeded. Default thresholds unless a specific value is provided elsewhere in the project:
  - **Login:** 5 failed attempts per account per 15 minutes → lock for 15 minutes, doubling on repeated violations, capped at 24 hours.
  - **Password reset request:** 3 requests per account per hour; 10 per IP per hour.
  - **MFA verification:** 5 failed attempts per session → invalidate the session and require re-login.
  - **Signup:** 5 accounts per IP per hour.
  - **General authenticated API endpoints:** a sane per-user request cap appropriate to the endpoint (e.g., 60–100 requests/minute) to blunt scripted abuse; adjust per feature.
- Lock based on the account identifier where the endpoint is account-scoped (login, MFA) - locking by IP alone allows attackers to rotate IPs, and locking only by account allows attackers to distribute load across many accounts from one IP, so combine both where feasible.
- Ensure rate-limit logic fails closed (blocks the request) if the rate-limit store/check is unavailable, rather than defaulting to allow.
- Return generic responses when a limit is hit - don't reveal exact remaining attempts or precise reset timing beyond a coarse retry-after value.

## 8. Insecure Deserialization

- Never deserialize untrusted data using formats that can execute code (pickle, Java Serializable/ObjectInputStream, PHP unserialize(), Ruby Marshal.load, unsafe YAML load).
- Prefer JSON or plain XML (no external entities) for data crossing a trust boundary.
- Validate deserialized data against an explicit schema (JSON Schema, Pydantic, Joi, Zod) immediately after parsing.
- Restrict complex-object serialization formats to trusted, authenticated internal sources only.
- Always use the safe/restricted YAML loader (e.g., yaml.safe_load).
- Disable external entity resolution (XXE) and external DTD loading when parsing XML.
- The safeguard must be in the deserialization method itself, not applied after deserialization completes.
- Run deserialization processes with least privilege (minimal filesystem/network access).

## 9. Server-Side Request Forgery (SSRF)

- Never pass a user-supplied URL directly to an HTTP client without validation.
- Allow only http/https schemes; reject file://, ftp://, gopher://, dict://, etc.
- Resolve hostname to IP before connecting; block loopback (127.0.0.0/8), link-local (169.254.0.0/16, includes cloud metadata), and private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16). Check after DNS resolution to prevent rebinding bypass.
- Prefer an allowlist of permitted destination domains over a denylist.
- Disable auto-redirect-following, or re-validate the destination after each redirect.
- Set strict timeouts and response size limits on outbound requests.
- Never expose raw response body/headers from the fetched resource back to the user unfiltered.

## 10. Input Validation

- Validate all input server-side regardless of client-side validation.
- Use allowlist (positive) validation - define what's valid, reject everything else.
- Never sanitize-and-continue on malformed input. Reject it outright with a generic error.
- Enforce strict types/constraints per field (regex for emails, range for numeric IDs, exact-set check for enums, max length for strings).
- Validate structure against an explicit schema before accessing individual fields.
- Validate file uploads by content (magic bytes), not filename extension. Enforce size limits; store outside web root with randomized filenames.
- Treat headers and cookies as untrusted input subject to the same validation.
- Fail closed - reject input if validation is ambiguous, unavailable, or errors out.
- Return generic validation errors that don't leak internal logic or format details.

## 11. Secure Configuration in Code

- Never call eval(), exec(), Function() constructors, or dynamic code execution with data from user input, even indirectly.
- Disable/remove unused services, debug consoles, and dev-mode features before production.
- Never expose stack traces, DB errors, file paths, or exception details to end users - log internally, return generic errors.
- Run processes and service accounts with least privilege (no root/admin; scoped DB and filesystem permissions).
- Never hardcode credentials/API keys/secrets in code or committed config. Load from environment variables or a secrets manager.
- Set secure defaults for all framework/library config - no wildcard CORS on authenticated endpoints, HTTPS-only, disabled directory listing, disabled XXE.
- Remove or restrict unused HTTP methods and endpoints (e.g., disable TRACE, unused admin routes).
- Keep configuration environment-specific and explicit - production must never silently inherit permissive dev settings.

---

## How this file is used

This file is the standing security reference for all code generated in this 
project. It is checked before writing code, not after. Any code that violates 
a rule above should be flagged and corrected before being presented as final, 
regardless of whether the request explicitly mentioned security.
