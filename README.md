# GenWatch

**Wisemetrics × FGV** — Inteligência geracional em educação.

GenWatch is built with **YAML spec-driven development**. Specs in `specs/` are the single source of truth for domain, data sources, pipeline, API, and UI. Generated artifacts live in `generated/`.

## Quick start

```bash
# Install Python tooling
make install

# Validate specs and generate artifacts
make spec-validate
make spec-codegen

# Run API (port 8000) — required for dashboard data
make dev-api

# In another terminal, run dashboard (port 3000)
cd apps/web && npm install && npm run dev
```

Both services must run at the same time. If you see `fetch failed` on the dashboard, the API is not running — use `make dev-api` from the repo root (not `uvicorn` directly).

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

The dashboard (`apps/web`) deploys to Vercel. The FastAPI backend runs separately (Render is pre-configured via `render.yaml`).

### 1. Deploy the API (Render)

1. Push this repo to GitHub.
2. Create a new **Blueprint** on [Render](https://render.com) from `render.yaml`.
3. Set `GENWATCH_CORS_ORIGINS` to your Vercel URL (e.g. `https://genwatch.vercel.app`).
4. Copy the Render service URL (e.g. `https://genwatch-api.onrender.com`).

### 2. Deploy the dashboard (Vercel)

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `apps/web`.
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `API_PROXY_URL` | Your Render API URL |
| `GENWATCH_ADMIN_KEY` | Same value as on Render |

4. Deploy.

The Vercel app proxies `/api/v1/*` to the backend via `API_PROXY_URL`, so the dashboard and PDF downloads work on the same domain without CORS issues.

### Alternative: direct API URL

Skip the proxy and set `NEXT_PUBLIC_API_URL` to your backend URL instead of `API_PROXY_URL`. You must also set `GENWATCH_CORS_ORIGINS` on the API to include your Vercel domain.

### Local env reference

Copy `apps/web/.env.example` to `apps/web/.env.local` for local overrides.

## Spec workflow

```bash
make spec-validate      # JSON Schema + cross-reference checks
make spec-codegen       # Regenerate generated/
make spec-codegen-check # Fail if generated/ drifts
make spec-check         # Contract tests
make spec-summary       # Print spec overview
```

## Project structure

```
specs/           # Source of truth (YAML)
generated/       # Codegen output (do not hand-edit)
tools/spec-cli/  # validate · codegen · check
apps/api/        # FastAPI backend
apps/web/        # Next.js dashboard
workers/         # Ingestion adapters
data/seeds/      # Stub fixtures
```

## MVP constraints

- **Public signals only** for live ingestion (Reddit, YouTube, Trends, RSS)
- **Stubs** for Dark Social, TGI Kantar, FGV internal data
- **All 5 generations** from day 1

## Phase 1 milestone

- [x] Spec tree + CLI
- [x] Domain specs from one-pager
- [x] API + dashboard shell
- [x] Stub data pipeline
- [ ] Live source connectors (Phase 2)
- [ ] NLP/LLM intelligence layer (Phase 3)
