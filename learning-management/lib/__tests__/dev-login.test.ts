import { describe, expect, it } from "vitest";
import {
  assertDevLoginNotInProduction,
  devAllowedEmails,
  isDevLoginEnabled,
  resolveDevLoginEmail,
} from "@/lib/dev-login";

const dev = { NODE_ENV: "development", LM_DEV_LOGIN: "1", LM_DEV_EMAILS: "bichesq@gmail.com, Other@Example.com" };

describe("dev login guards (development-only email sign-in)", () => {
  it("is enabled only in non-production with LM_DEV_LOGIN=1", () => {
    expect(isDevLoginEnabled(dev)).toBe(true);
    expect(isDevLoginEnabled({ ...dev, LM_DEV_LOGIN: undefined })).toBe(false);
    expect(isDevLoginEnabled({ ...dev, LM_DEV_LOGIN: "true" })).toBe(false);
    expect(isDevLoginEnabled({ ...dev, NODE_ENV: "production" })).toBe(false);
  });

  it("accepts only listed emails, case-insensitively", () => {
    expect(resolveDevLoginEmail(" BichesQ@Gmail.com ", dev)).toBe("bichesq@gmail.com");
    expect(resolveDevLoginEmail("other@example.com", dev)).toBe("other@example.com");
    expect(resolveDevLoginEmail("someone@else.com", dev)).toBeNull();
    expect(resolveDevLoginEmail(undefined, dev)).toBeNull();
    expect(resolveDevLoginEmail(["bichesq@gmail.com"], dev)).toBeNull();
  });

  it("accepts nobody when disabled, in production, or with an empty list", () => {
    expect(resolveDevLoginEmail("bichesq@gmail.com", { ...dev, NODE_ENV: "production" })).toBeNull();
    expect(resolveDevLoginEmail("bichesq@gmail.com", { ...dev, LM_DEV_LOGIN: "0" })).toBeNull();
    expect(resolveDevLoginEmail("bichesq@gmail.com", { ...dev, LM_DEV_EMAILS: "" })).toBeNull();
  });

  it("ignores malformed allowlist entries", () => {
    expect([...devAllowedEmails({ LM_DEV_EMAILS: "ok@x.io, not-an-email, ,@nope" })]).toEqual(["ok@x.io"]);
  });

  it("refuses to start if the flag leaks into production", () => {
    expect(() => assertDevLoginNotInProduction({ NODE_ENV: "production", LM_DEV_LOGIN: "1" })).toThrow();
    expect(() => assertDevLoginNotInProduction({ NODE_ENV: "production", LM_DEV_LOGIN: "0" })).toThrow();
    expect(() => assertDevLoginNotInProduction({ NODE_ENV: "production" })).not.toThrow();
    expect(() => assertDevLoginNotInProduction(dev)).not.toThrow();
  });
});
