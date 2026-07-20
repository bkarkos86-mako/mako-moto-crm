# Mako Moto CRM

React + Vite PWA for the Mako Moto PH sales pipeline. Talks directly to a Google Apps Script backend (no server of its own).

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/mako-moto-crm/` (Vite serves under the `/mako-moto-crm/` base path so it matches the GitHub Pages URL).

## Multi-device offline sync

The backend only supports `save_all` (replace the whole leads list) — no per-lead endpoint. To let multiple phones capture different leads while offline without one device's sync wiping out another's, every save in `src/context/LeadsContext.jsx` does **fetch → merge → push** instead of pushing blindly:

1. Fetch the server's current leads.
2. Merge them with this device's local leads (`src/utils/merge.js`): any lead id only on one side is kept as-is; a lead edited on both sides keeps the newer `updatedAt` version, but contact log entries from both sides are unioned so neither device's notes get dropped.
3. Push the merged result back.

This means two phones adding different new leads offline both survive once each has synced. **Known limitation:** deletion doesn't survive a true cross-device race — there's no tombstone field (the backend's sheet has fixed columns, verified by testing that it silently drops unrecognized fields), so a lead deleted on one device can reappear if another device that still has it locally syncs afterward. In practice this only matters if someone deletes a lead during the same offline window another phone is also offline with a stale copy of it; avoid deleting leads mid-event and it's a non-issue.

## Deploying to GitHub Pages

One-time setup:

1. Create an empty GitHub repo named `mako-moto-crm` under the `bkarkos86-mako` account (do **not** initialize it with a README).
2. Point this local repo at it and push the source branch:
   ```bash
   git remote add origin https://github.com/bkarkos86-mako/mako-moto-crm.git
   git branch -M main
   git push -u origin main
   ```
3. In the repo's Settings → Pages, set the source to the `gh-pages` branch (it will appear after step 4 below runs once).

Every time you want to publish:

```bash
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. The live site will be at `https://bkarkos86-mako.github.io/mako-moto-crm/`.

If the repo name ever changes, update `base` in `vite.config.js` to match (`/<repo-name>/`).

## Lead scoring (Claude API)

The Lead Scoring tab calls the Anthropic API directly from the browser. Add your API key once in that tab — it's stored only in `localStorage` on that device and is never sent anywhere except `api.anthropic.com`. Because it's a browser-side key, treat this as a single-user/internal tool: anyone with access to the device (or its localStorage) can read the key.

## Locking the app down: per-person PINs and roles

The site is hosted on public GitHub Pages (private-repo Pages needs a paid plan), so the frontend alone can't keep anyone out — the login screen only protects data if your Apps Script backend also checks it.

Each salesperson has their own PIN and a role (`admin` or `sales`), looked up from a **Team** sheet tab — not a single shared passcode. Only `admin` can delete leads; this is enforced **server-side** (the backend detects when a save would remove an existing lead and rejects it for non-admins), not just by hiding the button in the UI.

Setup:

1. Add a sheet tab named exactly `Team` with columns `PIN`, `Name`, `Role` (role is `admin` or `sales`), one row per person.
2. In the Apps Script editor, the script authenticates every request by looking up the provided `key` against that Team sheet (see `authenticate_()`), and `doPost`'s `save_all` handler compares the incoming lead list against what's currently in the sheet — if any existing lead is missing (i.e. a delete) and the requester isn't `admin`, it's rejected with `{ok:false, error:'forbidden_delete'}` before anything is written.
3. **Deploy → New deployment** (editing an existing deployment's version has proven unreliable for this project — always create a fresh deployment) → Web app → Execute as: Me → Who has access: Anyone → Deploy.

Once that's live, each person enters their own PIN on first load per device (remembered in that browser's `localStorage`), the app shows who's logged in in the header, and tapping that pill logs out (asks for the PIN again — useful for a shared device). Add/remove people or change roles anytime by editing the Team sheet directly — no redeploy needed, since it's read fresh on every request.

## Sending email

GitHub Pages can't hold an SMTP connection, so outbound email (the "Email" quick action in Lead Detail, and the compose modal it opens) goes through a small serverless function in `email-api/`, deployed separately on Vercel — see that folder's own setup steps. It connects to `mail.makomotoph.com` via Nodemailer, checks the sender's PIN against this same backend's Team sheet before sending (no separate secret to manage), and returns a specific error type (`auth_error`, `connection_error`, `rate_limited`, ...) that the frontend turns into a specific message instead of a generic failure.

`src/constants.js`'s `EMAIL_FUNCTION_URL` points at that Vercel deployment — update it if the Vercel project ever moves.

A successful send is logged to the lead's contact log as `Emailed: <subject>`, which also doubles as the daily-send counter (`src/utils/analytics.js`'s `emailsSentToday` counts today's `Emailed:` entries across all leads) — no separate counter/KV store needed. The compose modal warns once today's count passes 400, since shared hosting SMTP typically caps around 450–500/day.

## Backend contract

- `GET <APPS_SCRIPT_URL>?key=<pin>` → `{ leads: [...], user: { name, role } }` on success, or `{ ok: false, error: 'unauthorized' }` if the PIN doesn't match anyone in the Team sheet.
- `POST <APPS_SCRIPT_URL>` with `{ action: 'save_all', leads: [...], key: <pin> }` → saves the full leads array (every mutation in the app resaves the whole list; there's no per-lead endpoint). Returns `{ ok: true, user: {...} }`, or `{ ok: false, error: 'forbidden_delete' }` if the payload implies a delete and the PIN's role isn't `admin`.

`contactLog` is a JSON-stringified array on the wire and a real array in app state — conversion happens in `src/api.js`.
