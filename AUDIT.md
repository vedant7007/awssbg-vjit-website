# AWS SBG VJIT — Pre-Launch Audit & Completion Checklist

_Full-codebase audit across UX/content, security, data layer, frontend quality, and code health. Generated 2026-07-25._

**Overall verdict:** The site is in strong shape — real content, disciplined WebGL (code-split, mobile/reduced-motion gated), solid Firebase session auth, strict TypeScript, token-based theming. It is **~85% to "done."** The list below is finite. Fix the **P0 blockers** and you can launch with confidence; **P1** makes it professional; **P2/P3** are polish and future features.

Legend: `[ ]` todo · effort **S** (<30m) / **M** (~1–2h) / **L** (half-day+).

---

## P0 — Blockers (fix before calling it done)

- [ ] **Admin console is unguarded.** `src/app/admin/layout.tsx:25` has `requireAdmin` **commented out**, and no admin page re-checks. Any signed-in Google user can open `/admin/*` and read all member/event/project data (pages use the Admin SDK, bypassing Firestore rules). Writes are still protected, but read/enumeration is wide open. **Fix:** uncomment `requireAdmin` in the admin layout + add it per sensitive page as defense-in-depth. **[S]**
- [ ] **Public Join form has zero abuse protection.** `src/app/(marketing)/join/actions.ts:19` → `applications.ts:30` writes PII via Admin SDK (bypasses rules) with no rate limit, no CAPTCHA/honeypot, no length/enum caps. Scriptable DB-spam + oversized-doc vector. **Fix:** add a honeypot field + Cloudflare Turnstile (or reCAPTCHA), per-IP rate limit, and a `zod` schema with `.max()` on strings, array-size caps, and `z.enum()` for year/branch/section/domains (mirror `api/registration/route.ts`). **[M]**
- [ ] **`robots.txt` points crawlers at `localhost` and there's no sitemap.** `public/robots.txt:4` ships `Sitemap: http://localhost:3000/sitemap.xml`, which doesn't exist. Actively misdirects Google. **Fix:** delete the static file; add `src/app/robots.ts` + `src/app/sitemap.ts` deriving host from `NEXT_PUBLIC_SITE_URL` (enumerate static routes + event/team/project slugs). **[S]**
- [ ] **Three finished pages are orphaned** — `/services`, `/projects`, `/members` aren't in `NAV_LINKS`/`FOOTER_EXPLORE` (`src/lib/constants/nav.ts:6-23`); reachable only by typing the URL. **Fix:** add entry points (nav and/or footer), or fold Services into About. **[S]**
- [ ] **No error boundaries.** No `error.tsx`, `global-error.tsx`, or `loading.tsx` anywhere (only `not-found.tsx`). Any render/data error → Next's raw crash screen. **Fix:** add `src/app/error.tsx` + `src/app/global-error.tsx` (reuse `ErrorState`) and route-level `loading.tsx` for data-backed segments (reuse `RouteSkeleton`). **[M]**
- [ ] **PixelBlast leaks a WebGL context on unmount.** `src/components/motion/PixelBlast.tsx:618-633` — the cleanup returns early on the initial mount (`mustReinit` guard) before `cancelAnimationFrame`/`renderer.dispose()`/`forceContextLoss()` run. Navigating away leaks a GPU context (browsers cap ~16) and leaves the RAF loop alive. **Fix:** only skip disposal when a _new_ instance was created this effect run; always dispose on true unmount. **[M]**

---

## P1 — High (professional-grade / real correctness)

- [ ] **Member self-create allows impersonation.** `firestore.rules:27` — self-serve profile create doesn't constrain `role`/`team`/`isPublic`, so a tampered client can set `role: "captain"`, `team: "core"`, `isPublic: true` and appear as leadership on public pages (does NOT grant the admin claim). **Fix:** require `role == 'member'` and `team == null` on non-admin creates. **[S]**
- [ ] **Missing composite Firestore indexes.** `src/lib/firestore/events.ts` filters `category` + `orderBy(startAt)` (and with `status`), but `firestore.indexes.json` only has `status+startAt`. Category filters throw `FAILED_PRECONDITION` in prod. **Fix:** add `category+startAt` and `status+category+startAt`; deploy indexes. **[S]**
- [ ] **No per-page SEO metadata.** Marketing routes lack unique `metadata`/`generateMetadata` — everything inherits the default title/description; dynamic routes (`events/[slug]`, `projects/[slug]`, `m/[username]`, `team/[team]`) have no per-entity OG tags. Also fix the doubled title on Projects (`title: "Projects | AWS Student Builder Group"` + root template → triple brand). **Fix:** bare `title`+`description` per static page, `generateMetadata` for the four dynamic routes. **[M]**
- [ ] **No fail-fast env validation.** Env read ad-hoc as `process.env.X ?? ""` (`firebase/admin.ts`, `client.ts`, `email/resend.ts`, `qr/ticket.ts`); a missing var silently becomes `""` and fails deep. `zod` is already a dep. **Fix:** one validated env module imported at startup. **[M]**
- [ ] **No test pipeline.** Exactly one test (`src/lib/qr/ticket.test.ts`) with no runner, no `test` script, never run in CI. `playwright` is a dead devDependency. **Fix:** add vitest + `pnpm test`, port the ticket test, cover `submitApplication` + `src/lib/firestore/*`, add a test step to the `verify` CI job. **[L]**
- [ ] **`applications` has no admin read path.** Join-form PII is write-only (rules correctly deny-all), but there's no `/admin/applications` page, so the captain can't triage signups in-app. **Fix:** build an admin-gated (Admin SDK, `requireAdmin`) applications view. **[M]**
- [ ] **Roadmap vote-deletion can exceed Firestore's 500-write batch limit.** `src/lib/firestore/roadmap.ts:79-89` deletes all votes in one batch. **Fix:** chunk into ≤500 (or `BulkWriter`). **[S]**
- [ ] **Session not revoked on logout.** `api/auth/session/route.ts:51` clears the cookie but doesn't `revokeRefreshTokens(uid)`; a captured cookie stays valid up to 7 days. **Fix:** verify + revoke on DELETE. **[S]**

---

## P2 — Medium (quality / consistency / a11y)

- [ ] **Impact-stat inconsistency:** home says `150+` students reached (`constants/club.ts:80`), events say `100+` (`constants/events.ts:397`). Pick one. **[S]**
- [ ] **Theme has two sources of truth:** next-themes (`attribute="class"`) + a `@media (prefers-color-scheme: dark)` block on `:root` in `globals.css:244`. OS-dark + stored-light can leak dark tokens/flash. **Fix:** rely on the `.dark` class only. **[M]**
- [ ] **DomeGallery loads all 14 photos eagerly** (`gallery/DomeGallery.tsx:804`, raw `<img>`, no `loading="lazy"`) and has **no mobile gate** — the one heavy interactive piece shown on phones. **Fix:** lazy/async + thin tile count on small screens. **[S]**
- [ ] **Oversized 3D assets:** `public/lanyard/ruthvik-front.png` (876 KB) and `card.glb` (2.4 MB) load raw into WebGL. **Fix:** compress the PNG, run the GLB through Draco/meshopt. **[M]**
- [ ] **Hardcoded-dark cards in light mode:** `ProjectCard.tsx` (`bg-[#130720]`) and `HeroConsole.tsx` (`bg-[#0b0f17]`) render dark on the otherwise theme-aware `/projects` and `/m/[username]`. Confirm intent or tokenize. **[M]**
- [ ] **Low contrast on dark bands:** `ImpactStars.tsx:206` `text-white/45` (~2.9:1) is below WCAG AA. Bump opacity. **[S]**
- [ ] **Unchecked casts at Firestore read boundaries** (`toEvent`/`toMember`/`toProject`/`toRegistration`, `... as string`). Defeats strict TS; a malformed doc crashes downstream. **Fix:** zod converters at the boundary. **[M]**
- [ ] **No signup notification/confirmation email.** Resend infra already exists (`lib/email/resend.ts`, used for tickets) but not wired to Join. **Fix:** best-effort admin notify (+ optional applicant confirmation) after `createApplication`. **[S]**
- [ ] **No duplicate-submission prevention** on the Join form — always `.add()`s; email not normalized. **Fix:** lowercase email + dedupe/deterministic id. **[S]**
- [ ] **Unbounded collection reads** (`listMembers`/`listProjects`/`listRoadmapItems`, `listEvents` w/o limit) back public pages. **Fix:** default limits/pagination. **[M]**
- [ ] **`force-dynamic` on Firestore public pages** (`/projects`, `/members`, slugs) re-queries every hit on an otherwise-static site. **Fix:** ISR (`revalidate`). Also **confirm Firestore is seeded** or these show only EmptyState at launch. **[M]**
- [ ] **Misleading admin status labels:** `admin/page.tsx` marks Events/Projects/Roadmap/Check-in `ready:false`/"Skeleton" though they work; `roadmap/page.tsx:5` still says "Status: skeleton". **[S]**
- [ ] **Services page references a non-existent blog** (`services/page.tsx:199`); legal pages (`code-of-conduct`, `privacy`) give no contact email. **Fix:** soften copy or build; add a contact email. **[S]**

---

## P3 — Low (cleanup / hygiene)

- [ ] **Stale TODOs / dead code:** `constants/nav.ts:27` says socials are null (they're filled) → dead `null` branch in `Footer.tsx:36-44`. **[S]**
- [ ] **Unused code:** `components/team/ProfileCard.tsx` (literal `"<Placeholder…>"` defaults, not imported — `MemberProfileCard` is the live one), `home/HeroConsole.tsx`, `feedback/LoadingState.tsx`. Remove or wire in. **[S]**
- [ ] **Duplicate QR libs:** `qrcode` + `qrcode.react` + `html5-qrcode` — audit and drop the unused. **[S]**
- [ ] **Repo-root clutter:** stray binaries/PDFs/images in root (gitignored but risky). Move to an ignored `scratch/`. **[S]**
- [ ] **ESLint legacy config drift:** `.eslintrc.json` under ESLint 9 (flat-config compat shim `ESLINT_USE_FLAT_CONFIG=false`); `eslint-plugin-tailwindcss` installed but not enabled; `next lint` deprecated. Migrate to flat `eslint.config.mjs`. **[M]**
- [ ] **28px tap targets** (`ProjectCard.tsx:154,169`) below the 44px mobile guideline. **[S]**
- [ ] **Unvalidated `next` redirect** (`signin/SignInClient.tsx`) — allow only internal `/…` paths. **[S]**
- [ ] **`info`/`warn` logs dropped in prod** (`lib/utils/logger.ts`) — auth/email debugging goes blind. Route `warn` to a real sink. **[S]**
- [ ] **RollingText recurring timers** aren't viewport-gated (only first roll uses the observer). Negligible, but tidy. **[S]**
- [ ] **Unused Firestore indexes** (`projects: featured+createdAt`, `roadmap_items: quarter+voteCount`) — prune or wire. **[S]**
- [ ] **`getRandomPublicMembers` isn't random** (rotates by `len % count`). Rename or implement a real sample. **[S]**

---

## Missing features worth considering (post-launch)

- **Admin "Applications" page** — view/triage Join submissions (also listed P1; highest-value).
- **Contact page / email** — only channel today is Discord; privacy policy needs a real contact.
- **Blog / writeups** — referenced in Services copy; natural home for the "technical writing" pillar.
- **Newsletter / email capture** — an option for students not on Discord.
- **Standalone Gallery page** — `DomeGallery` is currently only a homepage section.
- **CI hardening** — Dependabot/CodeQL, coverage gate, e2e smoke test.

---

## Suggested order of attack

1. **Security + SEO quick wins (½ day):** uncomment `requireAdmin`, member-create rule, robots/sitemap, nav links, Roadmap batch, session revoke, `next` redirect.
2. **Join hardening (½ day):** zod validation + honeypot + Turnstile + rate limit + dedupe + admin-notify email.
3. **Resilience (½ day):** error/loading boundaries, env validation, Firestore indexes.
4. **SEO metadata + admin Applications page (1 day).**
5. **Perf/a11y polish + P3 cleanup + tests (1–2 days).**

Roughly **3–4 focused days** to a credible, launch-clean "done."
