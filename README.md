# Blog Microservices - Project 1

A production-ready microservices architecture with three independent services: User, Post, and Comment services.

## Architecture Overview

```
                        ┌─────────────────────┐
                        │  Client Requests    │
                        │  (Port 8080)        │
                        └──────────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  API Gateway (8080) │
                        │  Routes & Logging   │
                        └──┬─────────┬──────┬─┘
                           │         │      │
              ┌────────────┤         │      ├──────────┐
              │            │         │      │          │
      ┌───────▼──────┐ ┌───▼──────┐ ┌──────▼──┐  ┌────▼────┐
      │ User Service │ │ Post Svc │ │Comment  │  │ Eureka  │
      │   (8081)     │ │ (8082)   │ │  Svc    │  │ (8761)  │
      │              │ │          │ │ (8083)  │  │Service  │
      └──────────────┘ └──────────┘ └─────────┘  │Discovery│
                                                   └─────────┘

      ┌──────────────────────────────────────────────────────┐
      │  MySQL Databases                                      │
      │ ├─ blog_user_db    ├─ blog_post_db                  │
      │ └─ blog_comment_db                                   │
      └──────────────────────────────────────────────────────┘
```

## Services

### 1. User Service (Port 8081)
**Responsibility:** User management and authentication

**Endpoints:**
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

**Database:** `blog_user_db`
- Table: `users` (id, username, email, password, fullName, bio, createdAt)

---

### 2. Post Service (Port 8082)
**Responsibility:** Blog post CRUD operations

**Endpoints:**
- `POST /api/posts` - Create post (validates user via Feign)
- `GET /api/posts/{id}` - Get post by ID
- `GET /api/posts/user/{userId}` - Get posts by user
- `GET /api/posts/search?title={title}` - Search posts
- `GET /api/posts` - Get all posts
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

**Database:** `blog_post_db`
- Table: `posts` (id, userId, title, content, tags, createdAt, updatedAt)

**External Calls:** User Service (validate user exists)

---

### 3. Comment Service (Port 8083)
**Responsibility:** Comment management

**Endpoints:**
- `POST /api/comments` - Create comment (validates user & post)
- `GET /api/comments/{id}` - Get comment by ID
- `GET /api/comments/post/{postId}` - Get comments on a post
- `GET /api/comments/user/{userId}` - Get user's comments
- `GET /api/comments` - Get all comments
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

**Database:** `blog_comment_db`
- Table: `comments` (id, postId, userId, content, createdAt, updatedAt)

**External Calls:** User Service, Post Service (validate both exist)

---

## Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **MySQL 8.0+**

## Setup Steps

### 1. Create Databases

```sql
CREATE DATABASE blog_user_db;
CREATE DATABASE blog_post_db;
CREATE DATABASE blog_comment_db;
```

### 2. Build the Project

```bash
cd blog-microservices
mvn clean package -DskipTests
```

### 3. Run Services (in separate terminals)

**Terminal 1 - User Service:**
```bash
cd user-service
mvn spring-boot:run
```

**Terminal 2 - Post Service:**
```bash
cd post-service
mvn spring-boot:run
```

**Terminal 3 - Comment Service:**
```bash
cd comment-service
mvn spring-boot:run
```

## Testing the APIs

### 1. Create a User

```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123",
    "fullName": "John Doe",
    "bio": "Software Engineer"
  }'
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "bio": "Software Engineer",
  "createdAt": 1712160000000
}
```

### 2. Create a Post

```bash
curl -X POST http://localhost:8082/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Introduction to Microservices",
    "content": "Microservices architecture allows independent deployment and scaling...",
    "tags": "microservices,architecture,spring"
  }'
```

### 3. Create a Comment

```bash
curl -X POST http://localhost:8083/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "userId": 1,
    "content": "Great post! Very informative."
  }'
```

### 4. Get Post with User Info

```bash
curl http://localhost:8082/api/posts/1
```

**Response includes nested User object** (fetched via Feign client)

## Key Concepts Demonstrated

✅ **Microservices Architecture**
- Independent services with separate databases
- Domain-driven design (User, Post, Comment domains)

✅ **REST Communication**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Proper status codes (201 Created, 204 No Content, 404 Not Found)

✅ **Service-to-Service Communication (Feign)**
- Declarative REST client
- Error handling for missing services
- Automatic serialization/deserialization

✅ **Data Consistency**
- Database per service pattern
- API composition (enriching Post with User data)

✅ **Exception Handling**
- Global exception handlers (@RestControllerAdvice)
- Proper HTTP status codes
- Structured error responses

✅ **Validation**
- Request validation using Jakarta validation
- Business logic validation (e.g., user exists)

✅ **Logging**
- SLF4J for structured logging
- Service call tracking

## Failure Scenarios

### When User Service is Down
```
POST /api/posts - Will fail with 502 Bad Gateway
```

### Invalid User/Post Reference
```
POST /api/comments with invalid userId → 400 Bad Request
POST /api/posts with invalid userId → 400 Bad Request
```

## Next Steps

1. **Add Eureka Service Discovery** - Replace hardcoded URLs
2. **Add API Gateway** - Single entry point for all services
3. **Add Circuit Breaker** - Handle service failures gracefully
4. **Add Kafka** - Async communication between services
5. **Add Cache (Redis)** - Improve performance
6. **Add Docker** - Containerize services
7. **Add Kubernetes** - Orchestrate services

## Project Structure

```
blog-microservices/
├── pom.xml (parent)
├── user-service/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/blog/user/
│           │   ├── UserServiceApplication.java
│           │   ├── controller/UserController.java
│           │   ├── service/UserService.java
│           │   ├── repository/UserRepository.java
│           │   ├── entity/User.java
│           │   ├── dto/UserDTO.java
│           │   └── exception/
│           └── resources/application.yml
├── post-service/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/blog/post/
│           │   ├── PostServiceApplication.java
│           │   ├── controller/PostController.java
│           │   ├── service/PostService.java
│           │   ├── repository/PostRepository.java
│           │   ├── entity/Post.java
│           │   ├── dto/PostDTO.java
│           │   ├── client/UserServiceClient.java (Feign)
│           │   └── exception/
│           └── resources/application.yml
└── comment-service/
    ├── pom.xml
    └── src/
        └── main/
            ├── java/com/blog/comment/
            │   ├── CommentServiceApplication.java
            │   ├── controller/CommentController.java
            │   ├── service/CommentService.java
            │   ├── repository/CommentRepository.java
            │   ├── entity/Comment.java
            │   ├── dto/CommentDTO.java
            │   ├── client/UserServiceClient.java (Feign)
            │   ├── client/PostServiceClient.java (Feign)
            │   └── exception/
            └── resources/application.yml
```

## Learning Outcomes

After completing this project, you'll understand:

1. How to structure a microservices system
2. Database per service pattern
3. Inter-service REST communication with Feign
4. Error handling across services
5. API composition for enriching data
6. Spring Boot best practices
7. Layered architecture pattern

---

**Status:** ✅ Complete and Ready to Run

For questions or issues, refer to the batch materials or official Spring Cloud documentation.
