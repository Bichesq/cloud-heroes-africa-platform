import { describe, expect, it } from "vitest";
import { formatDate, formatUpdated, displayName } from "@/lib/format";
import { checkImage, detectImageKind, MAX_IMAGE_BYTES } from "@/lib/image-upload";
import { learnerProgramUrl } from "@/lib/learner-link";
import { capabilitiesFor, PROGRAM_ID_PATTERN, type ProgramRoles } from "@/lib/permissions";
import { isValidMediaKey } from "@/lib/storage";
import {
  addContributorSchema,
  personListChangeSchema,
  programSetupSchema,
  slugify,
} from "@/lib/validation";

const none: ProgramRoles = { isCreator: false, isInstructor: false, contributorRole: null, isDirector: false, isOwner: false };
const UUID = "5610a864-1e07-4426-aa5c-05bff48e17f7";

describe("program capabilities (plan §7)", () => {
  it("denies everything without a role", () => {
    expect(Object.values(capabilitiesFor(none)).some(Boolean)).toBe(false);
  });

  it("Director: everything, including Directors/Owners", () => {
    expect(capabilitiesFor({ ...none, isDirector: true })).toEqual({
      view: true,
      editSetup: true,
      changeCreator: true,
      manageContributors: true,
      manageDirectorsOwners: true,
    });
  });

  it("Owner: setup, Creator and Contributors — not Directors/Owners", () => {
    const c = capabilitiesFor({ ...none, isOwner: true });
    expect(c).toMatchObject({ view: true, editSetup: true, changeCreator: true, manageContributors: true });
    expect(c.manageDirectorsOwners).toBe(false);
  });

  it("Editor: edits setup but can't change the Creator or manage people", () => {
    const c = capabilitiesFor({ ...none, contributorRole: "editor" });
    expect(c).toEqual({ view: true, editSetup: true, changeCreator: false, manageContributors: false, manageDirectorsOwners: false });
  });

  it.each([
    ["reviewer", { ...none, contributorRole: "reviewer" as const }],
    ["viewer", { ...none, contributorRole: "viewer" as const }],
    ["instructor", { ...none, isInstructor: true }],
    ["creator only", { ...none, isCreator: true }],
  ])("%s: read-only", (_label, roles) => {
    expect(capabilitiesFor(roles)).toEqual({
      view: true,
      editSetup: false,
      changeCreator: false,
      manageContributors: false,
      manageDirectorsOwners: false,
    });
  });
});

describe("image upload validation", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);

  it("decides the type by magic bytes", () => {
    expect(detectImageKind(png)).toBe("png");
    expect(detectImageKind(jpg)).toBe("jpg");
    expect(detectImageKind(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageKind(new TextEncoder().encode("GIF89a"))).toBeNull();
  });

  it("rejects empty, oversized and non-image files", () => {
    expect(checkImage(new Uint8Array())).toMatchObject({ ok: false });
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(png);
    expect(checkImage(big)).toMatchObject({ ok: false });
    expect(checkImage(new TextEncoder().encode("%PDF-1.7"))).toMatchObject({ ok: false });
    expect(checkImage(png)).toEqual({ ok: true, kind: "png" });
  });
});

describe("media keys", () => {
  it("accepts only generated uuid.png/jpg keys", () => {
    expect(isValidMediaKey(`${UUID}.png`)).toBe(true);
    expect(isValidMediaKey(`${UUID}.jpg`)).toBe(true);
    expect(isValidMediaKey(`../${UUID}.png`)).toBe(false);
    expect(isValidMediaKey(`${UUID}.svg`)).toBe(false);
    expect(isValidMediaKey("..\\..\\.env")).toBe(false);
  });
});

describe("program setup input", () => {
  it("trims and accepts a valid form", () => {
    expect(programSetupSchema.parse({ title: "  Cloud Practitioner ", description: "Intro" })).toEqual({
      title: "Cloud Practitioner",
      description: "Intro",
    });
  });

  it("rejects short/long names, control characters and unknown keys", () => {
    expect(programSetupSchema.safeParse({ title: "ab", description: "" }).success).toBe(false);
    expect(programSetupSchema.safeParse({ title: "x".repeat(121), description: "" }).success).toBe(false);
    expect(programSetupSchema.safeParse({ title: "Bad\u0000name", description: "" }).success).toBe(false);
    expect(programSetupSchema.safeParse({ title: "Valid", description: "", published: true }).success).toBe(false);
  });

  it("allows newlines in descriptions", () => {
    expect(programSetupSchema.safeParse({ title: "Valid", description: "Line 1\nLine 2" }).success).toBe(true);
  });

  it("creatorAuthorId must be a uuid or empty", () => {
    expect(programSetupSchema.safeParse({ title: "Valid", description: "", creatorAuthorId: UUID }).success).toBe(true);
    expect(programSetupSchema.safeParse({ title: "Valid", description: "", creatorAuthorId: "" }).success).toBe(true);
    expect(programSetupSchema.safeParse({ title: "Valid", description: "", creatorAuthorId: "1 OR 1=1" }).success).toBe(false);
  });
});

describe("people inputs", () => {
  it("validates program id, author id, list and role", () => {
    expect(personListChangeSchema.safeParse({ programId: "cloud-practitioner", authorId: UUID, list: "director" }).success).toBe(true);
    expect(personListChangeSchema.safeParse({ programId: "../x", authorId: UUID, list: "director" }).success).toBe(false);
    expect(personListChangeSchema.safeParse({ programId: "cloud-practitioner", authorId: UUID, list: "admin" }).success).toBe(false);
    expect(addContributorSchema.safeParse({ programId: "cloud-practitioner", authorId: UUID, role: "owner" }).success).toBe(false);
    expect(addContributorSchema.safeParse({ programId: "cloud-practitioner", authorId: UUID, role: "editor", extra: 1 }).success).toBe(false);
  });
});

describe("slugify", () => {
  it("makes ids that match the program id pattern", () => {
    for (const title of ["Cloud Security Essentials", "  Été à Lagos!! ", "中文课程", "a".repeat(200), "---"]) {
      const slug = slugify(title);
      expect(PROGRAM_ID_PATTERN.test(slug)).toBe(true);
      expect(slug.length).toBeLessThanOrEqual(60);
    }
    expect(slugify("Cloud Security Essentials")).toBe("cloud-security-essentials");
    expect(slugify("Été à Lagos!!")).toBe("ete-a-lagos");
    expect(slugify("中文课程")).toBe("program");
  });
});

describe("display helpers", () => {
  it("formats Last Updated like the Figma", () => {
    const now = new Date(2026, 8, 28, 15, 0);
    expect(formatUpdated(new Date(2026, 8, 28, 9, 42), now)).toBe("Today, 09:42");
    expect(formatUpdated(new Date(2026, 8, 8, 12, 0), now)).toBe("Sep 8, 2026");
    expect(formatDate(new Date(2026, 7, 29))).toBe("Aug 29, 2026");
  });

  it("falls back to email when an author has no name", () => {
    expect(displayName({ name: " ", email: "a@b.co" })).toBe("a@b.co");
    expect(displayName({ name: "Ama Mensah", email: "a@b.co" })).toBe("Ama Mensah");
  });
});

describe("learner View link", () => {
  it("builds the program URL from an http(s) base only", () => {
    expect(learnerProgramUrl("cloud-practitioner", "http://localhost:3001")).toBe("http://localhost:3001/programs/cloud-practitioner");
    expect(learnerProgramUrl("x", "javascript:alert(1)")).toBeNull();
    expect(learnerProgramUrl("x", "not a url")).toBeNull();
    expect(learnerProgramUrl("x", "")).toBeNull();
  });
});
