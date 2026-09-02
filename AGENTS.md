# AGENTS.md

Guidance for AI coding agents working in this repo. Humans: see
[`README.md`](README.md).

## What this is

SkyStream is a single Next.js 16 web app — nothing else. It browses movies, TV,
and anime via the TMDB API and plays them through the VidSrc embed. It is
deployed as a Docker container on Coolify and served at
`skystream.yashiel.dev`. There is no mobile app, no monorepo, and no backend of
its own.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **JavaScript + JSX** only — no TypeScript
- **pnpm** for dependencies; plain `next`/`jest`/`eslint`, no turbo/workspaces
- Styling: CSS with CSS Variables
- Tests: **Jest 30** + React Testing Library

## Layout

- `src/app/` — App Router pages and layouts
- `src/components/` — UI components (tests co-located in `__tests__/`)
- `src/services/` — TMDB client + streaming glue
- `src/utils/` — config, hooks (`useTheme`, `useSeoMeta`, …), analytics
- `src/api/` — TMDB API + streaming URL logic
- `src/shared/` — config, routing helpers, static data (categories, countries)

Imports into `src` use the `@/` alias (`@/shared`, `@/api`) — see
`jsconfig.json` and `jest.config.js`. `next.config.mjs` runs in Node, so it
imports shared config by relative path, not the alias.

## Commands

```bash
pnpm dev            # dev server
pnpm build          # production build (standalone output)
pnpm lint           # eslint (max 10 warnings)
pnpm test           # jest
pnpm format         # prettier --write
```

## Working conventions

- **Verify before finishing.** Run `pnpm lint && pnpm test && pnpm build` and fix
  failures yourself — don't hand back unverified work.
- **Self-documenting code, no narration comments.** Add a comment only for a
  non-obvious *why* (a workaround, a subtle invariant), never to restate *what*.
- **Config has one source of truth** in `src/shared/config` and `src/utils/config.js`;
  the CSP `frame-src` and player origin both derive from `NEXT_PUBLIC_VIDSRC_BASE_URL`.
- **Env vars are all `NEXT_PUBLIC_*`** — inlined at build time. Changing one means
  a rebuild, not a container restart. Full contract in `.env.example`.
- Tests live in `__tests__/` beside the code; CSS and image imports are mocked
  (see `jest.config.js`).
- Commits: conventional format `type(scope): summary`.

## CI & deploy

- **CI** (`.github/workflows/ci.yml`, `"CI: PR Checks"`) runs on PRs to `main`:
  `code-quality`, `test`, `build` in parallel, gated by the `ci-complete`
  aggregator (the required status check). Shared setup lives in
  `.github/actions/setup-node`.
- **Deploy** (`.github/workflows/deploy-prod.yml`, `"Deploy: Web (prod)"`) runs on
  push to `main`. Coolify on Launchpad is Tailscale-only, so the runner joins the
  tailnet with an ephemeral auth key and calls Coolify's deploy API; Coolify then
  pulls `main` and rebuilds the Dockerfile. Manual/rollback: run the workflow, or
  `coolify deploy <uuid>` from any tailnet machine.
- Deploy config: secrets `TS_AUTHKEY`, `COOLIFY_API_TOKEN`; vars `RUNNER`,
  `COOLIFY_URL`, `COOLIFY_APP_UUID`.
