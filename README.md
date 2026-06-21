# Blog Microservices

A production-ready microservices blog platform with a React frontend, Spring Cloud API gateway, service discovery, circuit breakers, and live request tracking.

**Live:** Frontend on Vercel → API Gateway on Render → 4 domain services on Render

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
  ┌──────┼──────────────────┐
  │      │                  │
[User   [Post    [Comment   [Like-Dislike
Service  Service] Service]   Service]
:8081]   :8082]   :8083]     :8084]
  │      │        │          │
PostgreSQL per service (separate databases)

[Eureka Server :8761]  ← used locally & Docker; disabled on Render
[Kafka + Zookeeper]    ← available via Docker Compose (scaffolded)
```

Inter-service calls use **OpenFeign** with **Resilience4j** circuit breakers. On Render, Eureka is disabled and services resolve each other via injected HTTPS URLs.

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

Starts MySQL, Zookeeper, Kafka, Eureka, API Gateway, and all domain services.

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
```

Local MySQL databases required:

```sql
CREATE DATABASE blog_user_db;
CREATE DATABASE blog_post_db;
CREATE DATABASE blog_comment_db;
CREATE DATABASE like_dislike_db;
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

Defined in `render.yaml` (Render Blueprint). Deploys 6 Docker-based web services and 4 managed PostgreSQL databases.

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
| `DB_NAME` | `blog_*_db` | Database name |
| `DB_USERNAME` | `root` | DB username |
| `DB_PASSWORD` | `password` | DB password |
| `DATABASE_URL` | — | Full Render postgres:// URL (auto-parsed) |
| `EUREKA_CLIENT_ENABLED` | `true` | Set `false` on Render/cloud |
| `USER_SERVICE_URL` | `lb://user-service` | Feign target (use HTTPS URL on cloud) |
| `POST_SERVICE_URL` | `lb://post-service` | Feign target |

---

## Project Structure

```
blog-microservices/
├── pom.xml                        # Maven parent POM (Spring Boot 3.3, Java 17)
├── docker-compose.yml             # Local full-stack (MySQL, Kafka, all services)
├── render.yaml                    # Render IaC blueprint
├── railway.toml                   # Railway.com backend config
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

- **Microservices** — independent services, database per service, domain-driven boundaries
- **API Gateway** — single entry point, path-based routing, global CORS, request tracking
- **Service Discovery** — Eureka (local/Docker); direct URLs (cloud)
- **Feign + Resilience4j** — declarative HTTP clients with circuit breakers and fallbacks
- **Reactive Gateway** — Spring Cloud Gateway over WebFlux (non-blocking)
- **Live Request Tracking** — gateway records every request (method, path, service, duration, status) in a 100-entry in-memory buffer; frontend sidebar polls and visualizes in real time

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
