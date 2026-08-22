# Redis Pub/Sub for Cache Invalidation — Design

**Status:** Approved. User is implementing directly (no plan doc / no delegated implementation).

## Goal

This is increment 2 of the Redis roadmap (increment 1 was TTL-based post-read caching, see `2026-08-16-redis-post-caching-design.md`). Increment 1 accepts up to 60 seconds of staleness on writes. This increment adds Redis pub/sub so that writes invalidate the cache immediately instead of waiting out the TTL, while keeping the TTL as a fallback safety net.

Kafka already exists in this project (post-service → user-service `post-created` event) but is not reused here: Kafka is for durable, replayable, cross-service business events. Cache invalidation is ephemeral and only meaningful "right now" — a natural fit for Redis pub/sub instead.

## Scope

- Applies only to `post-service`'s existing "posts" cache (from increment 1): `posts::allPosts` and `posts::{id}`.
- Publisher and subscriber both live in `post-service`. Today this is a single instance talking to itself over Redis, but the mechanism is written so it works unchanged if `post-service` is scaled to multiple instances (instance B hears about a write made on instance A).
- No other services are involved in this increment.

## Approach

- **Channel:** `post-cache-invalidate` (Redis pub/sub channel, via Spring Data Redis `ChannelTopic`).
- **Message format:** JSON, one of:
  - `{"type":"ALL"}` — evict the list cache only.
  - `{"type":"POST","postId":<id>}` — evict the list cache and the specific post's cache.
- **Publisher:** `PostCacheInvalidationPublisher`, a small component wrapping `RedisTemplate.convertAndSend(topic, message)`. Called from `PostService` after each successful write:
  - `createPost` → publish `{"type":"ALL"}`
  - `updatePost` → publish `{"type":"POST","postId":X}`
  - `deletePost` → publish `{"type":"POST","postId":X}`
- **Subscriber:** `PostCacheInvalidationListener` implementing Spring's `MessageListener`, registered on a `RedisMessageListenerContainer` bean subscribed to the `post-cache-invalidate` topic. On receiving a message, it deserializes the JSON and calls `cacheManager.getCache("posts").evict(...)` for the relevant key(s):
  - `ALL` → evict `"allPosts"`
  - `POST` → evict `"allPosts"` and the post's id

## Why publish after the write commits, not before

Publishing must happen after the database write succeeds (i.e., after `postRepository.save(...)` / delete completes), not before — otherwise a listener could evict the cache and a concurrent read could immediately re-populate it with the *old* data before the write lands, recreating the staleness this increment is meant to remove.

## Error handling

If Redis is briefly unavailable and the publish call throws, log the failure and let the write request succeed normally — publishing is a fast-path optimization, not a correctness requirement. The existing 60-second TTL from increment 1 remains the fallback: worst case, a failed invalidation just means the old behavior (up to 60s staleness) applies for that one write.

## Files touched

- `RedisConfig.java` (new, or added to existing `RedisCacheConfig.java`) — `RedisMessageListenerContainer` bean, `ChannelTopic` bean for `post-cache-invalidate`, registers `PostCacheInvalidationListener`
- New `PostCacheInvalidationPublisher.java` — wraps `RedisTemplate.convertAndSend`
- New `PostCacheInvalidationListener.java` — implements `MessageListener`, evicts from `CacheManager`
- `PostService.java` — `createPost`, `updatePost`, `deletePost` each call the publisher after their write succeeds
- `README.md` — note the invalidation behavior once shipped (immediate consistency on write, TTL as fallback)

## Explicitly out of scope (this increment)

- Any other service subscribing to post cache invalidation (no other service caches post data)
- Guaranteed/at-least-once delivery (Redis pub/sub is fire-and-forget; a missed message just falls back to TTL expiry, which is acceptable per the error-handling section above)
- Caching or invalidation for user-service, like-dislike-service, tag-service, comment-service
- Using this pub/sub channel for anything other than post cache invalidation (e.g. no general inter-service messaging bus here — that would be a separate, future decision if ever needed)

## Testing

Manual verification:
1. `GET /api/posts/{id}` to warm the cache.
2. `PUT /api/posts/{id}` to update it.
3. Immediately `GET /api/posts/{id}` again — response must reflect the update (not stale), and `post-service` logs should show the eviction firing on the update, with no `Fetching post with id` log line skipped incorrectly.
4. Repeat for `POST /api/posts` (create) against `GET /api/posts` (list) and for delete.
