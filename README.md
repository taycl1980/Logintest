# Auth Starter — Next.js + Supabase

A minimal, production-ready signup/login flow. Built to get your GitHub → Supabase → Vercel pipeline working end-to-end so your next project can skip this setup entirely.

**Stack:** Next.js 14 (App Router) · TypeScript · Supabase Auth (`@supabase/ssr`) · Server Actions — no client-side API routes, no extra UI libraries.

**What it does:**
- `/signup` — create an account (email + password, email confirmation enabled)
- `/login` — log in
- `/dashboard` — protected route, redirects to `/login` if not authenticated
- `/auth/callback` — handles the Supabase email confirmation redirect
- `middleware.ts` — refreshes the session on every request and gatekeeps `/dashboard`

---

## 1. Supabase setup

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name, region, and a strong database password (save it somewhere).
2. Once provisioned, go to **Project Settings → API**. You'll need two values:
   - `Project URL`
   - `anon public` key
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your production URL (you'll get this from Vercel in step 3 — for now, use `http://localhost:3000`, you'll update it later)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and later your Vercel URL + `/auth/callback`)
4. By default, Supabase requires email confirmation before login. That's intentional here — it proves your callback route works. You can turn it off later in **Authentication → Providers → Email** if you want faster testing.

---

## 2. Local setup

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Run it:

```bash
npm run dev
```

**If you're in GitHub Codespaces:** your app won't be at `localhost:3000`. Codespaces forwards the port to a URL like `https://your-codespace-name-3000.app.github.dev`. Two things to do:
1. In the **Ports** tab (bottom panel), right-click port 3000 → **Port Visibility → Public**. By default it's private, and Supabase's redirect (and your own browser) can't reach a private port.
2. In Supabase → **Authentication → URL Configuration**, add `https://your-codespace-name-3000.app.github.dev/auth/callback` to **Redirect URLs** — the `localhost` one won't work here.

Codespace URLs can change between sessions unless you've set up a persistent/fixed port, so you may need to update step 2 each time you start a fresh Codespace.

**Note on `next.config.js`:** it already includes `allowedOrigins: ["*.app.github.dev"]` under `experimental.serverActions`. This is required — Next.js checks that a Server Action's `Origin` header matches its `Host` header as a CSRF protection, and Codespaces' forwarding breaks that match unless the forwarding domain is explicitly allowed. If you hit `Invalid Server Actions request.` anyway, double check the domain pattern matches your actual Codespace URL (visible in the **Ports** tab).

Visit your app's URL (`localhost:3000` or your Codespace forwarded URL) → it redirects to `/login`. Sign up, check your email (check spam too — Supabase's default email service is rate-limited and sometimes slow), confirm, log in, land on `/dashboard`.

---

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Next.js + Supabase auth starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

`.env.local` is already in `.gitignore` — your keys won't be committed. (The anon key is safe to expose publicly anyway; it's designed for client-side use and is protected by Supabase's Row Level Security. The database password from step 1 is the one to actually guard.)

---

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Next.js — no build config changes needed.
3. Before deploying, add environment variables (**Settings → Environment Variables**, or during the import flow):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel deployment URL, e.g. `https://your-app.vercel.app` (needed for the signup email confirmation link to point to the right place)
4. Deploy.
5. **Go back to Supabase** → Authentication → URL Configuration and update:
   - **Site URL** → your Vercel URL
   - **Redirect URLs** → add `https://your-app.vercel.app/auth/callback`

This last step is the one people forget — if you skip it, confirmation emails will redirect to `localhost` even in production.

---

## Troubleshooting: "Invalid Server Actions request" in Codespaces

If signup/login throws **Invalid Server Actions request** when running in a Codespace, it's a known Next.js + Codespaces interaction: Codespaces' port-forwarding proxy reports `x-forwarded-host: localhost:3000` to the dev server, while your browser's actual `Origin` is the `*.app.github.dev` forwarded URL. Next.js rejects the request because those don't match — it's a CSRF protection that doesn't know Codespaces is in the middle.

This repo's `next.config.js` already includes the fix:

```js
experimental: {
  serverActions: {
    allowedOrigins: ["*.app.github.dev"],
  },
},
```

If you're still hitting it after pulling this version:
- Confirm you're actually on a `.app.github.dev` domain (check your browser URL bar) — `devtunnels.ms` or other forwarding setups need their own pattern added to the array
- Try adding your exact Codespace URL (without `https://`) as a second, non-wildcard entry — e.g. `"your-codespace-name-3000.app.github.dev"` — if the wildcard pattern doesn't match for some reason
- Restart `npm run dev` after editing `next.config.js` — it isn't picked up via hot reload

---

## How the pieces fit together

| File | Role |
|---|---|
| `lib/supabase/client.ts` | Browser-side Supabase client (for client components, if you add any) |
| `lib/supabase/server.ts` | Server-side client used in Server Components and Server Actions — reads/writes auth cookies |
| `lib/supabase/middleware.ts` | Refreshes the session token on every request; redirects unauthenticated users away from `/dashboard` |
| `middleware.ts` | Wires the above into Next.js's request pipeline |
| `app/login/actions.ts`, `app/signup/actions.ts` | Server Actions — form submissions run directly on the server, no API route needed |
| `app/auth/callback/route.ts` | Exchanges the email confirmation code for a session |

This is the current recommended pattern from Supabase (`@supabase/ssr`) — the older `@supabase/auth-helpers-nextjs` package is deprecated, so you're not building on something that'll need a rewrite in six months.

---

## Where to take this next

- Add a "Forgot password" flow (`supabase.auth.resetPasswordForEmail`)
- Add OAuth providers (Google, GitHub) — toggle in Supabase dashboard, minimal code change
- Add a `profiles` table with Row Level Security tied to `auth.uid()`
- Swap the plain CSS for Tailwind if you want it — structure won't change
