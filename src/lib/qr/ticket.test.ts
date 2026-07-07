/**
 * Sanity tests for src/lib/qr/ticket.ts
 *
 * Run with: npx cross-env TICKET_SECRET=test-secret-that-is-long-enough-for-hmac tsx src/lib/qr/ticket.test.ts
 *
 * These tests use only Node.js built-ins (node:test + node:assert) so no
 * additional test framework is required. They exercise the public API
 * surface of generateTicketCode, verifyTicketCode, and
 * generateTicketQrImage.
 */

// The "server-only" import guard throws in browser environments. In Node.js
// (tsx / ts-node) it is a no-op, so tests run cleanly without a Next.js
// build context.

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { generateTicketCode, verifyTicketCode, generateTicketQrImage } from "./ticket";

describe("generateTicketCode", () => {
  it("returns a dot-separated three-part token", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    const parts = code.split(".");
    assert.equal(parts.length, 3, "token must have three dot-separated parts");
  });

  it("encodes the registrationId and eventId in the token", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    assert.ok(
      code.startsWith("reg-abc.evt-xyz."),
      "token must start with the payload",
    );
  });

  it("produces different tokens for different registrations", () => {
    const a = generateTicketCode("reg-1", "evt-1");
    const b = generateTicketCode("reg-2", "evt-1");
    assert.notEqual(a, b, "distinct inputs must produce distinct tokens");
  });

  it("throws when registrationId is empty", () => {
    assert.throws(
      () => generateTicketCode("", "evt-1"),
      /non-empty/,
      "empty registrationId must throw",
    );
  });

  it("throws when eventId is empty", () => {
    assert.throws(
      () => generateTicketCode("reg-1", ""),
      /non-empty/,
      "empty eventId must throw",
    );
  });
});

describe("verifyTicketCode", () => {
  it("returns the decoded identifiers for a valid code", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    const result = verifyTicketCode(code);
    assert.deepEqual(result, { registrationId: "reg-abc", eventId: "evt-xyz" });
  });

  it("returns null for a tampered signature", () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    const tampered = code.slice(0, -3) + "XXX";
    assert.equal(verifyTicketCode(tampered), null, "tampered code must fail");
  });

  it("returns null for a token with fewer than three parts", () => {
    assert.equal(verifyTicketCode("reg-abc.evt-xyz"), null);
  });

  it("returns null for a token with more than three parts", () => {
    assert.equal(verifyTicketCode("a.b.c.d"), null);
  });

  it("returns null for an empty string", () => {
    assert.equal(verifyTicketCode(""), null);
  });

  it("returns null when parts are present but any segment is empty", () => {
    // Construct a three-part token with an empty registrationId segment.
    assert.equal(verifyTicketCode(".evt-xyz.somesig"), null);
  });

  it("round-trips: generate then verify matches original ids", () => {
    const pairs: Array<[string, string]> = [
      ["user-001", "event-spring-2026"],
      ["a", "b"],
      ["very-long-registration-id-12345", "evt-annual-hackathon-2026"],
    ];
    for (const [regId, evtId] of pairs) {
      const code = generateTicketCode(regId, evtId);
      const result = verifyTicketCode(code);
      assert.deepEqual(result, { registrationId: regId, eventId: evtId });
    }
  });
});

describe("generateTicketQrImage", () => {
  let dataUrl: string;

  before(async () => {
    const code = generateTicketCode("reg-abc", "evt-xyz");
    dataUrl = await generateTicketQrImage(code);
  });

  it("returns a data URI with the correct prefix", () => {
    assert.ok(
      dataUrl.startsWith("data:image/png;base64,"),
      "result must be a PNG data URI",
    );
  });

  it("produces a non-trivially sized base64 payload", () => {
    const base64Part = dataUrl.split(",")[1] ?? "";
    assert.ok(base64Part.length > 100, "base64 payload must be non-trivial");
  });
});
