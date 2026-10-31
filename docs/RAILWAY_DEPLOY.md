# Deploying to Railway

Each backend service is its own Railway service, built from its existing
`<service>/Dockerfile` with the Docker build context set to the **repo root**
(the Dockerfiles `COPY` sibling modules' `pom.xml` files, so the build breaks
if the context is scoped to the service subdirectory). This mirrors the
already-working Render deployment (`render.yaml`) — same env var names, same
`EUREKA_CLIENT_ENABLED=false` / direct-URL wiring, just on Railway.

Railway's config-as-code (`railway.toml`) does not carry environment variable
*values* (unlike Render's `render.yaml` Blueprint spec), so those still have
to be set per service via the Railway dashboard or CLI — this doc lists
exactly what to set.

## 1. Create the Postgres database

In the Railway project: **New → Database → PostgreSQL**. Note the service
name (default `Postgres`) — it's referenced below as `${{Postgres.PGHOST}}`
etc.

## 2. Create one Railway service per backend service

For each of `eureka-server`, `api-gateway`, `user-service`, `post-service`,
`comment-service`, `like-dislike-service`, `tag-service`:

1. **New → GitHub Repo** → select this repo (create 7 separate services from
   the same repo, one per loop of this step).
2. Settings → Build → **Config-as-code Path** → `railway/<service-name>.toml`
   (e.g. `railway/api-gateway.toml`). Leave **Root Directory** as `/` (repo
   root) — do not scope it to the subdirectory, or the Docker build context
   breaks.
3. Settings → Networking → **Generate Domain** (for `api-gateway` at least;
   the others only need public domains if you want to hit them directly for
   debugging).

## 3. Set environment variables per service

All values below go in that service's **Variables** tab.

### `eureka-server`
| Key | Value |
|---|---|
| `PORT` | `8761` |

### `api-gateway`
| Key | Value |
|---|---|
| `PORT` | `8080` |
| `EUREKA_CLIENT_ENABLED` | `false` |
| `EUREKA_REGISTER` | `false` |
| `EUREKA_FETCH` | `false` |
| `GATEWAY_DISCOVERY_ENABLED` | `false` |
| `JWT_SECRET` | a real random secret (≥32 chars) — do **not** leave the `dev-only-secret-change-me-please-32chars+` default in prod |
| `USER_SERVICE_URL` | public domain of the `user-service` Railway service |
| `POST_SERVICE_URL` | public domain of the `post-service` Railway service |
| `COMMENT_SERVICE_URL` | public domain of the `comment-service` Railway service |
| `LIKE_DISLIKE_SERVICE_URL` | public domain of the `like-dislike-service` Railway service |
| `TAG_SERVICE_URL` | public domain of the `tag-service` Railway service |

These `*_SERVICE_URL` values create a circular dependency (gateway needs the
other services' domains, which need to exist first) — generate domains for
all 6 services first, then come back and fill these in on `api-gateway`.

### `user-service`
| Key | Value |
|---|---|
| `PORT` | `8081` |
| `DB_HOST` | `${{Postgres.PGHOST}}` |
| `DB_PORT` | `${{Postgres.PGPORT}}` |
| `DB_NAME` | `${{Postgres.PGDATABASE}}` |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `EUREKA_CLIENT_ENABLED` | `false` |
| `EUREKA_REGISTER` | `false` |
| `EUREKA_FETCH` | `false` |
| `JWT_SECRET` | same value as set on `api-gateway` (used to sign/accept the same tokens) |

### `post-service`
Same `PORT`/`DB_*`/`EUREKA_*` pattern as `user-service`, with `PORT=8082`,
plus:
| Key | Value |
|---|---|
| `USER_SERVICE_URL` | public domain of `user-service` |
| `TAG_SERVICE_URL` | public domain of `tag-service` |
| `KAFKA_BOOTSTRAP_SERVERS` | leave unset only if you also deploy Kafka; otherwise post-create events will log errors on publish (non-fatal — see note below) |

### `comment-service`
Same pattern, `PORT=8083`, plus:
| Key | Value |
|---|---|
| `USER_SERVICE_URL` | public domain of `user-service` |
| `POST_SERVICE_URL` | public domain of `post-service` |

### `like-dislike-service`
Same pattern, `PORT=8084`, plus:
| Key | Value |
|---|---|
| `USER_SERVICE_URL` | public domain of `user-service` |
| `POST_SERVICE_URL` | public domain of `post-service` |

### `tag-service`
Same pattern, `PORT=8085`. No extra `*_SERVICE_URL` needed.

## 4. Kafka

None of the above provisions Kafka. `user-service`/`post-service` will start
fine without it (Spring Kafka retries connecting in the background and logs
errors, it does not crash the app), but the `post-created` → user `postCount`
increment flow won't work until a Kafka broker is reachable. If you need that
working in production, provision a Kafka add-on (e.g. Railway's Kafka
template, or an external managed broker) and set `KAFKA_BOOTSTRAP_SERVERS` on
`user-service` and `post-service` to point at it.

## 5. Verify

Once all 7 services deploy:
- `GET https://<eureka-server-domain>/actuator/health` → `{"status":"UP"}`
- `GET https://<api-gateway-domain>/actuator/health` → `{"status":"UP"}`
- `GET https://<api-gateway-domain>/api/users` → `[]` (or existing users) —
  confirms the gateway → user-service → Postgres path works end to end
- Point the frontend's `VITE_API_URL` at the `api-gateway` domain and run
  through login / create-post / comment / like-dislike / tag flows.
