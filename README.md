# Blog Microservices

A production-ready microservices blog platform with a React frontend, Spring Cloud API gateway, service discovery, circuit breakers, and live request tracking.

**Live:** Frontend on Vercel → API Gateway on Render → 5 domain services on Render

---

## Architecture

```
[React SPA — Vercel]
         |
  /api/* proxied via vercel.json rewrite
         |
[API Gateway :8080]  ← Spring Cloud Gateway (WebFlux, reactive)
  + RequestTrackingFilter (logs every request in-memory)
         |
  ┌──────┼─────────┬──────────┬──────────┐
  │      │         │          │          │
[User   [Post    [Comment   [Like-Dislike [Tag
Service  Service] Service]   Service]      Service]
:8081]   :8082]   :8083]     :8084]        :8085]
  │      │        │          │             │
  └──────┴────────┴──────────┴─────────────┘
                    │
        Single shared PostgreSQL (main_db)

[Eureka Server :8761]  ← used locally & Docker; disabled on Render
[Kafka + Zookeeper]    ← available via Docker Compose (scaffolded)
```

All domain services share a single PostgreSQL database (`main_db`), each owning its own tables. Inter-service calls use **OpenFeign** with **Resilience4j** circuit breakers. On Render, Eureka is disabled and services resolve each other via injected HTTPS URLs.

---

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| `eureka-server` | 8761 | Service registry (local/Docker only) |
| `api-gateway` | 8080 | Routing, CORS, live request tracking |
| `user-service` | 8081 | User account CRUD |
| `post-service` | 8082 | Blog post CRUD + user enrichment via Feign |
| `comment-service` | 8083 | Comment CRUD, validates user & post via Feign |
| `like-dislike-service` | 8084 | Per-user like/dislike toggle on posts |
| `tag-service` | 8085 | Tag CRUD + assign/unassign tags to posts |
| `frontend` | — | React 19 SPA (Vite, TypeScript) |

---

## API Reference

All endpoints route through the gateway at `http://localhost:8080` (local) or `https://api-gateway-3qmy.onrender.com` (production).

### User Service — `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/{id}` | Get user by ID |
| `GET` | `/api/users/username/{username}` | Get user by username |
| `PUT` | `/api/users/{id}` | Update user |
| `DELETE` | `/api/users/{id}` | Delete user |

### Post Service — `/api/posts`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/posts` | Create post (validates userId via Feign) |
| `GET` | `/api/posts` | List all posts (with embedded user) |
| `GET` | `/api/posts/{id}` | Get post by ID |
| `GET` | `/api/posts/user/{userId}` | Get posts by user |
| `GET` | `/api/posts/search?title=` | Search by title |
| `PUT` | `/api/posts/{id}` | Update post |
| `DELETE` | `/api/posts/{id}` | Delete post |

### Comment Service — `/api/comments`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/comments` | Create comment (validates userId & postId) |
| `GET` | `/api/comments` | List all comments |
| `GET` | `/api/comments/{id}` | Get comment by ID |
| `GET` | `/api/comments/post/{postId}` | Get comments for a post |
| `GET` | `/api/comments/user/{userId}` | Get comments by user |
| `PUT` | `/api/comments/{id}` | Update comment |
| `DELETE` | `/api/comments/{id}` | Delete comment |

### Like-Dislike Service — `/api/likedislike`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/likedislike` | Like/dislike a post (toggle: same type removes, opposite switches) |
| `GET` | `/api/likedislike/count/{postId}` | Get like/dislike counts for a post |
| `GET` | `/api/likedislike/post/{postId}` | Get all reactions for a post |
| `DELETE` | `/api/likedislike/{id}` | Remove a reaction |

### Tag Service — `/api/tags`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/tags` | Create tag |
| `GET` | `/api/tags` | List all tags |
| `GET` | `/api/tags/{id}` | Get tag by ID |
| `GET` | `/api/tags/name/{name}` | Get tag by name |
| `GET` | `/api/tags/post/{postId}` | Get tags for a post |
| `PUT` | `/api/tags/{id}` | Update tag |
| `DELETE` | `/api/tags/{id}` | Delete tag |
| `POST` | `/api/tags/assign?postId=&tagId=` | Assign a tag to a post |
| `DELETE` | `/api/tags/unassign?id=&postId=` | Remove a tag from a post |

### Gateway Tracking — `/api/tracking`
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tracking/requests?limit=20` | Last N requests (in-memory, max 100) |
| `GET` | `/api/tracking/requests/all` | All tracked requests |
| `DELETE` | `/api/tracking/history` | Clear request history |
| `GET` | `/api/tracking/health` | Tracking health |

---

## Local Development

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ / npm
- Docker & Docker Compose (recommended)

### Option A — Docker Compose (all services)

```bash
docker-compose up
```

Starts PostgreSQL, Zookeeper, Kafka, Eureka, API Gateway, and all domain services (including tag-service).

### Option B — Maven (services individually)

**1. Build all modules**

```bash
mvn clean package -DskipTests
```

**2. Start services in order**

```bash
# Terminal 1 — Eureka
cd eureka-server && mvn spring-boot:run

# Terminal 2 — API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 3 — User Service
cd user-service && mvn spring-boot:run

# Terminal 4 — Post Service
cd post-service && mvn spring-boot:run

# Terminal 5 — Comment Service
cd comment-service && mvn spring-boot:run

# Terminal 6 — Like-Dislike Service
cd like-dislike-service && mvn spring-boot:run

# Terminal 7 — Tag Service
cd tag-service && mvn spring-boot:run
```

Local PostgreSQL database required (all services share a single `main_db`):

```sql
CREATE DATABASE main_db;
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
```

---

## Deployment

### Backend — Render

Defined in `render.yaml` (Render Blueprint). Deploys 7 Docker-based web services (Eureka, API Gateway, and 5 domain services) and a single managed PostgreSQL database (`main-db`).

```
render blueprint launch render.yaml
```

On Render, `EUREKA_CLIENT_ENABLED=false` is injected automatically. Services resolve each other via direct HTTPS URLs set as environment variables.

| Service | Live URL |
|---------|----------|
| API Gateway | `https://api-gateway-3qmy.onrender.com` |
| User Service | `https://user-service-gntw.onrender.com` |
| Post Service | `https://post-service-7g3r.onrender.com` |
| Comment Service | `https://comment-service-edye.onrender.com` |
| Like-Dislike Service | `https://like-dislike-service.onrender.com` |
| Tag Service | `https://tag-service-d5s9.onrender.com` |

All services expose `/actuator/health` for health checks.

### Frontend — Vercel

`frontend/vercel.json` proxies `/api/*` to the Render API gateway, avoiding CORS issues. Deploy via Vercel CLI or Git push.

```bash
cd frontend
vercel --prod
```

---

## Environment Variables

Each backend service reads the following env vars (with local defaults shown):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `808x` | Service port |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `main_db` | Database name (shared across services) |
| `DB_USERNAME` | `postgres` | DB username |
| `DB_PASSWORD` | `postgres` | DB password |
| `DATABASE_URL` | — | Full Render postgres:// URL (auto-parsed) |
| `EUREKA_CLIENT_ENABLED` | `true` | Set `false` on Render/cloud |
| `USER_SERVICE_URL` | `lb://user-service` | Feign target (use HTTPS URL on cloud) |
| `POST_SERVICE_URL` | `lb://post-service` | Feign target |
| `TAG_SERVICE_URL` | `lb://tag-service` | Feign target |

---

## Project Structure

```
blog-microservices/
├── pom.xml                        # Maven parent POM (Spring Boot 3.3, Java 17)
├── docker-compose.yml             # Local full-stack (PostgreSQL, Kafka, all services)
├── render.yaml                    # Render IaC blueprint
├── railway.toml                   # Railway.com backend config
├── architecture-explorer.html     # Standalone interactive architecture diagram
├── eureka-server/
├── api-gateway/
│   └── .../filter/RequestTrackingFilter.java
│   └── .../service/RequestTrackingService.java
├── user-service/
├── post-service/
│   └── .../client/UserServiceClient.java   # Feign + circuit breaker
├── comment-service/
│   └── .../client/UserServiceClient.java
│   └── .../client/PostServiceClient.java
├── like-dislike-service/
├── tag-service/
│   └── .../client/TagServiceClient.java     # Feign + circuit breaker
└── frontend/
    ├── vercel.json                # Vercel proxy rewrite
    ├── railway.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── api/client.ts          # fetch-based API clients
        ├── components/
        │   ├── RequestFlowSidebar.tsx   # polls gateway tracking every 1.5s
        │   └── ...
        └── services/fileMapping.ts
```

---

## Key Concepts

- **Microservices** — independent services, domain-driven boundaries, single shared PostgreSQL (`main_db`) with per-service tables
- **API Gateway** — single entry point, path-based routing, global CORS, request tracking
- **Service Discovery** — Eureka (local/Docker); direct URLs (cloud)
- **Feign + Resilience4j** — declarative HTTP clients with circuit breakers and fallbacks
- **Reactive Gateway** — Spring Cloud Gateway over WebFlux (non-blocking)
- **Live Request Tracking** — gateway records every request (method, path, service, duration, status) in a 100-entry in-memory buffer; frontend sidebar polls and visualizes in real time
- **Redis Caching** — `post-service` caches enriched post reads (`GET /api/posts`, `GET /api/posts/{id}`) in Redis via Spring `@Cacheable`, 60s TTL as a fallback
- **Redis Pub/Sub Cache Invalidation** — `post-service` publishes to the `post-cache-invalidate` channel after each write (`createPost`, `updatePost`, `deletePost`); a listener in the same service evicts the affected cache entries immediately, so reads are consistent right after a write instead of waiting out the TTL

---

## Quick API Test

```bash
# Create a user
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"pass123","fullName":"Alice"}'

# Create a post (use the returned userId)
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Hello World","content":"My first post.","tags":"intro"}'

# Comment on the post
curl -X POST http://localhost:8080/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":1,"userId":1,"content":"Great post!"}'

# Like the post
curl -X POST http://localhost:8080/api/likedislike \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"postId":1,"likeDislikeType":"LIKE"}'
```

---

## Known Gaps & Roadmap

The platform is functional and deployed, but several production-grade concerns are not yet addressed. These are captured here as an honest backlog rather than hidden.

### Known gaps

| Gap | Where it fits | Notes |
|-----|---------------|-------|
| Retry + bulkhead | Finishes Phase 4 (resilience) | Circuit breakers exist; retry/bulkhead tuning does not |
| Real Kafka events | Phase 5 (async) | Kafka/Zookeeper run in Docker Compose but aren't wired to any business event |
| Schema/DB isolation | Architecture | All services share one PostgreSQL `main_db` — a shared-database coupling; consider schema-per-service or DB-per-service |
| DB migrations (Flyway/Liquibase) | Data layer | Currently `hibernate ddl-auto=update`, which drifts schema and is risky in production |
| Automated tests + CI/CD | Quality | Modules build with `-DskipTests`; no real test suite; Docker builds are manual |
| API docs (OpenAPI/Swagger) | Developer experience | Add `springdoc` per service, aggregate at the gateway |
| Distributed tracing (Micrometer → OTLP/Zipkin/Jaeger) | Observability | Pairs well with the existing gateway `RequestTrackingFilter` |
| Auth/security (JWT/OAuth2 at gateway) | Security | Gateway has CORS but no auth enforcement |
| Metrics aggregation (Prometheus/Grafana) | Observability | Actuator is exposed but nothing scrapes/aggregates it |
| Centralized config (Spring Cloud Config Server) | Configuration | Each service carries its own `application.yml` |
| Rate limiting at the gateway | Resilience | Could reuse the Redis instance now backing `post-service`'s read caching |

### Suggested order of value

1. **Retry + bulkhead** — finish what Phase 4 already promises
2. **Flyway migrations + a basic test suite + CI** — biggest correctness/safety gap
3. **Wire Kafka to a real event** (e.g. `post-created` → notify `comment-service`) — makes Phase 5 real
4. **Distributed tracing** — high value once multiple services talk
5. **Auth at the gateway** (JWT/OAuth2), then Prometheus/Grafana and a config server

> Each item is a focused, multi-step change and should be tackled as its own increment.
