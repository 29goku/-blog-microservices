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

## Kafka
- post-service publishes PostCreatedEvent to topic `post-created` on every createPost()
- user-service has KafkaConsumerConfig (configured but NOT annotated @Configuration — consumer listener exists but is incomplete/not wired)
- Kafka brokers configured via `KAFKA_BOOTSTRAP_SERVERS` env var (default localhost:9092)

## Infrastructure
- Service discovery: Eureka (eureka-server:8761)
- DB: PostgreSQL per service (shared DB_HOST/DB_PORT env vars, separate DB_NAME)
- All Feign URLs overridable via env vars (e.g. USER_SERVICE_URL) for Render deployment
- Gateway falls back to Eureka lb:// discovery when env URL not set
- CORS: allow localhost:* and *.vercel.app (gateway), individual service CorsConfig beans too

**Why:** This is the foundational project structure — essential for any feature work.
**How to apply:** Use as the authoritative service map when navigating or adding features.
