# Development Guide - Blog Microservices

## Development Workflow

### 1. Running Services for Development

Each service runs independently with hot reload support.

**Terminal Setup:**
```bash
# Create 4 terminals

# Terminal 1: User Service
cd user-service && mvn spring-boot:run

# Terminal 2: Post Service  
cd post-service && mvn spring-boot:run

# Terminal 3: Comment Service
cd comment-service && mvn spring-boot:run

# Terminal 4: Execute commands
cd /Users/shosingh_1/blog-microservices
```

### 2. Hot Reload During Development

Spring Boot DevTools enables live reload. Any changes to `.java` or `.xml` files automatically restart the service.

**Make a change:**
```bash
# Edit user-service/src/main/java/.../UserService.java
# Save file → Service automatically restarts
```

### 3. Modifying Code

#### Adding New Endpoint

**Example: Add "Like" functionality to Post Service**

1. **Create DTO** (post-service/src/main/java/.../dto/PostLikeDTO.java)
```java
package com.blog.post.dto;

public class PostLikeDTO {
    private Long postId;
    private Long userId;
    private Long likeCount;
}
```

2. **Create Entity** (post-service/src/main/java/.../entity/PostLike.java)
```java
@Entity
@Table(name = "post_likes")
public class PostLike {
    @Id @GeneratedValue
    private Long id;
    private Long postId;
    private Long userId;
}
```

3. **Create Repository** (post-service/src/main/java/.../repository/PostLikeRepository.java)
```java
@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
    long countByPostId(Long postId);
}
```

4. **Create Service** (post-service/src/main/java/.../service/PostLikeService.java)
```java
@Service
public class PostLikeService {
    private final PostLikeRepository likeRepository;
    
    public void likePost(Long postId, Long userId) {
        if (likeRepository.findByPostIdAndUserId(postId, userId).isPresent()) {
            throw new AlreadyLikedException("Already liked");
        }
        PostLike like = new PostLike();
        like.setPostId(postId);
        like.setUserId(userId);
        likeRepository.save(like);
    }
}
```

5. **Add Endpoint** (post-service/src/main/java/.../controller/PostController.java)
```java
@PostMapping("/{postId}/like/{userId}")
public ResponseEntity<Void> likePost(@PathVariable Long postId, @PathVariable Long userId) {
    likeService.likePost(postId, userId);
    return ResponseEntity.ok().build();
}
```

6. **Test**
```bash
curl -X POST http://localhost:8082/api/posts/1/like/1
```

---

#### Calling Another Microservice

**Example: Enrich Post with comment count**

1. **Create Feign Client** (post-service/src/main/java/.../client/)
```java
@FeignClient(name = "comment-service", url = "http://localhost:8083/api/comments")
public interface CommentServiceClient {
    @GetMapping("/post/{postId}")
    List<CommentDTO> getCommentsByPostId(@PathVariable Long postId);
}
```

2. **Update DTO**
```java
@Data
public class PostDTO {
    // ... existing fields
    private int commentCount;
}
```

3. **Update Service**
```java
@Service
public class PostService {
    private final CommentServiceClient commentServiceClient;
    
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id).orElseThrow();
        PostDTO dto = mapToDTO(post);
        
        // Call comment service
        List<CommentDTO> comments = commentServiceClient.getCommentsByPostId(id);
        dto.setCommentCount(comments.size());
        
        return dto;
    }
}
```

4. **Test**
```bash
curl http://localhost:8082/api/posts/1
# Response includes commentCount field
```

---

#### Adding Error Handling

**Example: New custom exception**

1. **Create Exception** (any-service/src/main/java/.../exception/)
```java
public class PostAlreadyLikedException extends RuntimeException {
    public PostAlreadyLikedException(String message) {
        super(message);
    }
}
```

2. **Handle in GlobalExceptionHandler**
```java
@ExceptionHandler(PostAlreadyLikedException.class)
public ResponseEntity<ErrorResponse> handlePostAlreadyLikedException(
        PostAlreadyLikedException ex) {
    log.error("Post already liked: {}", ex.getMessage());
    ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            LocalDateTime.now()
    );
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
}
```

3. **Throw when needed**
```java
throw new PostAlreadyLikedException("User already liked this post");
```

---

### 4. Testing Your Changes

#### Unit Testing (Test Service Layer)

**Example: user-service/src/test/java/.../UserServiceTest.java**

```java
@SpringBootTest
class UserServiceTest {
    
    @MockBean
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
        userDTO.setPassword("pass123");
        
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        
        when(userRepository.save(any())).thenReturn(user);
        
        UserDTO result = userService.createUser(userDTO);
        
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
    }
    
    @Test
    void testUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(UserNotFoundException.class, 
            () -> userService.getUserById(999L));
    }
}
```

**Run tests:**
```bash
mvn test
# or in specific service:
cd user-service && mvn test
```

---

#### Integration Testing (Test full flow)

**Example: post-service/src/test/java/.../PostServiceIntegrationTest.java**

```java
@SpringBootTest
@AutoConfigureMockMvc
class PostServiceIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testCreatePostFlow() throws Exception {
        String postJson = """
            {
                "userId": 1,
                "title": "Test Post",
                "content": "Test content"
            }
        """;
        
        mockMvc.perform(post("/api/posts")
                .contentType("application/json")
                .content(postJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.title").value("Test Post"));
    }
}
```

---

#### Manual Testing

**Option 1: Use provided test script**
```bash
./test-apis.sh
```

**Option 2: Use curl**
```bash
# Create
curl -X POST http://localhost:8082/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Test","content":"Test"}'

# Get
curl http://localhost:8082/api/posts/1

# Update
curl -X PUT http://localhost:8082/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}'

# Delete
curl -X DELETE http://localhost:8082/api/posts/1
```

**Option 3: Import Postman collection**
- Import: `blog-microservices.postman_collection.json`
- All endpoints pre-configured

---

### 5. Debugging

#### Enable Debug Logging

**In application.yml:**
```yaml
logging:
  level:
    com.blog: DEBUG
    org.springframework.web: DEBUG
    org.springframework.cloud.openfeign: DEBUG
```

Restart service → See detailed logs

#### Read Service Logs

**Terminal running service:**
```
2024-04-03 10:15:30.123  INFO  com.blog.post.service.PostService : Creating post for userId: 1
2024-04-03 10:15:30.456 DEBUG  com.blog.post.client.UserServiceClient : Calling user-service...
2024-04-03 10:15:30.789  INFO  com.blog.post.controller.PostController : REST call: POST /api/posts - Create post
```

#### Use IDE Debugger

**IntelliJ IDEA:**
1. Set breakpoint (click line number)
2. Run service with: `mvn spring-boot:run -Dspring-boot.run.arguments="--debug"`
3. Attach debugger: Run → Attach to Process → Select service

---

### 6. Database Inspection

**View database:**
```bash
mysql -u root -p blog_post_db
```

**Useful queries:**
```sql
-- Show all posts
SELECT * FROM posts;

-- Show posts with comment count
SELECT p.*, COUNT(c.id) as comment_count
FROM posts p
LEFT JOIN blog_comment_db.comments c ON p.id = c.postId
GROUP BY p.id;

-- Show user activity
SELECT u.username, COUNT(p.id) as post_count
FROM blog_user_db.users u
LEFT JOIN posts p ON u.id = p.userId
GROUP BY u.id;
```

---

### 7. Common Development Tasks

#### Build Single Service
```bash
cd user-service && mvn clean package
```

#### Run Tests for Service
```bash
cd post-service && mvn test
```

#### Check Dependencies
```bash
cd user-service && mvn dependency:tree
```

#### Format Code
```bash
mvn spotless:apply  # If configured
```

#### Generate Documentation
```bash
mvn javadoc:javadoc
# Output in: target/site/apidocs/
```

---

### 8. Performance Tips

#### Enable Query Logging (to find slow queries)
```yaml
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
```

#### Use Pagination for Large Results
```java
// Instead of:
List<Post> posts = postRepository.findAll();

// Use:
Page<Post> posts = postRepository.findAll(PageRequest.of(0, 10));
```

#### Add Indexes on Frequently Searched Fields
```java
@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_title", columnList = "title")
})
public class Post {
    // ...
}
```

---

### 9. Commit Messages

Follow conventional commits:

```bash
# Feature
git commit -m "feat(post-service): add like functionality"

# Bug fix
git commit -m "fix(comment-service): handle null userId in comment"

# Refactor
git commit -m "refactor(user-service): simplify validation logic"

# Docs
git commit -m "docs: update README with new endpoints"
```

---

### 10. Before Deployment

**Checklist:**
- [ ] All tests pass: `mvn test`
- [ ] Build succeeds: `mvn clean package`
- [ ] No security warnings: Check dependencies
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Logging configured properly
- [ ] Error handling covers edge cases
- [ ] Performance tested with sample data

---

## Useful Commands

```bash
# Build all services
mvn clean package

# Build specific service
cd user-service && mvn clean package

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Run tests
mvn test

# Run specific test
mvn test -Dtest=UserServiceTest

# Generate dependency report
mvn dependency:tree

# Check for dependency conflicts
mvn dependency:analyze

# View project structure
tree -L 3 -I target

# Kill process on port
kill -9 $(lsof -t -i :8081)

# View open ports
lsof -i -P -n

# Watch logs in real-time
tail -f catalina.out
```

---

Good luck with development! 🚀
