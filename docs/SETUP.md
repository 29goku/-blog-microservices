# Blog Microservices - Complete Setup Guide

## Step 1: Prerequisites Check

```bash
# Check Java version (should be 17+)
java -version

# Check Maven version (should be 3.8+)
mvn -version

# Check PostgreSQL version (should be 15+)
psql --version

# (Optional but recommended) Check Docker — runs the whole stack for you
docker --version
```

> **Easiest path:** from the repo root run `docker-compose up`. This starts PostgreSQL (`main_db`), Zookeeper, Kafka, Eureka, the API Gateway, and all five domain services. The manual steps below are for running services individually.

## Step 2: Create Database

Open a PostgreSQL terminal:
```bash
psql -U postgres
```

Then run (all services share a single database):
```sql
-- Create the shared database
CREATE DATABASE main_db;

-- Verify
\l
```

## Step 3: Clone/Navigate to Project

```bash
cd -blog-microservices
pwd  # Should show the repo root, e.g. .../-blog-microservices
```

## Step 4: Build Project

```bash
# Clean and build all services
mvn clean package -DskipTests

# This will take 2-3 minutes
# You should see BUILD SUCCESS at the end
```

## Step 5: Start Services

> For the full experience start `eureka-server` (8761) and `api-gateway` (8080) first, then the domain services. Below shows the three core domain services; also start `like-dislike-service` (8084) and `tag-service` (8085) the same way. Or skip all of this with `docker-compose up`.

### Terminal 1 - Start User Service (Port 8081)

```bash
cd -blog-microservices/user-service
mvn spring-boot:run
```

**Expected output:**
```
Started UserServiceApplication in X.XXX seconds
```

---

### Terminal 2 - Start Post Service (Port 8082)

```bash
cd -blog-microservices/post-service
mvn spring-boot:run
```

**Expected output:**
```
Started PostServiceApplication in X.XXX seconds
```

---

### Terminal 3 - Start Comment Service (Port 8083)

```bash
cd -blog-microservices/comment-service
mvn spring-boot:run
```

**Expected output:**
```
Started CommentServiceApplication in X.XXX seconds
```

---

## Step 6: Verify All Services Are Running

In a new terminal:
```bash
# Check User Service
curl http://localhost:8081/api/users

# Check Post Service
curl http://localhost:8082/api/posts

# Check Comment Service
curl http://localhost:8083/api/comments

# All should return empty arrays: []
```

## Step 7: Run Test Script

```bash
# Navigate to project root
cd -blog-microservices

# Make script executable
chmod +x test-apis.sh

# Run tests
./test-apis.sh
```

**This will:**
1. Create a user
2. Create a post for that user
3. Create a comment on that post
4. Test all endpoints
5. Display formatted JSON responses

## Troubleshooting

### Error: "Connection refused on port 8081"
**Solution:** Make sure Terminal 1 is running User Service. Check for error messages.

### Error: "Access denied / password authentication failed for user"
**Solution:** Update PostgreSQL credentials in `application.yml` files (or set env vars `DB_USERNAME`/`DB_PASSWORD`):
```yaml
spring:
  datasource:
    username: postgres
    password: YOUR_PASSWORD  # Change this
```

Update in each service:
- `user-service/src/main/resources/application.yml`
- `post-service/src/main/resources/application.yml`
- `comment-service/src/main/resources/application.yml`
- `like-dislike-service/src/main/resources/application.yml`
- `tag-service/src/main/resources/application.yml`

### Error: "Can't connect to PostgreSQL server"
**Solution:** Start PostgreSQL:
```bash
# macOS with Homebrew
brew services start postgresql

# Or use Docker Compose (starts PostgreSQL for you)
docker-compose up postgres
```

### Feign Client Error: "Failed to connect to user-service"
**Solution:** Make sure User Service is running on port 8081. Check Terminal 1.

### Database doesn't exist
**Solution:** Verify the database was created:
```bash
psql -U postgres -c "\l"
```

Should list:
- main_db

---

## Manual API Testing (without script)

### 1. Create User

```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "pass123",
    "fullName": "Alice Smith"
  }'
```

**Response:** User object with ID (note the ID)

---

### 2. Create Post (replace USER_ID)

```bash
curl -X POST http://localhost:8082/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Spring Boot Best Practices",
    "content": "Let me share some best practices...",
    "tags": "spring,java,best-practices"
  }'
```

**Response:** Post object with ID (note the ID)

---

### 3. Create Comment (replace POST_ID and USER_ID)

```bash
curl -X POST http://localhost:8083/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "userId": 1,
    "content": "Excellent tips!"
  }'
```

---

### 4. Get Post with User (includes nested user object)

```bash
curl http://localhost:8082/api/posts/1 | jq '.'
```

Notice the `user` object is populated via Feign client call!

---

## Expected Database State After Tests

All tables live in the single shared `main_db` database.

### main_db.users
```
id | username  | email              | password | fullName  | bio
1  | john_doe  | john@example.com   | ...      | John Doe  | ...
```

### main_db.posts
```
id | userId | title                    | content | tags
1  | 1      | Introduction to...       | ...     | microservices,...
```

### main_db.comments
```
id | postId | userId | content                | createdAt
1  | 1      | 1      | Great post! Very...    | 1234567890
```

---

## What to Practice Next

1. **Test error scenarios:**
   - Try creating a comment with invalid postId (should fail)
   - Try creating a post with invalid userId (should fail)

2. **Update operations:**
   - Update a user's bio
   - Update a post's content
   - Update a comment

3. **Delete operations:**
   - Delete a comment
   - Delete a post
   - Delete a user

4. **Search operations:**
   - Search posts by title

5. **Read logs:**
   - Check service terminal logs to see inter-service communication
   - Watch Feign client calls being logged

---

## Next Phase (After Mastering This)

Several of these are already implemented in the current project — kept here as a learning roadmap:

1. **Eureka Service Discovery** — ✅ Done (used locally/Docker; disabled on Render)
   - Replaces hardcoded URLs in Feign clients
   - Services register themselves automatically

2. **API Gateway** — ✅ Done (Spring Cloud Gateway on 8080)
   - Single entry point for all requests
   - Route requests to appropriate services

3. **Resilience4j** — ✅ Done (circuit breakers on Feign clients)
   - Circuit breaker pattern
   - Retry logic
   - Timeout handling

4. **Add Kafka** — 🔜 Scaffolded via Docker Compose, not yet wired into business events
   - Event-driven communication

5. **Add Redis caching** — 🔜 Future
   - Cache hot reads, reduce DB load

---

## Important Notes

⚠️ **Database Credentials:**
- Default user/password: `postgres` / `postgres`
- Change in `application.yml` files (or via `DB_USERNAME`/`DB_PASSWORD` env vars) if your PostgreSQL credentials differ

⚠️ **Service Ports:**
- User Service: 8081
- Post Service: 8082
- Comment Service: 8083
- Like-Dislike Service: 8084
- Tag Service: 8085
- API Gateway: 8080
- Eureka Server: 8761
- Make sure these ports are not in use

⚠️ **Service Resolution:**
- Locally/Docker, Feign resolves services via Eureka (`lb://service-name`)
- On Render, Eureka is disabled and services use injected HTTPS URLs

---

Good luck! 🚀
