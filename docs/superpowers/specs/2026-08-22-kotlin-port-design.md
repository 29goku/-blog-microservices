# Kotlin Port of Blog Microservices — Design Spec

Date: 2026-08-22
Source commit: `054b625` (HEAD) on `master` of this repo

## Goal

Produce a functionally identical copy of this Java/Spring Boot microservices
project, rewritten in Kotlin, as a sibling project. Same module layout, same
package/class/method names, same REST contracts, same infra topology and
ports. This is a language port, not a redesign — no new features, no
architectural changes, no behavior changes.

## Scope

**In scope** — convert to Kotlin:
- `eureka-server`
- `api-gateway`
- `user-service`
- `post-service` (including the Redis caching + pub/sub cache-invalidation
  work through commit `054b625`)
- `comment-service`
- `like-dislike-service`
- `tag-service`
- Parent `pom.xml`

**Copied unmodified (not a Java project, no port needed):**
- `frontend/` — copied as-is into the new project, pointing at the same
  `localhost:8080` gateway URL it already uses. No code changes.

**Not copied / not in scope:**
- `.git` history, `.idea`, `.playwright-mcp`, `target/`, root-level
  docs/scripts that describe *this* repo (`ARCHITECTURE.txt`,
  `DELIVERY_SUMMARY.txt`, `START_HERE.txt`, `architecture-explorer.html`,
  `blog-microservices.postman_collection.json`, `railway.toml`,
  `render.yaml`, `test-apis.sh`) — these are documentation/tooling for the
  original repo and don't need duplicating for a language port.
- `docker-compose.yml` and each service's `Dockerfile` ARE copied
  (infra/deploy config, language-agnostic).

## New project location

Sibling directory: `/Users/shosingh_1/Downloads/osapiens/blog-microservices-kotlin/`
(new, standalone git repo — not a subfolder of the current repo).

## Build tooling

Maven, mirroring the existing multi-module structure exactly:

- Parent `pom.xml`: same `<modules>`, same `spring-boot-starter-parent`
  (3.3.0), same `spring-cloud.version` (2023.0.3), same
  `resilience4j-bom` (2.1.0), same Java target (17) — Kotlin compiles to
  the same JVM target.
- Add to parent (inherited by all modules):
  - `kotlin-maven-plugin` with the `jpa` and `spring` compiler plugins
    enabled (auto-opens `@Entity`/`@Component`/etc. classes so Kotlin's
    `final`-by-default doesn't fight Spring proxying/Hibernate).
  - `org.jetbrains.kotlin:kotlin-stdlib`
  - `org.jetbrains.kotlin:kotlin-reflect` (required by Spring for
    parameter name/annotation introspection on Kotlin classes)
  - `com.fasterxml.jackson.module:jackson-module-kotlin` (correct
    JSON (de)serialization of Kotlin data classes / nullability)
- Each module's `src/main/java` → `src/main/kotlin`, same package
  structure, same file names but with `.kt` extension. Test trees follow
  the same pattern if present.
- All other dependencies (Spring Cloud Gateway, Eureka client/server,
  Feign, spring-kafka, spring-data-redis, Resilience4j, Postgres driver,
  spring-boot-starter-validation, actuator) stay exactly as declared in
  the Java poms — same artifact IDs, same versions.

## Conversion conventions (applied uniformly across all 7 modules)

- **JPA entities** → plain Kotlin classes (not `data class` — JPA needs
  mutable, identity-based objects; a `data class`'s generated
  `equals`/`hashCode`/`copy` fight Hibernate proxies and lazy loading).
  Kept `open` implicitly via the `kotlin-jpa` compiler plugin.
- **DTOs / request/response bodies / records** → Kotlin `data class`.
- **Controllers, `@Service`, `@Repository`, Feign `@FeignClient`
  interfaces, `@KafkaListener` methods, `@Configuration` classes** →
  direct 1:1 translation: same class name, same method names, same
  parameter names/order, same annotations and annotation attributes.
- **Lombok** (`@Data`, `@Getter/@Setter`, `@Builder`, etc., if present) is
  dropped — replaced by Kotlin's native properties/constructors. No
  behavior change, just no Lombok dependency needed in the Kotlin poms.
- **Logging**: `private val logger = LoggerFactory.getLogger(ClassName::class.java)`
  as a class-level `val` (or companion object where the Java version used
  a `static final Logger`), preserving every existing log line and level.
- **Null-safety**: fields/params that are `@NotNull`/primitives in Java
  become non-nullable Kotlin types; fields that are legitimately optional
  (e.g. nullable DB columns, `Optional<T>` returns) become nullable (`?`)
  or stay `Optional<T>` where Spring Data expects it (repository methods
  returning `Optional<Entity>` are left as `Optional` for JPA repo
  compatibility, not converted to nullable Kotlin returns).
- **Exception handling / `@ControllerAdvice`** → same class/method names,
  same HTTP status mappings.
- No new abstractions, no restructuring, no renamed classes/packages/
  endpoints. If something in the Java code looks like it could be
  "improved" in idiomatic Kotlin (e.g. collapsing a builder into a data
  class with defaults), that's out of scope — parity first.

## Infra & runtime

`docker-compose.yml` copied unchanged: Postgres (5432), Redis (6379),
Kafka+Zookeeper (9092/29092/2181), Eureka (8761), API Gateway (8080),
user-service (8081), post-service (8082), comment-service (8083),
like-dislike-service (8084), tag-service (8085). Same env vars
(`DB_HOST`, `KAFKA_BOOTSTRAP_SERVERS`, `REDIS_HOST`, `EUREKA_URI`, etc.).

The Kotlin stack is a drop-in replacement for the Java stack, not a
side-by-side deployment — it reuses the same ports, so it must be run
standalone (Java stack stopped first) to avoid port collisions during
testing.

Frontend is copied unmodified; since ports are identical, no frontend
config changes are needed to point it at the Kotlin backend.

## Conversion process

1. Scaffold the new repo: parent `pom.xml`, directory tree for all 7
   modules + `frontend/`, copy `docker-compose.yml` and each module's
   `Dockerfile`/`application.yml`/other resources unchanged.
2. Dispatch one subagent per backend module (7 total, run in parallel —
   modules are independent Maven artifacts with no shared mutable state)
   to translate that module's Java sources to Kotlin per the conventions
   above. Each subagent is given this spec as its brief so output is
   consistent across modules.
3. Copy `frontend/` unmodified.
4. Build: `mvn clean install` across all modules (or per-module, in
   dependency order — `tag-service` is a dependency of `post-service` per
   the parent pom module list).
5. Bring up `docker-compose up` for the full stack.
6. Smoke-test via Playwright MCP against the frontend: register/login,
   create a post, add a comment, like/dislike, tag a post — confirming
   parity with the original Java stack's behavior.

## Testing / acceptance criteria

- All 7 Kotlin modules compile and package successfully with Maven.
- `docker-compose up` brings up the full stack healthy (Eureka shows all
  services registered, Postgres/Redis/Kafka healthy).
- Frontend smoke flow (via Playwright) succeeds end-to-end: user
  registration/login, post CRUD, commenting, like/dislike, tagging —
  same outcomes as the Java version.
- No new features, no changed endpoints, no changed request/response
  shapes.

## Out of scope / explicitly not doing

- No Gradle migration.
- No idiomatic Kotlin restructuring beyond what's needed for correctness
  (coroutines, sealed classes, extension-function-heavy rewrites, etc.
  are not part of this port).
- No side-by-side run of both stacks simultaneously.
- No changes to the frontend.
