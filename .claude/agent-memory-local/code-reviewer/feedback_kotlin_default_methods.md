---
name: feedback-kotlin-default-methods
description: Kotlin interface methods with bodies (used as Feign/Resilience4j fallback methods) do not become real JVM default methods without -Xjvm-default; verified fix round confirmed via javap
metadata:
  type: feedback
---

In the Kotlin port ([[project_kotlin_port]]), Task 5 (`comment-service`) ported Java Feign client `default` fallback methods into Kotlin interface methods with a body. Kotlin does NOT emit real JVM `default` methods for these by default — it emits `public abstract` on the interface plus a synthetic `$DefaultImpls` class, unless `-Xjvm-default=all` (or `all-compatibility`) is passed to the compiler.

**Why:** Feign's `Contract.BaseContract` skips real Java `default` methods (`isDefault()==true`) but not Kotlin's abstract+`$DefaultImpls` pattern, causing `IllegalStateException` at Spring context startup (build-succeeds-but-runtime-breaks; `mvn package -DskipTests` never catches it).

**Fix verified (2026-08-22, commit 7e5e7d8 in `/Users/shosingh_1/Downloads/osapiens/blog-microservices-kotlin`):** adding `-Xjvm-default=all` to the **parent** pom's `kotlin-maven-plugin` `<args>` (not per-module) resolved it. Independently confirmed via `javap -v -p` on rebuilt classes: fallback methods show `flags: ACC_PUBLIC` (no `ACC_ABSTRACT`) with a `Code` attribute, no `$DefaultImpls` class present.

**How to apply:** For any future Kotlin port task involving Feign/interface-with-body-method patterns, don't trust a report's bytecode claims blindly — independently rebuild and run `javap -v -p` yourself (takes ~2 commands). Also check: does `-Xjvm-default=all` at the parent-pom level risk changing behavior of *other* Kotlin interfaces in the codebase (e.g. Spring Data repositories)? As of this check, all other Kotlin interfaces (`CommentRepository`, `UserRepository`) only declare abstract body-less methods, so the flag is a no-op for them — re-check this each time a new module/interface is added, since the flag applies project-wide once set.
