---
name: project-architecture
description: Core services, entities, REST endpoints, inter-service communication, and infrastructure of the blog microservices platform
metadata:
  type: project
---

## Services and Ports (defaults)
- eureka-server: port 8761 — service registry
- api-gateway: port 8080 — Spring Cloud Gateway, routes to all services, request tracking
- user-service: port 8081 — manages User entities (PostgreSQL table: users)
- post-service: port 8082 — manages Post entities (PostgreSQL table: posts); calls user-service and tag-service via Feign; publishes Kafka topic `post-created`
- comment-service: port 8083 — manages Comment entities; calls user-service and post-service via Feign
- like-dislike-service: port 8084 — manages LikeDislike entities; calls user-service and post-service via Feign
- tag-service: port 8085 — manages Tag and PostTag entities; self-referencing Feign client (TagServiceClient) but no cross-service calls needed

## Entities per Service
- user-service: User (id, username, email, password, fullName, bio, createdAt)
- post-service: Post (id, userId, title, content, tags[String], createdAt, updatedAt); event: PostCreatedEvent (postId, title, userId, createdAt)
- comment-service: Comment (id, postId, userId, content, createdAt, updatedAt)
- like-dislike-service: LikeDislike (id, userId, postId, likeDislikeType[LIKE|DISLIKE], createdAt)
- tag-service: Tag (id, name, description, color, createdAt, updatedAt), PostTag (id, postId, tagId)

## REST Endpoints
### user-service /api/users
POST /, GET /{id}, GET /username/{username}, GET /, PUT /{id}, DELETE /{id}

### post-service /api/posts
POST /, GET /{id}, GET /user/{userId}, GET /search?title=, GET /, PUT /{id}, DELETE /{id}

### comment-service /api/comments
POST /, GET /, GET /post/{postId}, GET /user/{userId}, GET /{id}, PUT /{id}, DELETE /{id}

### like-dislike-service /api/likedislike
POST / (create or toggle), GET /count/{postId}, GET /post/{postId}, DELETE /{id}

### tag-service /api/tags
GET /, GET /{id}, GET /name/{name}, GET /post/{postId}, POST /, PUT /{id}, DELETE /{id}, POST /assign?postId=&tagId=, DELETE /unassign?id=&postId=

### api-gateway /api/tracking
GET /requests?limit=, GET /requests/all, DELETE /history, GET /health

## Inter-Service Communication
All via OpenFeign with Resilience4j circuit breakers + fallbacks:
- post-service → user-service (validate user on create, enrich post DTOs)
- post-service → tag-service (fetch tags for post DTOs)
- comment-service → user-service (validate user on create, enrich comment DTOs)
- comment-service → post-service (validate post on create, enrich comment DTOs)
- like-dislike-service → user-service (validate user before like/dislike)
- like-dislike-service → post-service (validate post before like/dislike)

## Kafka (verified 2026-08-22, corrects earlier stale note)
- post-service publishes PostCreatedEvent to topic `post-created` on createPost() (PostService.java:71); user-service PostEventListener (@KafkaListener, group user-service-group) increments User.postCount — this consumer IS wired and working, not incomplete.
- comment-service publishes to topic `comment-created` on createComment() (CommentService.java:67); post-service CommentEventListener (@KafkaListener, group post-service-group) increments Post.commentCount. This is a second, real topic beyond post-created.
- Kafka brokers configured via `KAFKA_BOOTSTRAP_SERVERS` env var (default localhost:9092); JsonSerializer with JavaTimeModule.

## Redis caching (post-service only, verified 2026-08-22)
- Cache name `posts`, keys: `#id` (getPostById), `'byUser:' + #userId`, `'allPosts'`. TTL 60s (RedisCacheConfig.java). GenericJackson2JsonRedisSerializer w/ default typing.
- Pub/sub channel `post-cache-invalidate` via PostCacheInvalidationPublisher (types: ALL, POST{postId}, USER{userId}); PostCacheInvalidationListener evicts accordingly. Published on create (ALL+USER), update/delete (POST+USER).
- Other services (comment/like-dislike/tag/user) have no Redis usage found.

## Infrastructure
- Service discovery: Eureka (eureka-server:8761), all services register via spring-cloud eureka client, prefer-ip-address true.
- DB: all services default to the SAME Postgres DB name `main_db` (DB_NAME env var, same default across every service's application.yml) — effectively one shared schema/instance by default, not separate DBs per service, unless DB_NAME overridden per deployment.
- All Feign URLs overridable via env vars (e.g. USER_SERVICE_URL) for Render deployment; Resilience4j circuitbreaker instances configured per Feign target (slidingWindowSize 10, minCalls 5, failureRateThreshold 50%, waitDurationInOpenState 5s) — see post-service/comment-service application.yml.
- Gateway falls back to Eureka lb:// discovery when env URL not set.
- CORS: TWO overlapping configs active in api-gateway — application.yml `globalcors` (allowedOriginPatterns "*") AND GatewayConfig.java CorsWebFilter bean (localhost:* and *.vercel.app only). Flag as ambiguous/possibly redundant — worth clarifying which wins in a real deployment.
- api-gateway RequestTrackingFilter/RequestTrackingService: in-memory (ConcurrentLinkedDeque, max 100) request history, no persistence; resolveTargetService() only recognizes users/posts/comments/likedislike paths, NOT tag-service (falls through to "unknown").
- Frontend: React 19 + TypeScript + Vite, plain `fetch` calls in frontend/src/api/client.ts to gateway (VITE_API_URL or same-origin via Vercel rewrite). RequestFlowDashboard.tsx polls `http://localhost:8080/api/tracking/requests` every 2s (hardcoded localhost, not using VITE_API_URL — dev-only). No websockets/SSE found; "real-time" = polling only.

**Why:** This is the foundational project structure — essential for any feature work.
**How to apply:** Use as the authoritative service map when navigating or adding features.
