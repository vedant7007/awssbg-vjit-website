# Deploying to Vercel

This project deploys on **Vercel with native Git integration**. Once connected,
**every push to `main` auto-builds and deploys to production**, and every pull
request gets its own preview URL. That is the whole "auto-update" workflow — no
GitHub Action or extra config required.

CI (`.github/workflows/ci.yml`) independently typechecks, lints, and builds on
every push/PR, so a red build is caught before it ships.

---

## One-time setup

### 1. Import the repo

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. Import **`vedant7007/awssbg-vjit-website`**.
3. Framework preset: **Next.js** (auto-detected). Leave build & output settings
   at their defaults — Vercel reads the pnpm version from `packageManager` and
   runs `next build`.

### 2. Add environment variables

Project → **Settings → Environment Variables**. Add every key below for the
**Production** (and ideally **Preview**) environments. The fastest way: open
your local `.env.local`, copy its contents, and use Vercel's bulk paste.

| Variable                                   | Notes                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | from Firebase web app config                                                                                                |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `aws-sbg-vjit.firebaseapp.com`                                                                                              |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `aws-sbg-vjit`                                                                                                              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `aws-sbg-vjit.firebasestorage.app`                                                                                          |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | numeric sender id                                                                                                           |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | web app id                                                                                                                  |
| `FIREBASE_ADMIN_PROJECT_ID`                | `aws-sbg-vjit`                                                                                                              |
| `FIREBASE_ADMIN_CLIENT_EMAIL`              | service-account email                                                                                                       |
| `FIREBASE_ADMIN_PRIVATE_KEY`               | **paste exactly as in `.env.local`** — one line containing literal `\n` sequences. The code converts `\n` back to newlines. |
| `RESEND_API_KEY`                           | Resend API key                                                                                                              |
| `RESEND_FROM_EMAIL`                        | verified sender, e.g. `onboarding@resend.dev`                                                                               |
| `TICKET_SECRET`                            | HMAC secret for ticket QR signing                                                                                           |
| `NEXT_PUBLIC_SITE_URL`                     | **set to the production URL** once known, e.g. `https://awssbg-vjit.vercel.app`. Not `localhost`.                           |

`SEED_ADMIN_UID` / `SEED_ADMIN_EMAIL` are only used by the local `pnpm seed`
script and are **not** needed on Vercel.

### 3. Deploy

Click **Deploy**. First build takes a couple of minutes.

### 4. Post-deploy — required, easy to miss

1. **Firebase authorized domains.** Firebase Console → Authentication →
   Settings → **Authorized domains** → add your Vercel domain(s)
   (`awssbg-vjit.vercel.app` and any custom domain). Without this, sign-in
   fails in production.
2. **Update `NEXT_PUBLIC_SITE_URL`** to the real domain (step 2) and redeploy,
   so OpenGraph tags and ticket links point at production.
3. **Deploy Firestore rules** if not already live:
   `firebase deploy --only firestore:rules`.

---

## Ongoing workflow

- **Push to `main`** → production deploy, automatically.
- **Open a PR** → isolated preview deploy with its own URL.
- Roll back instantly from the Vercel dashboard → Deployments → any prior build
  → **Promote to Production**.

## Optional: deploy from the CLI instead

```bash
npm i -g vercel
vercel login
vercel link          # link this folder to the Vercel project
vercel --prod        # manual production deploy
```

Git integration is still recommended — the CLI is only for manual/emergency
deploys.
