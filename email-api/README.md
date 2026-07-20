# Mako Moto email-sending function

A single Vercel serverless function (`api/send-email.js`) that sends outbound email via SMTP. Deployed separately from the CRM's GitHub Pages site, since Pages can only serve static files.

## Deploying

1. Go to **vercel.com** → sign in with the `bkarkos86-mako` GitHub account.
2. **Add New… → Project** → import the `mako-moto-crm` repo.
3. In the import screen, set **Root Directory** to `email-api` (not the repo root — this folder only).
4. Before deploying, add two **Environment Variables** (Vercel's own settings screen — the password is typed there, never in this repo):
   - `SMTP_PASSWORD` — the mailbox password for `sales@makomotoph.com`.
   - `APPS_SCRIPT_URL` — the CRM's current Apps Script backend URL (same one in the CRM's `src/constants.js`, `BACKEND_URL`). Used to verify a sender's PIN before sending anything.
5. Deploy. Vercel gives you a URL like `https://mako-moto-email-api.vercel.app`.
6. Give that URL to whoever's updating the CRM — it goes into `src/constants.js`'s `EMAIL_FUNCTION_URL` as `<that-url>/api/send-email`.

## Updating the backend URL later

If the Apps Script backend URL ever changes (it has, more than once), update the `APPS_SCRIPT_URL` environment variable in this Vercel project's settings and redeploy — Vercel redeploys automatically when an env var changes, or trigger one manually from the dashboard.

## What it does and doesn't do

- Sends one email per request via `mail.makomotoph.com:465` (SSL), authenticated as `sales@makomotoph.com`.
- Verifies the caller's PIN against the CRM's Team sheet (via `APPS_SCRIPT_URL`) before sending — there's no separate password/secret for this function itself, it borrows the CRM's existing auth.
- Does **not** log the sent email anywhere itself — the CRM frontend does that (appends a contact-log entry) after getting a success response back, using its own existing save mechanism.
- Does **not** track a daily send count — the CRM computes that client-side by counting its own contact-log entries, so there's nothing to keep in sync here.
