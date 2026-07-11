# latex-service

A tiny standalone HTTP service that renders resume JSON to LaTeX and compiles
it to a PDF with a real XeLaTeX install. It exists because Vercel's Node.js
serverless functions (used by the main app) can't run `xelatex` directly — a
XeTeX-capable TeX Live install is a few hundred MB to multiple GB, far past
what a serverless function can bundle. This service runs on a normal
always-on host instead (see deployment below) and the main app calls it over
HTTPS when `LATEX_SERVICE_URL` is set (see `src/lib/latex/page-fit.ts` in the
main app). With that env var unset, the main app compiles locally instead —
that's what local development against a MiKTeX/TeX Live install on your own
machine still uses.

## What's here

`src/` is a hand-kept-in-sync copy of the main app's `src/lib/latex/*` +
`src/lib/schema/resume.ts` (not a shared package — the overlap is small and
this keeps the service dependency-free from the main app). `templates/` and
`fonts/` are copies of the main app's `/templates` and `/fonts`. If you
change a `.tex` template, a compression preset, or the resume schema in the
main app, copy the change here too.

## Deploying to Render (no Dockerfile)

1. Push this repo to GitHub (already done if you're reading this from the deployed app).
2. In the Render dashboard: **New > Web Service**, connect this repo.
3. Set **Root Directory** to `latex-service`.
4. Set **Runtime** to `Node`.
5. **Build Command**:
   ```
   apt-get update && apt-get install -y --no-install-recommends texlive-xetex texlive-latex-extra texlive-lang-arabic texlive-fonts-recommended fontconfig && npm install && npm run build
   ```
6. **Start Command**: `npm start`
7. **Health Check Path**: `/health`
8. Add an environment variable `COMPILE_SECRET` — generate a long random
   value (e.g. `openssl rand -hex 32`). This is a shared secret; the main
   app must send the same value in `LATEX_SERVICE_SECRET`.
9. Deploy. First build will take a while (installing TeX Live packages).
10. Once live, copy the service's `https://<name>.onrender.com` URL.

A `render.yaml` blueprint is included with the same settings, in case Render
picks it up automatically when you connect the repo — if it doesn't, follow
the manual steps above.

### Free-tier cold starts

Render's free web services spin down after ~15 minutes of no traffic and
take 30-60s to spin back up on the next request. The first PDF export after
a period of inactivity will be slow for that reason — this is expected, not
a bug.

## Wiring it up to the main app

In the main app's Vercel project, add:

- `LATEX_SERVICE_URL` = `https://<name>.onrender.com`
- `LATEX_SERVICE_SECRET` = the same value as this service's `COMPILE_SECRET`

Redeploy the main app. PDF/tex export routes will now call this service
instead of trying (and failing) to run `xelatex` locally.

## Local development of this service

```
cd latex-service
npm install
COMPILE_SECRET=dev-secret npm run dev
```

Requires `xelatex` on your PATH (or set `LATEX_PATH`) — same requirement as
the main app's local dev setup.
