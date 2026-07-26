/**
 * Tests for src/lib/qr/ticket.ts — signed ticket codes + QR rendering.
 * Run with `pnpm test`. TICKET_SECRET is provided by vitest.config.ts.
 */
import { describe, it, expect, beforeAll } from "vitest";

import {
  generateTicketCode,
  verifyTicketCode,
  generateTicketQrImage,
} from "./ticket";

describe("generateTicketCode", () => {
  it("returns a dot-separated three-part token", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    expect(code.split(".")).toHaveLength(3);
  });

  it("encodes the registrationId and eventId in the token", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    expect(code.startsWith("reg-abc.evt-xyz.")).toBe(true);
  });

  it("produces different tokens for different registrations", () => {
    expect(generateTicketCode("reg-1", "evt-1")).not.toBe(
      generateTicketCode("reg-2", "evt-1"),
    );
  });

  it("throws when registrationId is empty", () => {
    expect(() => generateTicketCode("", "evt-1")).toThrow(/non-empty/);
  });

  it("throws when eventId is empty", () => {
    expect(() => generateTicketCode("reg-1", "")).toThrow(/non-empty/);
  });
});

describe("verifyTicketCode", () => {
  it("returns the decoded identifiers for a valid code", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    expect(verifyTicketCode(code)).toEqual({
      registrationId: "reg-abc",
      eventId: "evt-xyz",
    });
  });

  it("returns null for a tampered signature", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    expect(verifyTicketCode(code.slice(0, -3) + "XXX")).toBeNull();
  });

  it("returns null for a token without exactly three parts", () => {
    expect(verifyTicketCode("reg-abc.evt-xyz")).toBeNull();
    expect(verifyTicketCode("a.b.c.d")).toBeNull();
    expect(verifyTicketCode("")).toBeNull();
  });

  it("returns null when any segment is empty", () => {
    expect(verifyTicketCode(".evt-xyz.somesig")).toBeNull();
  });

  it("round-trips a variety of ids", () => {
    const pairs: Array<[string, string]> = [
      ["user-001", "event-spring-2026"],
      ["a", "b"],
      ["very-long-registration-id-12345", "evt-annual-hackathon-2026"],
    ];
    for (const [registrationId, eventId] of pairs) {
      const code = generateTicketCode(registrationId, eventId);
      expect(verifyTicketCode(code)).toEqual({ registrationId, eventId });
    }
  });
});

describe("generateTicketQrImage", () => {
  let dataUrl: string;

  beforeAll(async () => {
    dataUrl = await generateTicketQrImage(
      generateTicketCode("reg-abc", "evt-xyz"),
    );
  });

  it("returns a PNG data URI", () => {
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("produces a non-trivial base64 payload", () => {
    expect((dataUrl.split(",")[1] ?? "").length).toBeGreaterThan(100);
  });
});
