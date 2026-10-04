# Kubernetes Dependency Graph

Dependency graph for the `blog` namespace on the local kind cluster (`k8s/`).

```mermaid
graph TD
    Client[Client / curl]

    subgraph Entry
        AG[api-gateway :8080]
    end

    subgraph Services
        ES[eureka-server :8761]
        US[user-service :8081]
        PS[post-service :8082]
        CS[comment-service :8083]
        LD[like-dislike-service :8084]
        TS[tag-service :8085]
    end

    subgraph Infra
        PG[(postgres :5432)]
        RD[(redis :6379)]
        KF[(kafka :9092)]
        ZK[(zookeeper :2181)]
    end

    Client --> AG
    AG -->|lb://, via Eureka| US
    AG -->|lb://, via Eureka| PS
    AG -->|lb://, via Eureka| CS
    AG -->|lb://, via Eureka| LD
    AG -->|lb://, via Eureka| TS

    AG -. registers .-> ES
    US -. registers .-> ES
    PS -. registers .-> ES
    CS -. registers .-> ES
    LD -. registers .-> ES
    TS -. registers .-> ES

    US --> PG
    US --> KF
    PS --> PG
    PS --> KF
    PS --> RD
    CS --> PG
    CS --> KF
    LD --> PG
    TS --> PG

    KF --> ZK
```

- Solid arrows = actual runtime calls/connections.
- Dashed arrows = Eureka registration (every service announces itself to `eureka-server`; `api-gateway` resolves `lb://<service>` through that registry at request time).
- `api-gateway` is the only component reachable from outside the cluster — everything else is internal-only, matching `docker-compose.yml` only publishing `8080` and `8761` to the host.
- `kafka` depends on `zookeeper`, not the reverse.
