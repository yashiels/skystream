# skystream deploy — launchpad (on-box build + Cloudflare tunnel)

skystream runs on **launchpad** (Hetzner cx33, tailnet `100.122.178.53`), which is being
repurposed from a Coolify host into a plain Docker + Cloudflare-tunnel deploy box (an
"atlas-class" host). No Coolify, no published ports — a `cloudflared` sidecar serves
`https://skystream.yashiel.dev` through the `launchpad-skystream` tunnel
(`ecdd738d-43a2-4374-bf14-beb5c1be4ee7`).

## How a deploy works

`.github/workflows/deploy-prod.yml` (push to `main`) joins the tailnet, SSHes to launchpad,
and runs the on-box build:

```
cd ~/apps/skystream/src/skystream && git reset --hard origin/main
docker build --build-arg NEXT_PUBLIC_TMDB_API_KEY=<secret> -t skystream:local .
cd ~/apps/skystream && docker compose -p skystream --env-file .env -f compose.yml up -d
```

The image is built on the box (matching the previous Coolify behaviour), tagged
`skystream:local`, and run by `deploy/compose.yml`.

## One-time on-box provisioning

`~/apps/skystream/.env` (mode 600, **never committed**):

```
SKYSTREAM_IMAGE=skystream:local
SKYSTREAM_TUNNEL_TOKEN=<op://Agents/skystream/tunnel-token>
```

The clone lives at `~/apps/skystream/src/skystream`; `deploy/compose.yml` is synced to
`~/apps/skystream/compose.yml`.

## Secrets / config

| Where | Name | Purpose |
|---|---|---|
| repo secret | `TS_AUTHKEY` | tailnet auth key (`tag:ci-deploy`) |
| repo secret | `LAUNCHPAD_SSH_KEY` | ed25519 deploy key for `yashiel@launchpad` |
| repo secret | `NEXT_PUBLIC_TMDB_API_KEY` | public TMDB build arg (also `op://Agents/skystream/tmdb-api-key`) |
| repo var | `LAUNCHPAD_HOST` | `100.122.178.53` |
| repo var | `RUNNER` | Actions runner label |
| 1Password | `op://Agents/skystream` | `tunnel-token`, `tunnel-id`, `tmdb-api-key` |

The former Coolify config (`COOLIFY_URL`, `COOLIFY_APP_UUID`, `COOLIFY_API_TOKEN`) is no
longer used and can be deleted once this lands.
