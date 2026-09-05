/*
 * Regenerate the credentials handouts (branded HTML + real PDF) from the
 * roster — no Firebase, no account changes, no password resets. The starting
 * passwords are deterministic (see credentials.ts), so this reproduces exactly
 * what provisioning set without touching anyone's account.
 *
 * Writes one PDF per team (so each lead only ever handles their own people's
 * passwords) plus a combined sheet for the group leader.
 *
 * Run with: pnpm credentials
 * Output (gitignored): secrets/credentials/
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { CAPTAIN, LEADS, CORE } from "../src/lib/constants/team";
import {
  rowFor,
  buildCredentialsHtml,
  renderPdf,
  type Row,
} from "./credentials";

const OUT_DIR = resolve(process.cwd(), "secrets/credentials");

/** "Event Management" → "event-management" */
const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function write(rows: Row[], name: string, heading?: string) {
  const html = buildCredentialsHtml(rows, heading);
  const ok = await renderPdf(html, resolve(OUT_DIR, `${name}.pdf`));
  // PDF is the deliverable. Only fall back to an HTML file if the PDF could
  // not be rendered (no Chromium), so there's always something to hand out.
  if (!ok) writeFileSync(resolve(OUT_DIR, `${name}.html`), html, "utf8");
  console.info(
    `  ${ok ? "PDF " : "HTML"}  ${name.padEnd(20)} ${String(rows.length).padStart(2)} member${rows.length === 1 ? "" : "s"}`,
  );
  return ok;
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });

  const rows: Row[] = [
    rowFor(CAPTAIN, "core"),
    ...LEADS.map((l) => rowFor(l, "lead")),
    ...CORE.map((c) => rowFor(c, "member")),
  ];

  // Group by team label, leads first so each sheet starts with the lead.
  const byTeam = new Map<string, Row[]>();
  for (const r of rows) {
    byTeam.set(r.team, [...(byTeam.get(r.team) ?? []), r]);
  }
  const rank = { core: 0, lead: 1, member: 2, alumni: 3 } as const;
  for (const list of byTeam.values()) {
    list.sort(
      (a, b) => rank[a.role] - rank[b.role] || a.name.localeCompare(b.name),
    );
  }

  console.info(`Credentials for ${rows.length} members → ${OUT_DIR}\n`);
  await write(rows, "all-teams", "Everyone");
  for (const [team, list] of [...byTeam.entries()].sort()) {
    await write(list, slug(team), team);
  }

  console.info(
    "\nOne sheet per team — hand each lead only their own team's file.",
  );
  console.info("Gitignored: these contain starting passwords. Keep private.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Credentials generation failed:", error);
    process.exit(1);
  });
