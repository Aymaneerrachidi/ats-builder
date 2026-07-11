# ATS Resume AI

AI-powered resume builder that turns a LinkedIn export, an existing resume, or
manual input into a structured, ATS-friendly resume — typeset for real with
LaTeX (`xelatex`), not a CSS-to-PDF export.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui (Base UI) ·
Prisma + PostgreSQL · Better Auth · Cohere structured outputs · Handlebars +
LaTeX (`xelatex`) · React Hook Form + Zod · Framer Motion.

## Prerequisites

- **Node.js 20+**
- **PostgreSQL** — any reachable instance (local install, Docker, Neon, Supabase, RDS, etc.)
- **A XeTeX-capable TeX distribution with `xelatex` on PATH** — TeX Live
  (Linux/macOS/CI) or MiKTeX (Windows), including `fontspec`, `polyglossia`,
  and `bidi` (needed for the Arabic/RTL support described below). Verify with
  `xelatex --version`. If it's not on PATH, set `LATEX_PATH` in `.env` to the
  full binary path.
- **A Cohere API key** — required for extraction, enhancement, ATS scoring, and job tailoring.
  Get a free trial key at [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
  (1,000 calls/month, 20 req/min, evaluation use only — get a paid production
  key before shipping this to real users).

## Setup

```bash
npm install

cp .env.example .env
# then edit .env — at minimum set DATABASE_URL, BETTER_AUTH_SECRET, COHERE_API_KEY

# generate a session secret:
openssl rand -base64 32

npx prisma migrate dev --name init   # creates tables in your database
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example` for the full list. The important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Prisma) |
| `BETTER_AUTH_SECRET` | Session signing secret — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000` in dev) |
| `COHERE_API_KEY` | Required for every AI feature (extraction, enhancement, ATS score, job tailoring). Free trial at [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) |
| `COHERE_MODEL` | Defaults to `command-a-03-2025` |
| `STORAGE_DIR` | Local disk path used to cache compiled PDFs (see `src/lib/storage.ts`) |
| `LATEX_PATH` | Override if `xelatex` isn't on PATH |
| `LATEX_SERVICE_URL` / `LATEX_SERVICE_SECRET` | Required in production on Vercel — points at the separate always-on compile service in `/latex-service`, since Vercel's serverless functions can't run `xelatex` themselves. Leave unset in local dev. |

## Deploying to Vercel

Vercel's Node.js serverless functions can't run `xelatex` (a XeTeX-capable
TeX Live install is far too large to bundle into a function). PDF/tex export
in production needs the separate compile service in **`/latex-service`**
deployed to an always-on host (Render, by default — see
`latex-service/README.md`) with `LATEX_SERVICE_URL` and
`LATEX_SERVICE_SECRET` set on the main app's Vercel project. Everything else
(auth, AI features, uploads, the dashboard) runs on Vercel normally.

## Architecture notes

- **Resume data model**: a single Zod schema (`src/lib/schema/resume.ts`) is
  the source of truth for the AI's structured-output schema, the builder
  forms, the LaTeX render context, and the Prisma `Resume.content` JSON
  column. The AI never generates LaTeX, Markdown, or HTML — only this JSON
  shape, enforced via Cohere's structured-output strict mode (`src/lib/ai/`),
  with zod schemas converted to Cohere-compatible JSON Schema via
  `src/lib/ai/schema-utils.ts` (Cohere's schema support is stricter than
  vanilla JSON Schema — see that file for exactly which keywords it rejects).
- **LaTeX templates** live in `/templates/*.tex` as Handlebars templates
  (see `templates/README.md` for the brace-escaping conventions used there —
  read it before editing a template). All resume text is escaped for LaTeX
  and every hyperlink is validated to a safe scheme (`http`/`https`/`mailto`)
  before being compiled in, since some PDF viewers execute `javascript:`
  link actions.
- **Compilation** (`src/lib/latex/compile.ts`) shells out to `xelatex` via
  `execFile` (never a shell) in an isolated temp directory, with a bounded
  timeout and one automatic retry. Success is judged by whether a PDF was
  actually produced rather than the process exit code — TeX frequently exits
  non-zero on cosmetic, fully-recoverable package warnings while still
  writing a perfectly good PDF, so exit-code-based failure detection would
  reject valid output. Returns a plain-English error extracted straight from
  the `.log` file on genuine failure.
- **Arabic / RTL support**: resumes can freely mix Latin and Arabic-script
  text (e.g. an Arabic name next to an English job title). The compiler is
  XeLaTeX (not pdflatex, which can't render non-Latin scripts at all);
  `src/lib/latex/escape.ts` detects Arabic runs and wraps them in
  `\textarabic{}` (a `polyglossia` command), and the Amiri Arabic typeface
  (SIL Open Font License) is bundled directly in `/fonts` and referenced by
  absolute path in the templates — so it renders correctly on any server
  without depending on that font being installed at the OS level. Polyglossia
  is only loaded when a resume actually contains Arabic text, so Latin-only
  resumes pay no extra cost.
- **One-page lock** (`src/lib/latex/page-fit.ts`, `compression.ts`): a
  per-resume toggle that, when enabled, progressively tightens layout
  (smaller font, narrower margins, tighter list/section spacing —
  `compression.ts` defines two escalating presets per template) and
  recompiles until the resume fits a single page. It never rewrites content;
  if even the tightest layout overflows, the API reports that honestly
  (`X-Fits-One-Page` / `X-Page-Count` response headers) and the UI nudges
  the user toward the existing AI "Shorten" enhancement instead.
- **Live preview**: the builder autosaves edits (debounced) and the preview
  pane / PDF-TEX-JSON export buttons all read from the same
  `/api/resumes/[id]/export/*` endpoints (via `compileResumeWithPageFit`), so
  preview and download can never drift apart, and a shared content-hash
  cache (`cache-key.ts`) avoids re-invoking the LaTeX engine for unchanged
  content.
- **LinkedIn**: the app never scrapes LinkedIn. A LinkedIn URL triggers a
  friendly notice directing the user to upload their LinkedIn PDF export or
  paste profile text instead — both go through the same extraction pipeline
  as a resume upload.
- **Auth**: Better Auth with the Prisma adapter (email/password). Route
  protection is a two-layer model — `middleware.ts` does a fast cookie-
  presence redirect at the edge, while every API route and server component
  calls `requireSession()` for the real check, and resume access additionally
  goes through `getOwnedResume()` to enforce per-user ownership.

## Deployment

This app needs a **persistent Node.js server with a XeTeX-capable TeX Live
(or MiKTeX) installation** — not a pure serverless/edge platform, since PDF
compilation shells out to a real, on-disk TeX distribution. A standard Node
hosting target (VPS, Render, Railway, a Vercel deployment using a custom
server, etc.) with TeX Live installed alongside the app works well.

Make sure the server's TeX installation has **matched versions** of
`fontspec`, `polyglossia`, `bidi`, and the base LaTeX2e kernel — a stale
kernel alongside a freshly-fetched `polyglossia`/`bidi` (common on
on-the-fly-install distros like MiKTeX if it hasn't been updated in a while)
can throw "undefined control sequence" errors from those packages'
compatibility-patch files. Run your distribution's full package update
(`tlmgr update --all` on TeX Live, or update all packages via the MiKTeX
Console) before deploying.

## Known warnings

`npm run build` prints two harmless webpack warnings you can ignore:
- `require.extensions is not supported by webpack` (from Handlebars' CJS
  entry point — doesn't affect the runtime `Handlebars.compile()` path used here).
- A Node-API-in-Edge-Runtime notice from a transitive `better-auth` → `jose`
  import, only exercised by JWT/JWE session encryption, which this app's
  default (opaque database session) configuration doesn't use.
