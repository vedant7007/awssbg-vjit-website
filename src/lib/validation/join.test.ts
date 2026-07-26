import { describe, it, expect } from "vitest";

import { joinSchema } from "./join";

const valid = {
  name: "Asha Rao",
  email: "Asha.Rao@Example.com",
  whatsapp: "+91 90000 00000",
  year: "2",
  branch: "CSE",
  section: "A",
  domains: ["Cloud Computing", "Web Development"],
  focusing: ["Learning new skills"],
  wants: ["Networking"],
  projects: "Yes",
  linkedin: "",
  github: "",
  learn: "Serverless and DynamoDB",
  why: "",
};

describe("joinSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(joinSchema.safeParse(valid).success).toBe(true);
  });

  it("normalizes the email to trimmed lowercase", () => {
    const parsed = joinSchema.parse(valid);
    expect(parsed.email).toBe("asha.rao@example.com");
  });

  it("rejects a malformed email", () => {
    expect(
      joinSchema.safeParse({ ...valid, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("requires at least one domain", () => {
    expect(joinSchema.safeParse({ ...valid, domains: [] }).success).toBe(false);
  });

  it("rejects an option value outside the allow-list", () => {
    expect(joinSchema.safeParse({ ...valid, branch: "HACK" }).success).toBe(
      false,
    );
    expect(
      joinSchema.safeParse({ ...valid, domains: ["Not A Real Domain"] })
        .success,
    ).toBe(false);
    expect(joinSchema.safeParse({ ...valid, year: "9" }).success).toBe(false);
  });

  it("caps free-text length", () => {
    expect(
      joinSchema.safeParse({ ...valid, name: "x".repeat(81) }).success,
    ).toBe(false);
    expect(
      joinSchema.safeParse({ ...valid, learn: "x".repeat(1001) }).success,
    ).toBe(false);
  });

  it("rejects a non-numeric WhatsApp value", () => {
    expect(
      joinSchema.safeParse({ ...valid, whatsapp: "call me maybe" }).success,
    ).toBe(false);
  });

  it("rejects duplicate-inflated domain arrays over the cap", () => {
    const tooMany = Array.from({ length: 50 }, () => "Cloud Computing");
    expect(joinSchema.safeParse({ ...valid, domains: tooMany }).success).toBe(
      false,
    );
  });
});
