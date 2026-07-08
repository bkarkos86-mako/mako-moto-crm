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

## Locking the app down

The site is hosted on public GitHub Pages (private-repo Pages needs a paid plan), so the frontend alone can't keep anyone out — the passcode screen only protects data if your Apps Script backend also checks it. Set this up once:

1. Open your Apps Script project → the gear icon (**Project Settings**) → **Script Properties** → **Add script property**. Name: `ACCESS_KEY`, value: whatever passcode your team will use. Save.
2. In the script editor, add this near the top (outside any function):

   ```javascript
   function checkAccessKey_(e) {
     var required = PropertiesService.getScriptProperties().getProperty('ACCESS_KEY');
     if (!required) return true; // no key configured yet — auth disabled
     var provided = '';
     if (e && e.parameter && e.parameter.key) {
       provided = e.parameter.key;
     } else if (e && e.postData && e.postData.contents) {
       try {
         provided = JSON.parse(e.postData.contents).key || '';
       } catch (err) {}
     }
     return provided === required;
   }

   function unauthorizedResponse_() {
     return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. As the very first line inside your existing `doGet(e)` and `doPost(e)` functions, add:

   ```javascript
   if (!checkAccessKey_(e)) return unauthorizedResponse_();
   ```

   Leave the rest of both functions untouched.
4. **Deploy → Manage deployments → edit the existing deployment (pencil icon) → Version: New version → Deploy.** The `/exec` URL stays the same; this just pushes the new code live under it.

Once that's live, the app will ask for the passcode on first load per device, remember it in that browser's `localStorage`, and send it with every request. Change the passcode any time by editing the `ACCESS_KEY` script property and redeploying — everyone with the old one gets locked out immediately.

## Backend contract

- `GET <APPS_SCRIPT_URL>` → `{ leads: [...] }`
- `POST <APPS_SCRIPT_URL>` with `{ action: 'save_all', leads: [...] }` → saves the full leads array (every mutation in the app resaves the whole list; there's no per-lead endpoint).

`contactLog` is a JSON-stringified array on the wire and a real array in app state — conversion happens in `src/api.js`.
