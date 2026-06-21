# ✅ Like/Dislike Service - Build Checklist

Use this checklist as you build the service. Check off each step as you complete it.

## 📁 Directory Structure
- [ ] Create `/Users/shosingh_1/blog-microservices/like-service` folder
- [ ] Create subdirectories:
  - [ ] `src/main/java/com/blog/like`
  - [ ] `src/main/java/com/blog/like/controller`
  - [ ] `src/main/java/com/blog/like/service`
  - [ ] `src/main/java/com/blog/like/repository`
  - [ ] `src/main/java/com/blog/like/entity`
  - [ ] `src/main/java/com/blog/like/dto`
  - [ ] `src/main/java/com/blog/like/exception`
  - [ ] `src/main/java/com/blog/like/client`
  - [ ] `src/main/resources`

## 📄 Configuration Files
- [ ] Create `like-service/pom.xml` (Step 2)
- [ ] Create `like-service/src/main/resources/application.yml` (Step 3)

## 🎯 Core Java Classes
- [ ] Create `LikeServiceApplication.java` (Step 4)
- [ ] Create `Like.java` entity (Step 5)
- [ ] Create `LikeType.java` enum (Step 6)
- [ ] Create `LikeDTO.java` DTO (Step 7)
- [ ] Create `LikeCountDTO.java` DTO (Step 7)

## 🔗 Feign Clients
- [ ] Create `UserServiceClient.java` (Step 8)
- [ ] Create `PostServiceClient.java` (Step 8)

## 💾 Data Access
- [ ] Create `LikeRepository.java` (Step 9)

## 🧠 Business Logic
- [ ] Create `LikeService.java` (Step 10)

## ⚠️ Error Handling
- [ ] Create `LikeException.java` (Step 11)
- [ ] Create `GlobalExceptionHandler.java` (Step 11)

## 🎮 API Endpoints
- [ ] Create `LikeController.java` (Step 12)

## 🔧 Integration
- [ ] Update parent `pom.xml` to add like-service module (Step 13)
- [ ] Update `api-gateway/src/.../GatewayConfig.java` with like-service route (Step 15)
- [ ] (Optional) Update `frontend/src/services/fileMapping.ts` (Step 16)

## 🛢️ Database Setup
- [ ] Create `blog_like_db` database
- [ ] Create `likes` table with schema

## 🏗️ Build & Run
- [ ] Build with `mvn clean package -DskipTests`
- [ ] Start Eureka Server (8761)
- [ ] Start API Gateway (8080)
- [ ] Start User Service (8081)
- [ ] Start Post Service (8082)
- [ ] Start Comment Service (8083)
- [ ] Start Like Service (8084) ← NEW!

## 🧪 Testing
- [ ] Create a user via POST /api/users
- [ ] Create a post via POST /api/posts
- [ ] Like a post via POST /api/likes
- [ ] Get like count via GET /api/likes/count/{postId}
- [ ] Get likes for post via GET /api/likes/post/{postId}
- [ ] Dislike (toggle) via POST /api/likes with DISLIKE
- [ ] Delete like via DELETE /api/likes/{id}

## 👀 Verification
- [ ] Check Eureka UI - see all 6 services registered (http://localhost:8761)
- [ ] Check Request Flow Sidebar - see requests flowing through gateway
- [ ] Test all endpoints via cURL or Postman

## 📝 Notes Section

Use this to track any issues or notes:

```
Issue 1:
Resolution:

Issue 2:
Resolution:
```

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Total Files to Create | 15 |
| Total Java Classes | 9 |
| Feign Clients | 2 |
| REST Endpoints | 6 |
| Database Tables | 1 |
| Services Total | 6 |

---

## 🚀 Start Building!

**When ready, just say "I'm starting Step 1" or ask for help on any step!**

I'll guide you through each one. You write the code, I verify and help troubleshoot. 💪
