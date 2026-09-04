/*
 * Regenerate ONLY the credentials handout (branded HTML + real PDF) from the
 * roster — no Firebase, no account changes, no password resets. The starting
 * passwords are deterministic (see credentials.ts), so this reproduces exactly
 * what provisioning set, without touching anyone's account.
 *
 * Run with: pnpm credentials
 * Output (gitignored): secrets/team-credentials.pdf + .html
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

const SECRETS_DIR = resolve(process.cwd(), "secrets");
const HTML_PATH = resolve(SECRETS_DIR, "team-credentials.html");
const PDF_PATH = resolve(SECRETS_DIR, "team-credentials.pdf");

async function main(): Promise<void> {
  mkdirSync(SECRETS_DIR, { recursive: true });

  const rows: Row[] = [
    rowFor(CAPTAIN, "core"),
    ...LEADS.map((l) => rowFor(l, "lead")),
    ...CORE.map((c) => rowFor(c, "member")),
  ];

  const html = buildCredentialsHtml(rows);
  writeFileSync(HTML_PATH, html, "utf8");
  const pdf = await renderPdf(html, PDF_PATH);

  console.info(`Credentials sheet for ${rows.length} members.`);
  console.info(`  HTML: ${HTML_PATH}`);
  console.info(
    pdf
      ? `  PDF : ${PDF_PATH}  ← hand this out`
      : `  PDF : skipped — open the HTML and "Save as PDF"`,
  );
  console.info("(gitignored — contains starting passwords, keep it private).");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Credentials PDF failed:", error);
    process.exit(1);
  });
