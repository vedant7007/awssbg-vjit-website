/*
 * One-off data repair. Enforces "one identity per person = the provisioned
 * handle account" and closes stray-admin loopholes.
 *
 *   pnpm repair          → dry run, prints the plan, changes nothing
 *   pnpm repair --apply  → applies it
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { MEMBER_EMAIL_DOMAIN } from "../src/lib/constants/auth";

const APPLY = process.argv.includes("--apply");
const KEY = resolve(process.cwd(), "secrets/service-account.json");
if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(readFileSync(KEY, "utf8"))) });
}
const db = getFirestore();
const auth = getAuth();

/** Name tokens ignoring middle initials, so "Vedant M Idlgave" == "Vedant Idlgave". */
const nameKey = (n: string): string =>
  n
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .sort()
    .join(" ");

async function main() {
  const users = (await auth.listUsers(500)).users;
  const provisioned = new Set(
    users
      .filter((u) => (u.email ?? "").endsWith(`@${MEMBER_EMAIL_DOMAIN}`))
      .map((u) => u.uid),
  );
  const emailOf = new Map(users.map((u) => [u.uid, u.email ?? "?"]));

  const memberSnap = await db.collection("members").get();
  const members = memberSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      displayName: typeof data.displayName === "string" ? data.displayName : "",
      username: typeof data.username === "string" ? data.username : "",
    };
  });

  const keep = members.filter((m) => provisioned.has(m.id));
  const drop = members.filter((m) => !provisioned.has(m.id));

  const canonicalByName = new Map<string, { id: string; name: string }>();
  for (const m of keep) {
    canonicalByName.set(nameKey(String(m.displayName ?? "")), {
      id: m.id,
      name: String(m.displayName ?? ""),
    });
  }

  console.log(
    `Members: ${members.length}  keep(provisioned)=${keep.length}  remove=${drop.length}\n`,
  );
  console.log("--- MEMBER DOCS TO REMOVE ---");
  const remap = new Map<string, { id: string; name: string }>();
  for (const m of drop) {
    const match = canonicalByName.get(nameKey(String(m.displayName ?? "")));
    if (match) remap.set(m.id, match);
    console.log(
      `  ${m.id}  "${m.displayName}" (${emailOf.get(m.id) ?? "no auth user"})` +
        (match
          ? `  → merge into ${match.id} "${match.name}"`
          : `  → no counterpart (pure removal)`),
    );
  }

  console.log("\n--- TASK REASSIGNMENTS ---");
  const taskSnap = await db.collection("tasks").get();
  const taskFixes: { id: string; title: string; to: string; name: string }[] =
    [];
  const orphans: string[] = [];
  for (const d of taskSnap.docs) {
    const t = d.data();
    const uid = String(t.assigneeUid ?? "");
    if (provisioned.has(uid)) continue;
    const target = remap.get(uid);
    if (target) {
      taskFixes.push({
        id: d.id,
        title: String(t.title),
        to: target.id,
        name: target.name,
      });
      console.log(`  "${t.title}"  ${uid} → ${target.id} (${target.name})`);
    } else {
      orphans.push(`"${t.title}" assigneeUid=${uid}`);
    }
  }
  if (taskFixes.length === 0) console.log("  (none)");
  if (orphans.length) {
    console.log("\n  !! ORPHAN TASKS (left untouched, reassign by hand):");
    orphans.forEach((o) => console.log("    " + o));
  }

  console.log("\n--- ADMIN CLAIMS ---");
  const stripAdmin = users.filter(
    (u) => u.customClaims?.admin === true && !provisioned.has(u.uid),
  );
  users
    .filter((u) => u.customClaims?.admin === true && provisioned.has(u.uid))
    .forEach((u) => console.log(`  KEEP  admin: ${u.email}`));
  stripAdmin.forEach((u) =>
    console.log(`  STRIP admin: ${u.email}  (not a provisioned team account)`),
  );
  if (stripAdmin.length === 0) console.log("  (nothing to strip)");

  if (!APPLY) {
    console.log("\nDRY RUN — nothing changed. Re-run with --apply to execute.");
    return;
  }

  console.log("\nApplying...");
  for (const f of taskFixes) {
    await db.collection("tasks").doc(f.id).update({
      assigneeUid: f.to,
      assigneeName: f.name,
      updatedAt: Timestamp.now(),
    });
  }
  for (const m of drop) {
    const uname = String(m.username ?? "");
    if (uname) {
      const u = await db.collection("usernames").doc(uname).get();
      if (u.exists && u.data()?.uid === m.id) await u.ref.delete();
    }
    await db.collection("members").doc(m.id).delete();
  }
  for (const u of stripAdmin) {
    const { admin: _drop, ...rest } = u.customClaims ?? {};
    await auth.setCustomUserClaims(u.uid, rest);
    await db
      .collection("admin_users")
      .doc(u.uid)
      .delete()
      .catch(() => undefined);
  }
  console.log(
    `Done. tasks=${taskFixes.length} membersRemoved=${drop.length} adminsStripped=${stripAdmin.length}`,
  );
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
