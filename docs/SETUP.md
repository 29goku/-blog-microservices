# Blog Microservices - Complete Setup Guide

## Step 1: Prerequisites Check

```bash
# Check Java version (should be 17+)
java -version

# Check Maven version (should be 3.8+)
mvn -version

# Check MySQL version (should be 8.0+)
mysql --version
```

## Step 2: Create Databases

Open MySQL terminal:
```bash
mysql -u root -p
```

Then run:
```sql
-- Create databases
CREATE DATABASE blog_user_db;
CREATE DATABASE blog_post_db;
CREATE DATABASE blog_comment_db;

-- Verify
SHOW DATABASES;
```

## Step 3: Clone/Navigate to Project

```bash
cd blog-microservices
pwd  # Should show: /Users/shosingh_1/blog-microservices
```

## Step 4: Build Project

```bash
# Clean and build all services
mvn clean package -DskipTests

# This will take 2-3 minutes
# You should see BUILD SUCCESS at the end
```

## Step 5: Start Services (3 terminals required)

### Terminal 1 - Start User Service (Port 8081)

```bash
cd /Users/shosingh_1/blog-microservices/user-service
mvn spring-boot:run
```

**Expected output:**
```
Started UserServiceApplication in X.XXX seconds
```

---

### Terminal 2 - Start Post Service (Port 8082)

```bash
cd /Users/shosingh_1/blog-microservices/post-service
mvn spring-boot:run
```

**Expected output:**
```
Started PostServiceApplication in X.XXX seconds
```

---

### Terminal 3 - Start Comment Service (Port 8083)

```bash
cd /Users/shosingh_1/blog-microservices/comment-service
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
cd /Users/shosingh_1/blog-microservices

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

### Error: "Access denied for user 'root'@'localhost'"
**Solution:** Update MySQL password in `application.yml` files:
```yaml
spring:
  datasource:
    username: root
    password: YOUR_PASSWORD  # Change this
```

Update in all three services:
- `user-service/src/main/resources/application.yml`
- `post-service/src/main/resources/application.yml`
- `comment-service/src/main/resources/application.yml`

### Error: "Can't connect to MySQL server"
**Solution:** Start MySQL:
```bash
# macOS with Homebrew
brew services start mysql

# Or manually
mysql.server start
```

### Feign Client Error: "Failed to connect to user-service"
**Solution:** Make sure User Service is running on port 8081. Check Terminal 1.

### Database doesn't exist
**Solution:** Verify databases were created:
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

Should show:
- blog_user_db
- blog_post_db
- blog_comment_db

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

### blog_user_db.users
```
id | username  | email              | password | fullName  | bio
1  | john_doe  | john@example.com   | ...      | John Doe  | ...
```

### blog_post_db.posts
```
id | userId | title                    | content | tags
1  | 1      | Introduction to...       | ...     | microservices,...
```

### blog_comment_db.comments
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

Once you're comfortable with this project:

1. **Add Eureka Service Discovery**
   - Replace hardcoded URLs in Feign clients
   - Services register themselves automatically

2. **Add API Gateway**
   - Single entry point for all requests
   - Route requests to appropriate services

3. **Add Resilience4j**
   - Circuit breaker pattern
   - Retry logic
   - Timeout handling

4. **Add Kafka**
   - Event-driven communication
   - Order → Inventory project

---

## Important Notes

⚠️ **Database Passwords:**
- Default: `root`
- Change in `application.yml` files if your MySQL password is different

⚠️ **Service Ports:**
- User Service: 8081
- Post Service: 8082
- Comment Service: 8083
- Make sure these ports are not in use

⚠️ **Feign URLs:**
- Currently hardcoded to `localhost:8081`, `localhost:8082`, `localhost:8083`
- Later we'll replace with Eureka service discovery

---

Good luck! 🚀
