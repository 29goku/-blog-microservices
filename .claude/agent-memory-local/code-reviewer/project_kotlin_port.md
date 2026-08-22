---
name: project-kotlin-port
description: Multi-task plan porting Java/Spring Boot microservices repo to Kotlin, executed task-by-task with brief+report+diff review packages
metadata:
  type: project
---

A new sibling repo `/Users/shosingh_1/Downloads/osapiens/blog-microservices-kotlin` is being built to port the Java repo at `/Users/shosingh_1/Downloads/osapiens/-blog-microservices` to Kotlin, one task at a time under `.superpowers/sdd/2026-08-22-kotlin-port/`.

Task 1 (scaffolding: parent pom with kotlin-maven-plugin, module poms/Dockerfiles/resources copied byte-identical, empty `src/main/kotlin/<package>` dirs mirroring Java package trees, docker-compose.yml copied, frontend copied minus node_modules/dist) was reviewed 2026-08-22 and passed cleanly — implementer's report was accurate, no deviations, `mvn -N validate` succeeded, all byte-diffs identical, all package dirs matched exactly.

**Why:** Later tasks (2-8) depend on this scaffold being exactly right — package/class/method names must match the Java originals, and the parent pom's Kotlin build config (allopen/noarg compiler plugins, disabled default-compile/default-testCompile) is the foundation every module conversion inherits.

**How to apply:** For future task reviews in this port, keep using `diff`/`diff -rq` against the Java repo at the same relative paths, and `find ... -type d | sed` to compare package tree structures between `src/main/java` and `src/main/kotlin`. Watch for: (1) the brief's step 7 rsync command in this plan omits `--exclude .env.local` despite the step title mentioning it — this is a harmless inconsistency since `.env.local` is gitignored via frontend's own `.gitignore` (`*.local` pattern) in both repos, not worth flagging as a defect in future tasks unless it starts getting tracked. (2) Empty Kotlin dirs won't show in git diffs since git doesn't track empty dirs — verify via `find`/`ls` on the live filesystem, not via `git show --stat`.
