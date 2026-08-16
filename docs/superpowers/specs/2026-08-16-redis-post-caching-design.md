# Redis Caching for Post Reads — Design

**Status:** Approved. User is implementing directly (no plan doc / no delegated implementation).

## Goal

Introduce Redis as a read-through cache for `post-service`, the most expensive read path in the platform (enriches posts with user data via Feign on every request). This is increment 1 of 2 planned Redis increments — pub/sub messaging is a separate, later increment and out of scope here.

## Scope

- Cache **post reads only**: `GET /api/posts` (list) and `GET /api/posts/{id}` (single).
- No caching for user-service or like-dislike-service in this increment.

## Approach

- Add `spring-boot-starter-data-redis` (Lettuce client) to `post-service`.
- Use Spring's Cache abstraction (`@Cacheable`) backed by Redis via `RedisCacheManager` — no manual key/value plumbing.
- Cache the **fully-enriched response** (post + embedded `UserDTO` from Feign), not the raw `Post` entity — the Feign call is the expensive part worth avoiding on cache hit.
  - `@Cacheable` must sit on the service/controller method that returns the final enriched DTO, after the Feign call, not on the repository layer.

## Cache keys & TTL

- `posts::all` — the list endpoint.
- `posts::{id}` — individual post by id.
- TTL: 60 seconds on both. Configured via `RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(60))`.

## Invalidation

- **TTL-only.** No explicit `@CacheEvict` on create/update/delete. Staleness window is bounded to 60s, judged acceptable for this use case. (Considered explicit eviction on write; rejected in favor of simplicity for this increment.)

## Deployment

- **Local/Docker:** add a `redis:7-alpine` service to `docker-compose.yml`, expose `6379`, add as a `depends_on` for `post-service`.
- **Config:** `spring.data.redis.host` / `spring.data.redis.port` in `post-service/application.yml`, sourced from `REDIS_HOST` / `REDIS_PORT` env vars, defaulting to `localhost:6379` for bare local runs.
- **Production (Render):** provision a managed Redis instance; set `REDIS_HOST`/`REDIS_PORT` (or a single `REDIS_URL`) as env vars on `post-service`. If Render provides a single connection string, follow the existing `RenderDatabaseUrlEnvironmentPostProcessor` pattern to parse it into host/port at startup.

## Files touched

- `post-service/pom.xml` — add Redis starter dependency
- `post-service/src/main/resources/application.yml` — Redis connection + cache TTL config
- New `RedisCacheConfig.java` — `@Configuration` bean defining the 60s TTL cache config
- `PostServiceApplication.java` — add `@EnableCaching`
- `PostController.java` / `PostService.java` — add `@Cacheable(value = "posts", key = "'all'")` on the list method and `@Cacheable(value = "posts", key = "#id")` on the get-by-id method, placed on whichever method returns the enriched DTO
- `docker-compose.yml` — add `redis` service
- `README.md` — move "Redis caching" from Known Gaps/Roadmap to done, once shipped

## Explicitly out of scope (this increment)

- Redis pub/sub / messaging (planned as a separate future increment)
- Caching for user-service, like-dislike-service, tag-service, comment-service
- Explicit cache eviction on writes
