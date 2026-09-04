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

import { CAPTAIN, LEADS, CORE } from "../src/lib/constants/team";
import type { RosterMember } from "../src/lib/constants/team";
import type { MemberRole } from "../src/lib/types/member";
import { MEMBER_EMAIL_DOMAIN } from "../src/lib/constants/auth";
import {
  TEAM_LABEL,
  passwordFor,
  buildCredentialsHtml,
  renderPdf,
  type Row,
} from "./credentials";

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
  const pdf = await renderPdf(html, PDF_PATH);

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
