import { describe, it, expect } from "vitest";

import { canAssignToTeam, type Viewer } from "./viewer";

const base: Viewer = {
  uid: "u1",
  name: "Lead One",
  isAdmin: false,
  isLead: false,
  team: "Tech",
  hasProfile: true,
};

describe("canAssignToTeam", () => {
  it("lets an admin assign to any team", () => {
    const admin = { ...base, isAdmin: true, team: null };
    expect(canAssignToTeam(admin, "Design")).toBe(true);
    expect(canAssignToTeam(admin, null)).toBe(true);
  });

  it("lets a lead assign only within their own team", () => {
    const lead = { ...base, isLead: true, team: "Tech" };
    expect(canAssignToTeam(lead, "Tech")).toBe(true);
    expect(canAssignToTeam(lead, "Design")).toBe(false);
    expect(canAssignToTeam(lead, null)).toBe(false);
  });

  it("blocks a plain member entirely", () => {
    expect(canAssignToTeam(base, "Tech")).toBe(false);
  });
});
