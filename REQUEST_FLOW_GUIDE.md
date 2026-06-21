# Interactive Request Flow Dashboard - User Guide

## Overview

The **Request Flow Dashboard** is an interactive visualization tool that shows exactly how API requests flow through your microservices architecture, which files handle each request, and the complete journey from frontend to backend.

## Features

### 🎯 What You'll See

1. **Timeline View** - Sequential list of all API requests made to the system
2. **Request Details** - Click to expand and see full request information
3. **Architecture Diagram** - Visual representation of the request path
4. **File Mapping** - Exact Java files involved in processing each request
5. **Real-time Tracking** - Watch requests appear as they happen
6. **Request Metadata** - Method, path, status code, duration, timestamp

## How to Access

### Starting the System

**Terminal 1: Start Eureka Server**
```bash
cd /Users/shosingh_1/blog-microservices
cd eureka-server && mvn spring-boot:run
```
Expected: Eureka runs on `http://localhost:8761`

**Terminal 2: Start API Gateway**
```bash
cd api-gateway && mvn spring-boot:run
```
Expected: Gateway runs on `http://localhost:8080`

**Terminal 3: Start User Service**
```bash
cd user-service && mvn spring-boot:run
```
Expected: User Service runs on `http://localhost:8081`

**Terminal 4: Start Post Service**
```bash
cd post-service && mvn spring-boot:run
```
Expected: Post Service runs on `http://localhost:8082`

**Terminal 5: Start Comment Service**
```bash
cd comment-service && mvn spring-boot:run
```
Expected: Comment Service runs on `http://localhost:8083`

**Terminal 6: Start Frontend**
```bash
cd frontend
npm install  # if first time
npm run dev
```
Expected: Frontend runs on `http://localhost:5173`

### Accessing the Dashboard

1. Open browser to `http://localhost:5173`
2. You'll see the Blog Platform with 3 tabs:
   - **Posts** - Create and view blog posts
   - **Users** - Create and view users
   - **🔍 Request Flow** - The interactive dashboard (NEW!)

## Using the Dashboard

### Step 1: Navigate to Request Flow Tab

Click the **"🔍 Request Flow"** tab at the top of the page.

### Step 2: Make Requests

In the **Posts** or **Users** tabs, perform actions like:
- Create a new user
- Create a new post
- View all posts
- View all users
- Delete posts/users

### Step 3: Watch the Timeline

As you make requests, they appear in the **Request Flow Dashboard** in real-time:

```
Timeline Layout:
┌─────────────────────────────────────┐
│ 1  POST /api/users      [201] 45ms  │
│ 2  GET /api/posts       [200] 32ms  │
│ 3  POST /api/comments   [201] 28ms  │
└─────────────────────────────────────┘
```

Each number represents the sequence of requests.

### Step 4: Expand Request Details

Click any request card to expand and see:

**Basic Information:**
- Request ID (unique identifier)
- Timestamp (when the request was made)
- Target Service (which service handled it)

**Architecture Flow:**
Visual diagram showing the complete journey:
```
Client (5173) → API Gateway (8080) → Routing → Target Service → Database
```

**Files Involved:**
Exact Java files that executed for this request, in order:

Example for `POST /api/posts`:
```
1. RequestTrackingFilter.java (filter)
   └─ Gateway intercepts and tracks request

2. PostController.java (controller)
   └─ Handles POST /api/posts request

3. PostService.java (service)
   └─ Validates user via Feign, creates post

4. UserServiceClient.java (service)
   └─ Feign client calls User Service to validate

5. PostRepository.java (repository)
   └─ Inserts post into database

6. Post.java (entity)
   └─ Post entity model
```

## Understanding the Flow

### Request Journey

Every request follows this path:

```
1. Browser (React)
   ↓ Makes HTTP request to port 8080
   
2. API Gateway (Spring Cloud Gateway)
   ├─ RequestTrackingFilter captures metadata
   ├─ GatewayConfig matches route based on path
   └─ Routes to appropriate service
   ↓ Load-balanced via Eureka service discovery
   
3. Target Service (User/Post/Comment Service)
   ├─ ServiceController handles request
   ├─ ServiceService processes logic
   ├─ May call other services via Feign
   └─ ServiceRepository queries/updates database
   ↓ Returns response
   
4. Gateway
   ├─ Records response time and status
   └─ Returns response to browser
   
5. Browser
   └─ Displays updated data
```

### Example: Creating a Post

**Request:** `POST /api/posts` with body: `{userId: 1, title: "Hello", content: "World"}`

**Flow:**
1. Browser sends request to `http://localhost:8080/api/posts`
2. API Gateway receives on port 8080
3. RequestTrackingFilter starts tracking
4. GatewayConfig matches `/api/posts/**` pattern
5. Routes to `post-service` on port 8082
6. PostController.createPost() executes
7. PostService validates user exists (calls UserService via Feign)
8. PostRepository saves post to database
9. Response with created post returns
10. Gateway records duration and status
11. Browser receives response, displays new post
12. Dashboard shows request in timeline

**Files Executed (in order):**
- RequestTrackingFilter.java → Gateway filter layer
- PostController.java → Entry point for POST /api/posts
- PostService.java → Business logic
- UserServiceClient.java → Validates user (inter-service call)
- PostRepository.java → Database insert
- Post.java → Entity model
- TrackingController.java → Exposes request tracking data to dashboard

## Dashboard Controls

### Auto-Refresh
✅ **Enabled** (default) - Automatically fetches new requests every 2 seconds
- Uncheck to disable if you want manual refresh

### Refresh Button
Click to manually fetch latest requests immediately

### Clear History
Click to clear all tracked requests from memory
- Useful for starting fresh or reducing memory usage

## Color Coding

### Request Status Indicators
- **Green (Left Border)** - Success (200-299)
- **Yellow (Left Border)** - Client Error (400-499)
- **Red (Left Border)** - Server Error (500+)
- **Gray (Left Border)** - Other

### File Type Badges
- **🔵 Blue** - Controller (HTTP entry point)
- **🟢 Green** - Service (Business logic)
- **🟡 Yellow** - Repository (Database access)
- **🔵 Cyan** - Entity (Data model)
- **🔴 Pink** - Filter (Request interception)

## Key Information Displayed

### Per Request
| Field | Meaning |
|-------|---------|
| Method | HTTP method (GET, POST, PUT, DELETE) |
| Path | API endpoint (e.g., `/api/posts`) |
| Status Code | HTTP response code |
| Duration | Time in milliseconds |
| Request ID | Unique identifier for this request |
| Timestamp | Exact time request was made |
| Target Service | Which microservice handled it |

## Understanding File Types

### Controller
- **Purpose**: HTTP request entry point
- **Responsibility**: Parse request, delegate to service
- **Example**: `UserController.createUser()`

### Service
- **Purpose**: Business logic
- **Responsibility**: Validation, processing, calling other services
- **Example**: `PostService.createPost()` validates user before saving

### Repository
- **Purpose**: Database access
- **Responsibility**: CRUD operations on database
- **Example**: `UserRepository.save(user)`

### Entity
- **Purpose**: Data model
- **Responsibility**: Represents database table structure
- **Example**: `User` class maps to `users` table

### Filter
- **Purpose**: Request interception
- **Responsibility**: Tracking, logging, authentication
- **Example**: `RequestTrackingFilter` captures request metadata

## Troubleshooting

### Dashboard Shows "No requests yet"
- Make requests using the Posts or Users tabs
- Check that auto-refresh is enabled
- Make sure all 5 services are running (Eureka, Gateway, 3 services)

### Requests not appearing in timeline
- **Check 1**: Is API Gateway running? (`http://localhost:8080`)
- **Check 2**: Is frontend making requests through port 8080?
  - Look at browser Network tab (F12)
  - Requests should go to `localhost:8080`, not `8081/8082/8083`
- **Check 3**: Is Eureka running? (`http://localhost:8761`)
  - All 4 services should be registered

### "Failed to fetch requests" error
- Tracking endpoint may be down
- Try `/api/tracking/health` to verify
- Restart API Gateway: `cd api-gateway && mvn spring-boot:run`

### Dashboard not showing in UI
- Restart frontend: `cd frontend && npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)

## Advanced Features

### Viewing Request History
- Dashboard stores last 100 requests in memory
- Use "Clear History" to reset
- Future enhancement: Persist to database

### Exporting Requests
Currently manual but you can:
1. Right-click any request
2. Export JSON from browser console:
   ```javascript
   fetch('http://localhost:8080/api/tracking/requests?limit=100')
     .then(r => r.json())
     .then(data => console.log(JSON.stringify(data, null, 2)))
   ```

### Performance Insights
From the timeline you can analyze:
- **Slowest requests**: Look for high duration values
- **Common patterns**: See which endpoints are called most
- **Error patterns**: Track which requests fail most often
- **Service dependencies**: See Feign calls between services

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│ Web Browser (React App - Port 5173)                         │
│ - Posts Tab                                                  │
│ - Users Tab                                                  │
│ - 🔍 Request Flow Dashboard (NEW)                           │
└──────────────────┬──────────────────────────────────────────┘
                   │ All requests through port 8080
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ API Gateway (Port 8080)                                      │
│ - RequestTrackingFilter (intercepts & tracks)                │
│ - GatewayConfig (route definitions)                          │
│ - TrackingController (exposes tracking data)                 │
└──┬─────────────────┬──────────────────────┬─────────────────┘
   │                 │                      │
   ↓ /api/users/**   ↓ /api/posts/**      ↓ /api/comments/**
   │                 │                      │
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ User Service     │ │ Post Service     │ │ Comment Service  │
│ (Port 8081)      │ │ (Port 8082)      │ │ (Port 8083)      │
│                  │ │                  │ │                  │
│ - Controller     │ │ - Controller     │ │ - Controller     │
│ - Service        │ │ - Service        │ │ - Service        │
│ - Repository     │ │ - Repository     │ │ - Repository     │
│ - Entity         │ │ - Entity         │ │ - Entity         │
│ - Feign Clients  │ │ - Feign Clients  │ │ - Feign Clients  │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
               ┌──────────────────────────────┐
               │ MySQL Databases              │
               │ - blog_user_db               │
               │ - blog_post_db               │
               │ - blog_comment_db            │
               └──────────────────────────────┘

Service Discovery: Eureka (Port 8761)
- All services auto-registered
- Gateway uses Eureka for load balancing
```

## Next Steps

### Educational Value
Use the dashboard to learn:
1. How microservices communicate
2. How a gateway routes requests
3. Which files execute for each request
4. Request lifecycle from UI to database

### Future Enhancements
- Add request filtering/search
- Export request logs
- Performance metrics
- Database query tracking
- Distributed tracing integration

## Quick Reference

### Common Requests & Files

**Creating a User:**
- Path: `POST /api/users`
- Service: user-service (8081)
- Files: UserController → UserService → UserRepository → User entity

**Creating a Post (with user validation):**
- Path: `POST /api/posts`
- Service: post-service (8082)
- Files: PostController → PostService → **UserServiceClient (Feign)** → PostRepository → Post entity

**Creating a Comment (with validations):**
- Path: `POST /api/comments`
- Service: comment-service (8083)
- Files: CommentController → CommentService → **UserServiceClient (Feign)** → **PostServiceClient (Feign)** → CommentRepository → Comment entity

### Port Quick Reference
- **5173**: Frontend (React)
- **8080**: API Gateway
- **8081**: User Service
- **8082**: Post Service
- **8083**: Comment Service
- **8761**: Eureka Service Discovery

---

**Happy exploring! 🚀**

For more information, see:
- `API_GATEWAY_IMPL.md` - Gateway implementation details
- `PROJECT_SUMMARY.md` - Overall project structure
- `QUICK_START.md` - Getting started guide
