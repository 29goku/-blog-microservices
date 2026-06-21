# 🚀 Request Flow Dashboard - Quick Start (2 Minutes)

## What You're About to See

An interactive dashboard that shows **EXACTLY** how your microservices process requests, which Java files execute, and where data flows.

## Step 1: Start Everything (5 terminals)

Copy-paste these commands in separate terminals:

```bash
# Terminal 1
cd /Users/shosingh_1/blog-microservices && cd eureka-server && mvn spring-boot:run

# Terminal 2  
cd /Users/shosingh_1/blog-microservices && cd api-gateway && mvn spring-boot:run

# Terminal 3
cd /Users/shosingh_1/blog-microservices && cd user-service && mvn spring-boot:run

# Terminal 4
cd /Users/shosingh_1/blog-microservices && cd post-service && mvn spring-boot:run

# Terminal 5
cd /Users/shosingh_1/blog-microservices && cd comment-service && mvn spring-boot:run

# Terminal 6
cd /Users/shosingh_1/blog-microservices/frontend && npm run dev
```

**Wait 30 seconds for all to start**

## Step 2: Open Dashboard

Open browser to: **http://localhost:5173**

You'll see:
```
┌─────────────────────────────────────────┐
│  📝 Blog Platform                       │
├─────────────────────────────────────────┤
│ [Posts] [Users] [🔍 Request Flow] ←←←  │
└─────────────────────────────────────────┘
```

Click **"🔍 Request Flow"** tab.

## Step 3: Make a Request

Go to **Posts** tab and:
1. Click "Create New Post"
2. Fill in the form (any text)
3. Click "Create Post"

## Step 4: Watch the Magic ✨

Go back to **"🔍 Request Flow"** tab.

You'll see your request appear:

```
Timeline:
┌──────────────────────────────────────────────┐
│ ① POST /api/posts        [201] 145ms        │ ← Your request!
│    Gateway → Post Service → Database        │
│    (Click to see details)                    │
└──────────────────────────────────────────────┘
```

## Step 5: Click & Explore

Click the request card to expand and see:

```
REQUEST FLOW THROUGH ARCHITECTURE:

Client (5173)
  ↓
API Gateway (8080) [RequestTrackingFilter captures]
  ↓
Routing Decision [matches /api/posts → post-service]
  ↓
Post Service (8082)
  ↓
Database

───────────────────────────────────────────────

FILES INVOLVED (in order):

🔴 Filter:     RequestTrackingFilter.java
               Gateway intercepts and tracks

🔵 Controller: PostController.java
               Handles POST /api/posts request

🟢 Service:    PostService.java
               Validates user via Feign, creates post

🟢 Service:    UserServiceClient.java
               Feign client calls User Service

🟡 Repository: PostRepository.java
               Inserts post into database

🔵 Entity:     Post.java
               Post entity model
```

## What You're Learning

Each request shows:
- ✅ **Which service** handled it (port)
- ✅ **How long it took** (duration in ms)
- ✅ **If it succeeded** (status code, color)
- ✅ **Exact Java files** that executed
- ✅ **The complete flow** from UI to database

## Try These Experiments

### 1. Create a User
```
Posts tab → (scroll down) → Create User
Watch the dashboard show: POST /api/users
Files: UserController → UserService → UserRepository
```

### 2. View All Posts
```
Dashboard shows: GET /api/posts
Files: PostController → PostService → UserServiceClient (enriches data with user)
```

### 3. Create a Comment
```
Requires validating both user AND post
Files: CommentController → CommentService → UserServiceClient + PostServiceClient (2 Feign calls!)
```

## Understanding the Colors

**File Type Badges:**
- 🔵 **Blue** = Controller (HTTP entry point)
- 🟢 **Green** = Service (business logic)
- 🟡 **Yellow** = Repository (database access)
- 🔵 **Cyan** = Entity (data model)
- 🔴 **Red/Pink** = Filter (request interception)

**Status Codes:**
- 🟢 **Green left border** = Success (200-299)
- 🟡 **Yellow left border** = Client error (400-499)
- 🔴 **Red left border** = Server error (500+)

## The Architecture

```
┌──────────────────────────────────────────────────────┐
│  Your React App (Port 5173)                          │
│  - Posts Tab (makes requests)                         │
│  - Users Tab (makes requests)                         │
│  - 🔍 Request Flow (watches requests)                 │
└─────────────────────────┬──────────────────────────┘
                          │ All through port 8080
                          ↓
┌──────────────────────────────────────────────────────┐
│  API Gateway (Port 8080)                             │
│  - RequestTrackingFilter [intercepts ALL requests]   │
│  - Routes based on path                              │
│  - Records response time & status                    │
└────┬─────────────────────────────┬──────────────────┘
     │                             │
     ↓ /api/users/**           ↓ /api/posts/**    ↓ /api/comments/**
     
 User Service          Post Service           Comment Service
 (Port 8081)          (Port 8082)             (Port 8083)
 - Database: users    - Database: posts       - Database: comments
 - API routes         - API routes + Feign   - API routes + 2x Feign
                      to User Service        to User & Post
```

## Dashboard Controls

At the top of the dashboard:
- **☑ Auto-refresh** = Check to watch in real-time
- **[Refresh]** = Click to fetch latest manually
- **[Clear History]** = Click to reset timeline

## Ports Quick Reference

Keep this handy:
- **5173** = Frontend (React)
- **8080** = API Gateway ← **All requests route here**
- **8081** = User Service
- **8082** = Post Service  
- **8083** = Comment Service
- **8761** = Eureka (Service Discovery)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No requests appearing | Make a request in Posts/Users tab |
| Dashboard says "No requests yet" | Check auto-refresh is on, or click Refresh |
| Services not running | Check all 6 terminals are showing "started" messages |
| Can't connect to 5173 | Wait 10s for frontend to compile, refresh browser |
| 404 errors in dashboard | Verify all 5 services (not terminal 6) are running |

## What's Happening Behind Scenes

When you create a post:

1. **Browser** sends: `POST http://localhost:8080/api/posts`
2. **Gateway's RequestTrackingFilter** intercepts, records request metadata
3. **GatewayConfig** matches `/api/posts/**` → routes to post-service
4. **Eureka** provides IP/port of post-service (load balanced)
5. **PostController** receives request
6. **PostService** calls **UserServiceClient** via Feign to validate user
7. **UserServiceClient** makes HTTP call to user-service to verify user exists
8. If valid, **PostRepository** saves to database
9. Response travels back through gateway
10. **RequestTrackingFilter** records: duration, status, files involved
11. **TrackingController** exposes via `/api/tracking/requests`
12. **Dashboard** polls tracking endpoint, displays request in timeline
13. **Browser** shows updated data

All visible in the dashboard! 🎯

## Next: Deep Dive

For more detailed info:
- **REQUEST_FLOW_GUIDE.md** = Full documentation with examples
- **INTERACTIVE_DASHBOARD_SUMMARY.md** = Technical details
- **API_GATEWAY_IMPL.md** = Gateway implementation
- **PROJECT_SUMMARY.md** = Overall architecture

---

**You're ready! Start the services and explore! 🚀**

```
Make requests → Watch them flow → See the architecture → Learn how microservices work
```
