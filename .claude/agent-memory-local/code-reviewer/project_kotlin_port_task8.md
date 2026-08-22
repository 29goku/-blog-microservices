---
name: project-kotlin-port-task8
description: Task 8 (post-service, largest/most integration-heavy module) review outcome and the recurring nullable-CacheManager pattern
metadata:
  type: project
---

Task 8 of [[project_kotlin_port]] (post-service: 24 files, JPA entity, 2 Feign clients, Kafka producer+consumer, Redis cache + pub/sub invalidation) was reviewed 2026-08-22, commit `4d50cbb`. Overall clean port — all business logic, HTTP status codes, Kafka topic/group-id strings (`post-created`, `comment-created`, `post-service-group`), Redis cache name (`posts`), cache keys (`#id`, `#userId`, `'allPosts'`), and pub/sub channel (`post-cache-invalidate`) verified byte-identical to Java. `javap -p` independently confirmed both Feign clients' fallback methods emit `ACC_PUBLIC` only (no `ACC_ABSTRACT`) — the `-Xjvm-default=all` parent-pom fix from [[feedback_kotlin_default_methods]] continues to hold for new modules.

**One recurring Medium-severity pattern worth watching in future tasks:** `CacheManager.getCache(name)` returns `Cache?` in Kotlin (nullable), but Java's `getCache(name)` returns non-null-annotated `Cache` and Java code calls `.evict(...)` directly with no null check. When a literal port converts `cacheManager.getCache("x").evict(y)` to `cacheManager.getCache("x")?.evict(y)`, this silently changes behavior: Java would NPE (caught by an outer try/catch and logged as an error) if the cache is ever misconfigured/absent; Kotlin's `?.` makes it a silent no-op with no log line. This was flagged in `PostCacheInvalidationListener.kt` (post-service) — low real-world risk since the cache is always configured via `RedisCacheConfig`, but it's an observability regression (Java surfaces misconfiguration via error log, Kotlin hides it) and technically violates the port's "no dropped null-checks" instruction. Worth flagging again if seen in later modules, but not blocking given the "literal port, Kotlin's type system forces `?.`" trade-off is defensible.

**Why:** This module was called out as the riskiest (newest, least battle-tested Redis pub/sub code) and got the most scrutiny; the nullable-CacheManager issue is Kotlin's null-safety mechanically colliding with a literal-translation mandate — likely to recur wherever Java calls a `@Nullable`-unannotated-but-actually-nullable Spring API method without a null check.

**How to apply:** In future task reviews involving `CacheManager.getCache(...)`, `Optional`-returning Spring APIs used without checks in Java, or any Java code relying on implicit NPE-as-control-flow inside a try/catch, check whether the Kotlin port used `?.`/`?:` in a way that swallows the original NPE-and-log path instead of preserving it (e.g. `!!.evict(...)` would have matched Java's NPE behavior exactly, `?.evict(...)` does not).
