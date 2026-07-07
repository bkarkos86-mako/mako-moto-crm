# Mako Moto CRM

React + Vite PWA for the Mako Moto PH sales pipeline. Talks directly to a Google Apps Script backend (no server of its own).

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/mako-moto-crm/` (Vite serves under the `/mako-moto-crm/` base path so it matches the GitHub Pages URL).

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

## Backend contract

- `GET <APPS_SCRIPT_URL>` → `{ leads: [...] }`
- `POST <APPS_SCRIPT_URL>` with `{ action: 'save_all', leads: [...] }` → saves the full leads array (every mutation in the app resaves the whole list; there's no per-lead endpoint).

`contactLog` is a JSON-stringified array on the wire and a real array in app state — conversion happens in `src/api.js`.
