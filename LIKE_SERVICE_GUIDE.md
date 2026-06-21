# 📌 Like/Dislike Service - Step-by-Step Build Guide

## 🎯 Overview

**Service Purpose:** Allow users to like/dislike posts and view like counts

**Service Name:** `like-service`  
**Port:** `8084`  
**Database:** `blog_like_db`

**Key Learning:**
- Feign client calls to User & Post services
- Unique constraints (user can only like post once)
- Count aggregations
- Delete operations
- Gateway integration

---

## 📋 Architecture

```
Client Request (5173)
    ↓
API Gateway (8080)
    ↓
Like Service (8084)
    ├─ Feign: UserServiceClient → User Service (8081)
    ├─ Feign: PostServiceClient → Post Service (8082)
    └─ Database: blog_like_db
```

### Database Schema

```sql
CREATE TABLE blog_like_db.likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  userId BIGINT NOT NULL,
  postId BIGINT NOT NULL,
  likeType VARCHAR(50) NOT NULL,  -- 'LIKE' or 'DISLIKE'
  createdAt BIGINT,
  UNIQUE KEY unique_user_post (userId, postId)  ← Important! User can only like/dislike post once
);
```

---

## 🏗️ Step 1: Create Directory Structure

Create the following folders:

```bash
mkdir -p /Users/shosingh_1/blog-microservices/like-service
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/controller
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/service
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/repository
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/entity
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/dto
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/exception
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/client
mkdir -p /Users/shosingh_1/blog-microservices/like-service/src/main/resources
mkdir -p /Users/shosingh_1/blog-microservices/like-service/target
```

---

## 📄 Step 2: Create `pom.xml`

**File:** `/Users/shosingh_1/blog-microservices/like-service/pom.xml`

Template:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>like-service</artifactId>
    <name>Like Service</name>

    <parent>
        <groupId>com.blog</groupId>
        <artifactId>blog-microservices</artifactId>
        <version>1.0.0</version>
    </parent>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Eureka Client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <!-- Feign Client for inter-service calls -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

**Key files to create:** Copy the exact structure above.

---

## 🔧 Step 3: Create `application.yml`

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: like-service
  datasource:
    url: jdbc:mysql://localhost:3306/blog_like_db
    username: root
    password: ""
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

server:
  port: 8084

logging:
  level:
    root: INFO
    com.blog: DEBUG

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

**What to do:** Create the file and copy the YAML exactly.

---

## 📦 Step 4: Create Main Application Class

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/LikeServiceApplication.java`

```java
package com.blog.like;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // ← Enable Feign for inter-service calls
public class LikeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LikeServiceApplication.class, args);
    }
}
```

**What to do:** Create file with exact code above. This enables the service to:
- Register with Eureka
- Use Feign clients to call other services

---

## 📋 Step 5: Create Entity Class

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/entity/Like.java`

```java
package com.blog.like.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "postId"})  // User can only like/dislike post once
})
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LikeType likeType;  // LIKE or DISLIKE

    @Column(nullable = false)
    private Long createdAt;

    public Like() {
    }

    public Like(Long userId, Long postId, LikeType likeType) {
        this.userId = userId;
        this.postId = postId;
        this.likeType = likeType;
        this.createdAt = System.currentTimeMillis();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public LikeType getLikeType() { return likeType; }
    public void setLikeType(LikeType likeType) { this.likeType = likeType; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "Like{" +
                "id=" + id +
                ", userId=" + userId +
                ", postId=" + postId +
                ", likeType=" + likeType +
                ", createdAt=" + createdAt +
                '}';
    }
}
```

**What to do:** Create file with exact code. Key points:
- `@UniqueConstraint` prevents duplicate likes
- `LikeType` enum (LIKE or DISLIKE)
- `createdAt` stores timestamp

---

## 📝 Step 6: Create LikeType Enum

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/entity/LikeType.java`

```java
package com.blog.like.entity;

public enum LikeType {
    LIKE,
    DISLIKE
}
```

**What to do:** Create file with exact code.

---

## 📤 Step 7: Create DTOs

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/dto/LikeDTO.java`

```java
package com.blog.like.dto;

import com.blog.like.entity.LikeType;

public class LikeDTO {
    private Long id;
    private Long userId;
    private Long postId;
    private LikeType likeType;
    private Long createdAt;

    public LikeDTO() {
    }

    public LikeDTO(Long userId, Long postId, LikeType likeType) {
        this.userId = userId;
        this.postId = postId;
        this.likeType = likeType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public LikeType getLikeType() { return likeType; }
    public void setLikeType(LikeType likeType) { this.likeType = likeType; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
```

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/dto/LikeCountDTO.java`

```java
package com.blog.like.dto;

public class LikeCountDTO {
    private Long postId;
    private Long likeCount;
    private Long dislikeCount;

    public LikeCountDTO(Long postId, Long likeCount, Long dislikeCount) {
        this.postId = postId;
        this.likeCount = likeCount;
        this.dislikeCount = dislikeCount;
    }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Long getLikeCount() { return likeCount; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }

    public Long getDislikeCount() { return dislikeCount; }
    public void setDislikeCount(Long dislikeCount) { this.dislikeCount = dislikeCount; }
}
```

**What to do:** Create both files with exact code.

---

## 🔗 Step 8: Create Feign Clients

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/client/UserServiceClient.java`

```java
package com.blog.like.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    
    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable Long id);
}

class UserDTO {
    private Long id;
    private String username;
    
    public UserDTO() {}
    public Long getId() { return id; }
    public String getUsername() { return username; }
}
```

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/client/PostServiceClient.java`

```java
package com.blog.like.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service")
public interface PostServiceClient {
    
    @GetMapping("/api/posts/{id}")
    PostDTO getPostById(@PathVariable Long id);
}

class PostDTO {
    private Long id;
    private Long userId;
    private String title;
    
    public PostDTO() {}
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
}
```

**What to do:** Create both files. These call other services via Feign.

---

## 💾 Step 9: Create Repository

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/repository/LikeRepository.java`

```java
package com.blog.like.repository;

import com.blog.like.entity.Like;
import com.blog.like.entity.LikeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    // Find like/dislike by user and post
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);
    
    // Get all likes for a post
    List<Like> findByPostId(Long postId);
    
    // Get all likes by a user
    List<Like> findByUserId(Long userId);
    
    // Count likes for a post
    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId AND l.likeType = 'LIKE'")
    Long countLikesByPostId(@Param("postId") Long postId);
    
    // Count dislikes for a post
    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId AND l.likeType = 'DISLIKE'")
    Long countDislikesByPostId(@Param("postId") Long postId);
}
```

**What to do:** Create file with exact code. This defines database queries.

---

## 🎯 Step 10: Create Service Layer

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/service/LikeService.java`

```java
package com.blog.like.service;

import com.blog.like.client.PostServiceClient;
import com.blog.like.client.UserServiceClient;
import com.blog.like.dto.LikeCountDTO;
import com.blog.like.dto.LikeDTO;
import com.blog.like.entity.Like;
import com.blog.like.entity.LikeType;
import com.blog.like.exception.LikeException;
import com.blog.like.repository.LikeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService {
    private static final Logger log = LoggerFactory.getLogger(LikeService.class);
    
    private final LikeRepository likeRepository;
    private final UserServiceClient userServiceClient;
    private final PostServiceClient postServiceClient;

    public LikeService(LikeRepository likeRepository, 
                      UserServiceClient userServiceClient,
                      PostServiceClient postServiceClient) {
        this.likeRepository = likeRepository;
        this.userServiceClient = userServiceClient;
        this.postServiceClient = postServiceClient;
    }

    public LikeDTO createLike(LikeDTO dto) {
        log.info("Creating like for user {} on post {} with type {}", 
                 dto.getUserId(), dto.getPostId(), dto.getLikeType());
        
        // Validate user exists (Feign call)
        userServiceClient.getUserById(dto.getUserId());
        
        // Validate post exists (Feign call)
        postServiceClient.getPostById(dto.getPostId());
        
        // Check if user already liked/disliked this post
        var existing = likeRepository.findByUserIdAndPostId(dto.getUserId(), dto.getPostId());
        
        if (existing.isPresent()) {
            Like existingLike = existing.get();
            // If same type, throw error
            if (existingLike.getLikeType() == dto.getLikeType()) {
                throw new LikeException("User has already " + dto.getLikeType().toString().toLowerCase() + "d this post");
            }
            // If different type, update it (toggle)
            existingLike.setLikeType(dto.getLikeType());
            Like saved = likeRepository.save(existingLike);
            return convertToDTO(saved);
        }
        
        // Create new like
        Like like = new Like(dto.getUserId(), dto.getPostId(), dto.getLikeType());
        Like saved = likeRepository.save(like);
        return convertToDTO(saved);
    }

    public LikeDTO getLikeById(Long id) {
        log.info("Getting like by id {}", id);
        Like like = likeRepository.findById(id)
                .orElseThrow(() -> new LikeException("Like not found with id: " + id));
        return convertToDTO(like);
    }

    public List<LikeDTO> getLikesByPost(Long postId) {
        log.info("Getting likes for post {}", postId);
        
        // Validate post exists
        postServiceClient.getPostById(postId);
        
        List<Like> likes = likeRepository.findByPostId(postId);
        return likes.stream().map(this::convertToDTO).toList();
    }

    public List<LikeDTO> getLikesByUser(Long userId) {
        log.info("Getting likes by user {}", userId);
        
        // Validate user exists
        userServiceClient.getUserById(userId);
        
        List<Like> likes = likeRepository.findByUserId(userId);
        return likes.stream().map(this::convertToDTO).toList();
    }

    public LikeCountDTO getLikeCount(Long postId) {
        log.info("Getting like count for post {}", postId);
        
        // Validate post exists
        postServiceClient.getPostById(postId);
        
        Long likeCount = likeRepository.countLikesByPostId(postId);
        Long dislikeCount = likeRepository.countDislikesByPostId(postId);
        
        return new LikeCountDTO(postId, likeCount, dislikeCount);
    }

    public void deleteLike(Long id) {
        log.info("Deleting like with id {}", id);
        Like like = likeRepository.findById(id)
                .orElseThrow(() -> new LikeException("Like not found with id: " + id));
        likeRepository.delete(like);
    }

    public void deleteLikeByUserAndPost(Long userId, Long postId) {
        log.info("Deleting like for user {} on post {}", userId, postId);
        Like like = likeRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new LikeException("Like not found for user: " + userId + ", post: " + postId));
        likeRepository.delete(like);
    }

    private LikeDTO convertToDTO(Like like) {
        LikeDTO dto = new LikeDTO();
        dto.setId(like.getId());
        dto.setUserId(like.getUserId());
        dto.setPostId(like.getPostId());
        dto.setLikeType(like.getLikeType());
        dto.setCreatedAt(like.getCreatedAt());
        return dto;
    }
}
```

**What to do:** Create file with exact code. Key business logic:
- Validates user & post exist via Feign
- Prevents duplicate likes
- Allows toggling (change dislike to like, etc.)
- Counts likes/dislikes

---

## ⚠️ Step 11: Create Exception Handling

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/exception/LikeException.java`

```java
package com.blog.like.exception;

public class LikeException extends RuntimeException {
    public LikeException(String message) {
        super(message);
    }
}
```

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/exception/GlobalExceptionHandler.java`

```java
package com.blog.like.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(LikeException.class)
    public ResponseEntity<ErrorResponse> handleLikeException(LikeException ex) {
        ErrorResponse error = new ErrorResponse(400, ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse error = new ErrorResponse(500, "Internal server error: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

class ErrorResponse {
    private int status;
    private String message;
    
    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }
    
    public int getStatus() { return status; }
    public String getMessage() { return message; }
}
```

**What to do:** Create both files for error handling.

---

## 🎮 Step 12: Create Controller

**File:** `/Users/shosingh_1/blog-microservices/like-service/src/main/java/com/blog/like/controller/LikeController.java`

```java
package com.blog.like.controller;

import com.blog.like.dto.LikeCountDTO;
import com.blog.like.dto.LikeDTO;
import com.blog.like.service.LikeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {
    private static final Logger log = LoggerFactory.getLogger(LikeController.class);
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping
    public ResponseEntity<LikeDTO> createLike(@Valid @RequestBody LikeDTO likeDTO) {
        log.info("REST call: POST /api/likes - Create like/dislike");
        LikeDTO created = likeService.createLike(likeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LikeDTO> getLikeById(@PathVariable Long id) {
        log.info("REST call: GET /api/likes/{} - Get like by id", id);
        LikeDTO like = likeService.getLikeById(id);
        return ResponseEntity.ok(like);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeDTO>> getLikesByPost(@PathVariable Long postId) {
        log.info("REST call: GET /api/likes/post/{} - Get likes for post", postId);
        List<LikeDTO> likes = likeService.getLikesByPost(postId);
        return ResponseEntity.ok(likes);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LikeDTO>> getLikesByUser(@PathVariable Long userId) {
        log.info("REST call: GET /api/likes/user/{} - Get likes by user", userId);
        List<LikeDTO> likes = likeService.getLikesByUser(userId);
        return ResponseEntity.ok(likes);
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<LikeCountDTO> getLikeCount(@PathVariable Long postId) {
        log.info("REST call: GET /api/likes/count/{} - Get like count for post", postId);
        LikeCountDTO count = likeService.getLikeCount(postId);
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLike(@PathVariable Long id) {
        log.info("REST call: DELETE /api/likes/{} - Delete like", id);
        likeService.deleteLike(id);
        return ResponseEntity.ok("Like deleted successfully");
    }

    @DeleteMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<String> deleteLikeByUserAndPost(@PathVariable Long postId, @PathVariable Long userId) {
        log.info("REST call: DELETE /api/likes/post/{}/user/{} - Delete like for user on post", postId, userId);
        likeService.deleteLikeByUserAndPost(userId, postId);
        return ResponseEntity.ok("Like deleted successfully");
    }
}
```

**What to do:** Create file with exact code. This defines the REST API endpoints.

---

## 📊 Step 13: Update Parent `pom.xml`

**File:** `/Users/shosingh_1/blog-microservices/pom.xml`

Find the `<modules>` section (around line 16) and add:

```xml
<module>like-service</module>
```

Should look like:
```xml
<modules>
    <module>eureka-server</module>
    <module>api-gateway</module>
    <module>user-service</module>
    <module>post-service</module>
    <module>comment-service</module>
    <module>like-service</module>  <!-- Add this -->
</modules>
```

**What to do:** Edit parent pom.xml to include like-service module.

---

## 🛢️ Step 14: Create Database

Run this SQL to create the database and table:

```sql
CREATE DATABASE blog_like_db;

USE blog_like_db;

CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  userId BIGINT NOT NULL,
  postId BIGINT NOT NULL,
  likeType VARCHAR(50) NOT NULL,
  createdAt BIGINT,
  UNIQUE KEY unique_user_post (userId, postId)
);
```

**What to do:** Run this in MySQL client or MySQL Workbench.

---

## 🏗️ Step 15: Update Gateway Routes

**File:** `/Users/shosingh_1/blog-microservices/api-gateway/src/main/java/com/blog/gateway/config/GatewayConfig.java`

Add this route before the closing `.build()`:

```java
.route("like-service", r -> r.path("/api/likes/**")
        .filters(f -> f.filter(trackingFilter))
        .uri("lb://like-service"))
```

The full routes should look like:

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    GatewayFilter trackingFilter = requestTrackingFilter.apply(new Object());
    return builder.routes()
            .route("user-service", r -> r.path("/api/users/**")
                    .filters(f -> f.filter(trackingFilter))
                    .uri("lb://user-service"))
            .route("post-service", r -> r.path("/api/posts/**")
                    .filters(f -> f.filter(trackingFilter))
                    .uri("lb://post-service"))
            .route("comment-service", r -> r.path("/api/comments/**")
                    .filters(f -> f.filter(trackingFilter))
                    .uri("lb://comment-service"))
            .route("like-service", r -> r.path("/api/likes/**")
                    .filters(f -> f.filter(trackingFilter))
                    .uri("lb://like-service"))
            .build();
}
```

**What to do:** Add the like-service route to GatewayConfig.

---

## 🔍 Step 16: Update File Mapping (Optional - for Request Flow Dashboard)

**File:** `/Users/shosingh_1/blog-microservices/frontend/src/services/fileMapping.ts`

Add these mappings at the end (before the closing brace):

```typescript
'GET /api/likes/:id': [
  { name: 'LikeController.java', type: 'controller', path: 'like-service/src/main/java/com/blog/like/controller/', description: 'Handles GET /api/likes/{id}' },
  { name: 'LikeService.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/service/', description: 'Fetches like by ID' },
  { name: 'LikeRepository.java', type: 'repository', path: 'like-service/src/main/java/com/blog/like/repository/', description: 'Queries like from database' },
  { name: 'Like.java', type: 'entity', path: 'like-service/src/main/java/com/blog/like/entity/', description: 'Like entity model' },
],
'POST /api/likes': [
  { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
  { name: 'LikeController.java', type: 'controller', path: 'like-service/src/main/java/com/blog/like/controller/', description: 'Handles POST /api/likes' },
  { name: 'LikeService.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/service/', description: 'Validates user & post via Feign, creates like' },
  { name: 'UserServiceClient.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/client/', description: 'Feign validates user exists' },
  { name: 'PostServiceClient.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/client/', description: 'Feign validates post exists' },
  { name: 'LikeRepository.java', type: 'repository', path: 'like-service/src/main/java/com/blog/like/repository/', description: 'Inserts like into database' },
  { name: 'Like.java', type: 'entity', path: 'like-service/src/main/java/com/blog/like/entity/', description: 'Like entity model' },
],
'DELETE /api/likes/:id': [
  { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
  { name: 'LikeController.java', type: 'controller', path: 'like-service/src/main/java/com/blog/like/controller/', description: 'Handles DELETE /api/likes/{id}' },
  { name: 'LikeService.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/service/', description: 'Deletes like' },
  { name: 'LikeRepository.java', type: 'repository', path: 'like-service/src/main/java/com/blog/like/repository/', description: 'Deletes like from database' },
],
'GET /api/likes/count/:postId': [
  { name: 'LikeController.java', type: 'controller', path: 'like-service/src/main/java/com/blog/like/controller/', description: 'Handles GET /api/likes/count/{postId}' },
  { name: 'LikeService.java', type: 'service', path: 'like-service/src/main/java/com/blog/like/service/', description: 'Aggregates like/dislike counts' },
  { name: 'LikeRepository.java', type: 'repository', path: 'like-service/src/main/java/com/blog/like/repository/', description: 'Queries count from database' },
  { name: 'Like.java', type: 'entity', path: 'like-service/src/main/java/com/blog/like/entity/', description: 'Like entity model' },
],
```

**What to do:** Add these mappings so the Request Flow Dashboard shows which files execute for like service requests.

---

## ✅ Step 17: Build and Test

### 17a: Build the service

```bash
cd /Users/shosingh_1/blog-microservices
mvn clean package -DskipTests
```

This should successfully compile all 6 services including like-service.

### 17b: Create Database (if not done)

```sql
CREATE DATABASE blog_like_db;
USE blog_like_db;
CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  userId BIGINT NOT NULL,
  postId BIGINT NOT NULL,
  likeType VARCHAR(50) NOT NULL,
  createdAt BIGINT,
  UNIQUE KEY unique_user_post (userId, postId)
);
```

### 17c: Start All Services (6 terminals)

```bash
# Terminal 1: Eureka
cd /Users/shosingh_1/blog-microservices/eureka-server && mvn spring-boot:run

# Terminal 2: Gateway
cd /Users/shosingh_1/blog-microservices/api-gateway && mvn spring-boot:run

# Terminal 3: User Service
cd /Users/shosingh_1/blog-microservices/user-service && mvn spring-boot:run

# Terminal 4: Post Service
cd /Users/shosingh_1/blog-microservices/post-service && mvn spring-boot:run

# Terminal 5: Comment Service
cd /Users/shosingh_1/blog-microservices/comment-service && mvn spring-boot:run

# Terminal 6: Like Service (NEW!)
cd /Users/shosingh_1/blog-microservices/like-service && mvn spring-boot:run
```

### 17d: Test the API

```bash
# Create a user first
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "pass123",
    "fullName": "Test User"
  }'

# Create a post
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Post",
    "content": "This is a test"
  }'

# Like the post (replace userId and postId)
curl -X POST http://localhost:8080/api/likes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "postId": 1,
    "likeType": "LIKE"
  }'

# Get like count
curl http://localhost:8080/api/likes/count/1

# Get all likes for a post
curl http://localhost:8080/api/likes/post/1

# Dislike the post (toggle)
curl -X POST http://localhost:8080/api/likes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "postId": 1,
    "likeType": "DISLIKE"
  }'
```

---

## 📝 Summary of Files You'll Create

```
like-service/
├── pom.xml                                           (Step 2)
├── src/main/java/com/blog/like/
│   ├── LikeServiceApplication.java                  (Step 4)
│   ├── entity/
│   │   ├── Like.java                                (Step 5)
│   │   └── LikeType.java                            (Step 6)
│   ├── dto/
│   │   ├── LikeDTO.java                             (Step 7)
│   │   └── LikeCountDTO.java                        (Step 7)
│   ├── client/
│   │   ├── UserServiceClient.java                   (Step 8)
│   │   └── PostServiceClient.java                   (Step 8)
│   ├── repository/
│   │   └── LikeRepository.java                      (Step 9)
│   ├── service/
│   │   └── LikeService.java                         (Step 10)
│   ├── exception/
│   │   ├── LikeException.java                       (Step 11)
│   │   └── GlobalExceptionHandler.java              (Step 11)
│   └── controller/
│       └── LikeController.java                      (Step 12)
└── src/main/resources/
    └── application.yml                              (Step 3)
```

**Files to Modify:**
- Parent `pom.xml` - Add like-service module (Step 13)
- `api-gateway/src/.../GatewayConfig.java` - Add like-service route (Step 15)
- `frontend/src/services/fileMapping.ts` - Add like mappings (Step 16, optional)

---

## 🎓 Key Learning Points

By building this service, you'll learn:

1. ✅ **Microservice structure** - Layered architecture (Controller → Service → Repository)
2. ✅ **Feign clients** - Calling other services from your service
3. ✅ **JPA/Hibernate** - Database operations with unique constraints
4. ✅ **REST API design** - Designing endpoints for like/dislike
5. ✅ **Exception handling** - Global exception handler
6. ✅ **Service registration** - Eureka service discovery
7. ✅ **Gateway integration** - Routes through the gateway
8. ✅ **DTOs** - Transfer objects for requests/responses
9. ✅ **Business logic** - Toggling likes, preventing duplicates
10. ✅ **Aggregation queries** - Counting likes/dislikes

---

## 🚀 Next Steps

1. **Create all files** following Steps 1-12
2. **Build** with `mvn clean package -DskipTests`
3. **Create database** (Step 14)
4. **Update gateway** (Step 15)
5. **Start all 6 services** (Step 17c)
6. **Test endpoints** (Step 17d)
7. **Watch in Request Flow Sidebar** - See requests flowing through

---

**You're ready! Start creating the files and let me know if you hit any issues! 🚀**
