/*
 * Shared, Firebase-free credential helpers: the deterministic starting
 * password and the branded printable HTML/PDF sheet. Used by both
 * provision-team.ts (full provision + reset) and credentials-pdf.ts
 * (regenerate the handout only, no accounts touched). Keeping them here means
 * the passwords on the printout can never drift from what provisioning sets.
 */
import { TEAMS } from "../src/lib/constants/team";
import type { RosterMember, TeamKey } from "../src/lib/constants/team";
import type { MemberRole } from "../src/lib/types/member";

export type Row = {
  name: string;
  handle: string;
  password: string;
  team: string;
  role: MemberRole;
};

export const TEAM_LABEL: Record<TeamKey, string> = Object.fromEntries(
  TEAMS.map((t) => [t.key, t.label]),
) as Record<TeamKey, string>;

/** `team@firstname123` — memorable starting password. Falls back to the handle
 * when a first name is too short (initials) to stay non-trivial. */
export function passwordFor(member: RosterMember): string {
  const first = (member.name.trim().split(/\s+/)[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const namePart = first.length >= 3 ? first : member.handle.toLowerCase();
  return `${member.team}@${namePart}123`;
}

/** A roster member → the credential row shown on the sheet. */
export function rowFor(member: RosterMember, role: MemberRole): Row {
  return {
    name: member.name,
    handle: member.handle.trim().toLowerCase(),
    password: passwordFor(member),
    team: TEAM_LABEL[member.team] ?? member.team,
    role,
  };
}

const esc = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      (
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }) as Record<string, string>
      )[c] ?? c,
  );

const roleLabel = (role: MemberRole): string =>
  role === "core"
    ? "Group Leader"
    : role === "lead"
      ? "Team Lead"
      : "Core Member";

/** A branded, print-ready credentials sheet — one cut-out card per member. */
export function buildCredentialsHtml(rows: Row[]): string {
  const cards = rows
    .map(
      (r) => `
      <div class="card">
        <div class="card-top">
          <span class="name">${esc(r.name)}</span>
          <span class="team">${esc(r.team)}</span>
        </div>
        <div class="rolerow">${esc(roleLabel(r.role))}</div>
        <div class="creds">
          <div class="cred"><span class="k">Handle</span><span class="v">${esc(r.handle)}</span></div>
          <div class="cred"><span class="k">Starting password</span><span class="v pw">${esc(r.password)}</span></div>
        </div>
        <div class="foot">Sign in at aws-sbg-vjit.vercel.app/signin — you'll set your own password on first login.</div>
      </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>AWS SBG VJIT — Team Credentials</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 12mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0b1220; background: #fff; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #FF9900; padding-bottom: 12px; margin-bottom: 18px; }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  .brand span { color: #FF9900; }
  .sub { font-size: 11px; color: #64748b; text-align: right; line-height: 1.5; }
  .intro { background: #fff7ec; border: 1px solid #ffd79a; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #7c5310; margin-bottom: 20px; line-height: 1.6; }
  .intro b { color: #b45309; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; break-inside: avoid; page-break-inside: avoid; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
  .card-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .name { font-size: 15px; font-weight: 700; }
  .team { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #fff; background: #FF9900; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
  .rolerow { font-size: 10px; color: #64748b; margin: 2px 0 10px; }
  .creds { display: grid; gap: 6px; }
  .cred { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border-radius: 7px; padding: 6px 10px; }
  .k { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .v { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 13px; font-weight: 600; }
  .v.pw { color: #b45309; }
  .foot { margin-top: 10px; font-size: 9px; color: #94a3b8; line-height: 1.4; }
</style></head>
<body>
  <div class="head">
    <div class="brand">AWS <span>SBG</span> VJIT</div>
    <div class="sub">Team access credentials<br>Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
  </div>
  <div class="intro">
    <b>How to sign in:</b> go to <b>aws-sbg-vjit.vercel.app/signin</b>, enter your handle and the starting password below.
    On your first sign-in you'll be asked to <b>set your own password</b> — after that, this sheet is no longer valid. Keep it private.
  </div>
  <div class="grid">${cards}</div>
</body></html>`;
}

/** Render the credentials HTML to a real PDF using the already-installed
 * Playwright Chromium. Best-effort — if the browser binary isn't present we
 * keep the HTML file (open it and "Save as PDF"). */
export async function renderPdf(
  html: string,
  pdfPath: string,
): Promise<boolean> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
    await browser.close();
    return true;
  } catch (e) {
    console.warn(
      "PDF render skipped (run `npx playwright install chromium` for a PDF):",
      e instanceof Error ? e.message : e,
    );
    return false;
  }
}
