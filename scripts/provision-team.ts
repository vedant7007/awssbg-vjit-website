/*
 * Provision login accounts for the whole roster. Run with: pnpm provision
 *
 * For every captain / lead / core member in src/lib/constants/team.ts this:
 *   - creates (or updates) a Firebase Email/Password account keyed by their
 *     handle → synthetic email (see src/lib/constants/auth.ts),
 *   - upserts their `members` doc (team, role, socials, photo) so the task
 *     system and profile work immediately,
 *   - reserves their username, and sets the admin claim on the captain.
 *
 * It writes (all gitignored, in secrets/): a CSV, a branded printable HTML
 * sheet, and — when Playwright's Chromium is installed — a real PDF of every
 * person's handle + starting password to hand out. Each account is flagged
 * `mustChangePassword`, so everyone is forced through /welcome to set their
 * own password on first sign-in. Idempotent — safe to re-run; it resets the
 * password to the standard format (and re-arms the first-login step) each time.
 *
 * Requires secrets/service-account.json (same as `pnpm seed`).
 * NOTE: enable the Email/Password provider in Firebase console → Authentication
 * → Sign-in method, or the logins won't work.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import { CAPTAIN, LEADS, CORE, TEAMS } from "../src/lib/constants/team";
import type { RosterMember, TeamKey } from "../src/lib/constants/team";
import type { MemberRole } from "../src/lib/types/member";
import { MEMBER_EMAIL_DOMAIN } from "../src/lib/constants/auth";

const KEY_PATH = resolve(process.cwd(), "secrets/service-account.json");
const OUT_PATH = resolve(process.cwd(), "secrets/team-credentials.csv");
const HTML_PATH = resolve(process.cwd(), "secrets/team-credentials.html");
const PDF_PATH = resolve(process.cwd(), "secrets/team-credentials.pdf");

function initApp(): App {
  if (getApps().length > 0) return getApps()[0]!;
  if (!existsSync(KEY_PATH)) {
    console.error(`Missing service account key at ${KEY_PATH}.`);
    process.exit(1);
  }
  return initializeApp({
    credential: cert(JSON.parse(readFileSync(KEY_PATH, "utf8"))),
  });
}

const app = initApp();
const db = getFirestore(app);
const auth = getAuth(app);
const now = FieldValue.serverTimestamp();

const TEAM_LABEL: Record<TeamKey, string> = Object.fromEntries(
  TEAMS.map((t) => [t.key, t.label]),
) as Record<TeamKey, string>;

/** `team@firstname123` — memorable starting password. Falls back to the handle
 * when a first name is too short (initials) to stay non-trivial. */
function passwordFor(member: RosterMember): string {
  const first = (member.name.trim().split(/\s+/)[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const namePart = first.length >= 3 ? first : member.handle.toLowerCase();
  return `${member.team}@${namePart}123`;
}

function socialsOf(m: RosterMember): Record<string, string> {
  const out: Record<string, string> = {};
  if (m.socials.github) out.github = m.socials.github;
  if (m.socials.linkedin) out.linkedin = m.socials.linkedin;
  if (m.socials.instagram) out.website = m.socials.instagram;
  return out;
}

async function ensureAuthUser(
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName });
    return existing.uid;
  } catch {
    const created = await auth.createUser({ email, password, displayName });
    return created.uid;
  }
}

async function reserveUsername(username: string, uid: string): Promise<void> {
  await db.collection("usernames").doc(username).set({ uid }, { merge: true });
}

type Row = {
  name: string;
  handle: string;
  password: string;
  team: string;
  role: MemberRole;
};

async function provision(
  member: RosterMember,
  role: MemberRole,
  isAdmin: boolean,
): Promise<Row> {
  const username = member.handle.trim().toLowerCase();
  const email = `${username}@${MEMBER_EMAIL_DOMAIN}`;
  const password = passwordFor(member);
  const team = TEAM_LABEL[member.team] ?? member.team;

  const uid = await ensureAuthUser(email, password, member.name);

  if (isAdmin) {
    await auth.setCustomUserClaims(uid, { admin: true });
    await db
      .collection("admin_users")
      .doc(uid)
      .set(
        { id: uid, email, grantedBy: "provision", grantedAt: now },
        { merge: true },
      );
  }

  await db
    .collection("members")
    .doc(uid)
    .set(
      {
        id: uid,
        username,
        displayName: member.name,
        email,
        photoURL: member.photo ?? null,
        role,
        team,
        cohortYear: 2026,
        batchYear: 2028,
        branch: member.branch ?? "",
        bio: member.bio ?? "",
        skills: [],
        socials: socialsOf(member),
        isPublic: true,
        // Force the /welcome set-password step on their first sign-in.
        mustChangePassword: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  await reserveUsername(username, uid);

  return { name: member.name, handle: username, password, team, role };
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

/** A branded, print-ready credentials sheet — one cut-out card per member. */
function buildCredentialsHtml(rows: Row[]): string {
  const cards = rows
    .map(
      (r) => `
      <div class="card">
        <div class="card-top">
          <span class="name">${esc(r.name)}</span>
          <span class="team">${esc(r.team)}</span>
        </div>
        <div class="rolerow">${esc(r.role === "core" ? "Group Leader" : r.role === "lead" ? "Team Lead" : "Core Member")}</div>
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
async function renderPdf(html: string): Promise<boolean> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({ path: PDF_PATH, format: "A4", printBackground: true });
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

async function main(): Promise<void> {
  console.info("Provisioning team accounts...");
  const rows: Row[] = [];

  rows.push(await provision(CAPTAIN, "core", true));
  for (const lead of LEADS) rows.push(await provision(lead, "lead", false));
  for (const core of CORE) rows.push(await provision(core, "member", false));

  const csv = [
    "name,handle,password,team,role",
    ...rows.map(
      (r) =>
        `"${r.name}","${r.handle}","${r.password}","${r.team}","${r.role}"`,
    ),
  ].join("\n");
  writeFileSync(OUT_PATH, csv + "\n", "utf8");

  const html = buildCredentialsHtml(rows);
  writeFileSync(HTML_PATH, html, "utf8");
  const pdf = await renderPdf(html);

  console.info(`\nProvisioned ${rows.length} accounts.`);
  console.info(`  CSV : ${OUT_PATH}`);
  console.info(`  HTML: ${HTML_PATH}`);
  console.info(
    pdf
      ? `  PDF : ${PDF_PATH}  ← hand this out`
      : `  PDF : skipped — open the HTML and "Save as PDF"`,
  );
  console.info("(all gitignored). Login domain:", MEMBER_EMAIL_DOMAIN);
  console.info(
    "\nEveryone must set their own password on first sign-in (auto-enforced).",
  );
  console.info(
    "Remember: enable Email/Password sign-in in the Firebase console.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Provision failed:", error);
    process.exit(1);
  });
