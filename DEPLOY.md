# Deploying the fixed GitHub Pages site

This fork is configured for the project-page URL:

`https://afsharidevops.github.io/iptv/`

## Publish

1. Replace the contents of the `main` branch with this project, or apply the included patch.
2. In **GitHub → Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`, then open **Actions → update** and confirm that both `build` and `deploy` finish successfully.

## Country exclusions

The generated site data is filtered in `src/commands/data/compile.ts` before it is compiled.
`EXCLUDED_COUNTRY_CODES` currently contains `IL`, so Israel and its related channels,
feeds, streams, guides, logos, locations and search records are not published.

To exclude another country later, add its two-letter code to the same set, for example:

```ts
const EXCLUDED_COUNTRY_CODES = new Set(['IL', 'XX'])
```

## Clear the old broken service worker once

After the first successful deployment, the browser may still be controlled by the previous service worker.

In Chrome or Edge:

1. Open the site and press `F12`.
2. Open **Application → Service Workers** and click **Unregister**.
3. Open **Application → Storage**, click **Clear site data**, then reload.

A private/incognito window is also useful for verifying the new deployment without the old cache.

## What was fixed

- Web workers no longer import SvelteKit-only `$app/paths`; the main app passes each resolved data URL to its worker.
- Generated `/iptv/data/...` files and `index.m3u` are no longer eagerly precached.
- Failed HTTP responses such as 404, 429 and 5xx are not saved in the offline cache.
- The large streams database is downloaded only after playlist mode is opened.
- Runtime data URLs now include the `/iptv` GitHub Pages base path.
- The workflow uses `npm ci` and deploys `docs` with the official GitHub Pages actions.
