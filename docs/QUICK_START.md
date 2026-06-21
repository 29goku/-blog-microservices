# Quick Start - Blog Microservices

## TL;DR - Get Running in 5 Minutes

### 1. Create Databases
```bash
mysql -u root -p -e "
CREATE DATABASE blog_user_db;
CREATE DATABASE blog_post_db;
CREATE DATABASE blog_comment_db;
"
```

### 2. Build
```bash
cd /Users/shosingh_1/blog-microservices
mvn clean package -DskipTests
```

### 3. Start Services (4+ terminals)

**Terminal 1 (Eureka Server):**
```bash
cd eureka-server && mvn spring-boot:run
```

**Terminal 2 (API Gateway):**
```bash
cd api-gateway && mvn spring-boot:run
```

**Terminal 3:**
```bash
cd user-service && mvn spring-boot:run
```

**Terminal 4:**
```bash
cd post-service && mvn spring-boot:run
```

**Terminal 5:**
```bash
cd comment-service && mvn spring-boot:run
```

### 4. Test
```bash
chmod +x test-apis.sh && ./test-apis.sh
```

✅ Done!

---

## What You Built

**Infrastructure:**
- **Eureka Server** (8761) - Service discovery and registration
- **API Gateway** (8080) - Single entry point for all requests

**3 Independent Microservices:**
- **User Service** (8081) - Manages users
- **Post Service** (8082) - Manages posts, calls User Service
- **Comment Service** (8083) - Manages comments, calls User + Post Services

**Key Features:**
- ✅ REST APIs (CRUD operations)
- ✅ Feign Client for inter-service communication
- ✅ Independent databases (database per service)
- ✅ Global exception handling
- ✅ Request validation
- ✅ Structured logging

---

## Test Individual Endpoints

All requests now go through the API Gateway on port 8080:

```bash
# Create User (via gateway)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Create Post (via gateway, replace userId with your user's ID)
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "My First Post",
    "content": "This is a test post",
    "tags": "test,microservices"
  }'

# Create Comment (via gateway, replace postId and userId)
curl -X POST http://localhost:8080/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "userId": 1,
    "content": "Great post!"
  }'

# Get post (notice it includes user object from Feign call)
curl http://localhost:8080/api/posts/1 | jq
```

**Or use the direct service ports if needed:**
- User Service: `http://localhost:8081/api/users`
- Post Service: `http://localhost:8082/api/posts`
- Comment Service: `http://localhost:8083/api/comments`

---

## Directory Structure

```
blog-microservices/
├── README.md           # Full documentation
├── SETUP.md           # Detailed setup guide
├── QUICK_START.md     # This file
├── test-apis.sh       # Automated test script
├── pom.xml            # Parent Maven config
│
├── user-service/      # Service 1
│   ├── src/main/java/com/blog/user/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   └── exception/
│   └── resources/application.yml
│
├── post-service/      # Service 2
│   ├── src/main/java/com/blog/post/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── client/   # Feign client
│   │   └── exception/
│   └── resources/application.yml
│
└── comment-service/   # Service 3
    ├── src/main/java/com/blog/comment/
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   ├── entity/
    │   ├── dto/
    │   ├── client/   # Feign clients (User + Post)
    │   └── exception/
    └── resources/application.yml
```

---

## Architecture Diagram

```
                    ┌──────────────────┐
                    │  API Gateway     │
                    │  (8080)          │
                    │ Routes requests  │
                    └────────┬─────────┘
                             │
                    ┌────────┴────────┬────────────┐
                    │                 │            │
            ┌───────▼──────┐  ┌──────▼────┐  ┌──────▼─────┐
            │ User Service │  │  Post Svc │  │Comment Svc │
            │  (8081)      │  │  (8082)   │  │  (8083)    │
            │ - Manages    │  │ - Manages │  │ - Manages  │
            │   users      │  │   posts   │  │   comments │
            └──────────────┘  │ - Calls   │  │ - Calls    │
                              │   User    │  │   User &   │
                              │   Service │  │   Post     │
                              └──────────┘  └────────────┘

            ┌─────────────────────────────────────┐
            │  Service Discovery (Eureka)         │
            │  (8761) - Auto-discovers services  │
            └─────────────────────────────────────┘

            ┌─────────────────────────────────────┐
            │  MySQL Databases                    │
            ├─ blog_user_db                      │
            ├─ blog_post_db                      │
            └─ blog_comment_db                   │
            └─────────────────────────────────────┘
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in `application.yml` or kill process: `lsof -i :8081` |
| MySQL connection refused | Start MySQL: `brew services start mysql` |
| Feign client error | Make sure all 3 services are running |
| Build fails | Check Java version: `java -version` (need 17+) |
| Databases not found | Run MySQL create commands (see above) |

---

## Key Concepts Demonstrated

1. **Microservices** - Independent, loosely coupled services
2. **Feign Client** - Declarative REST communication
3. **Layered Architecture** - Controller → Service → Repository
4. **DTOs** - Separate transfer objects from entities
5. **Exception Handling** - Centralized error handling
6. **Validation** - Input validation with annotations
7. **Separation of Concerns** - Each service owns its domain

---

## Next Steps

After mastering this project:

1. ✅ **Service Discovery (Eureka)** - Dynamic service registration
2. ✅ **API Gateway** - Single entry point for all services
3. **Add Circuit Breaker** - Handle service failures gracefully
4. **Add Kafka** - Async event-driven communication
5. **Add Caching** - Redis for performance
6. **Add Docker** - Containerize services
7. **Add Kubernetes** - Production deployment

---

## Questions?

Refer to:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- Service logs in each terminal
- Spring Cloud Feign documentation

Good luck! 🚀
