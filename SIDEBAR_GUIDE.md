# 📊 Live Request Flow Sidebar - User Guide

## What Changed

Instead of a separate "Request Flow" tab, the **Request Flow Dashboard is now a live sidebar** that stays visible on every page. This lets you see requests flowing through your architecture **while you use the app**.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Blog Platform     [Posts] [Users]                        │
├──────────────────────────────────────────────────┬──────────┤
│                                                   │📊 Live  │
│  Posts or Users Tab Content                      │Requests │
│  (Main area - 60% width)                         │(Sidebar │
│                                                   │-40% of  │
│  ✓ Post/User forms                               │screen)  │
│  ✓ Post/User lists                               │         │
│  ✓ Create/Edit/Delete                            │         │
│                                                   │         │
│                                                   │• Req 1  │
│                                                   │• Req 2  │
│                                                   │• Req 3  │
│                                                   │         │
└──────────────────────────────────────────────────┴──────────┘
```

## How It Works

### On Every Page

The sidebar shows:
- **Live request list** - Last 10 requests
- **Request count** - Numbered 1, 2, 3... (newest on top)
- **Auto-refresh** - Updates every 1.5 seconds
- **Quick status** - Method, path, status code, duration

### Expanding a Request

Click any request in sidebar to see:
- **Service** - Which service handled it (User/Post/Comment)
- **Time** - Exact timestamp
- **Files** - Java files involved in order
- **Request ID** - Unique identifier

### Controls

**⚡ Auto-Refresh Toggle**
- ⚡ (lightning) = Auto-refresh ON
- ⏸ (pause) = Auto-refresh OFF
- Click to toggle

**🔄 Manual Refresh**
- Fetches requests immediately
- Useful when auto-refresh is off

## Using It

### Step 1: Start Everything
```bash
cd /Users/shosingh_1/blog-microservices
# Run all 5 backend services (see QUICK_START.md)
cd frontend && npm run dev
```

### Step 2: Open App
Visit `http://localhost:5173`

You'll see:
- Posts/Users tabs on top
- **Live requests sidebar on the right**

### Step 3: Make Requests

In the **Posts** tab:
1. Create a post
2. **Instantly see it in the sidebar** ← No tab switching!
3. The request card shows up in the sidebar
4. Click it to see the architecture flow

### Step 4: Watch the Sidebar

As you use the app, watch the sidebar update with each request:

```
📊 Live Requests  ⚡ 🔄
─────────────────────
① POST /api/posts [201] 145ms
   ↳ Click to expand

② GET /api/posts  [200] 32ms

③ POST /api/comments [201] 28ms
```

## Sidebar Features

### Compact Request Display

Each request shows:
```
┌─────────────────────────────────┐
│ ① POST /api/posts  145ms [201]  │ ← Quick view
│    ↓ Post Service (2825ms)      │
│    ↓ 6 files involved           │
└─────────────────────────────────┘
```

### Expanded Request View

Click to expand and see:
```
┌─────────────────────────────────┐
│ ① POST /api/posts  145ms [201]  │
├─────────────────────────────────┤
│ Service: Post                   │
│ Time: 14:23:45                  │
│ Files:                          │
│ [F] RequestTrackingFilter.java  │
│ [C] PostController.java         │
│ [S] PostService.java            │
│ [S] UserServiceClient.java      │
│ [R] PostRepository.java         │
│ [E] Post.java                   │
│                                 │
│ ID: 550e8400-e29b...            │
└─────────────────────────────────┘
```

### File Type Badges

- **[F]** 🔴 Filter - Request interception
- **[C]** 🔵 Controller - HTTP entry point
- **[S]** 🟢 Service - Business logic
- **[R]** 🟡 Repository - Database
- **[E]** 🔵 Entity - Data model

### Status Colors

- **Green border** = Success (200-299)
- **Yellow border** = Client error (400-499)
- **Red border** = Server error (500+)
- **Gray border** = Other

## Real-Time Observation

### What to Watch For

1. **Request Order** - See requests in real-time
2. **Duration** - How long each request takes
3. **Service Routing** - Which service handles each request
4. **File Flow** - The exact path through Java code
5. **Patterns** - Which requests are slow/fast

### Try These Actions

**In Posts Tab:**
```
1. Create Post
   → Watch sidebar show POST /api/posts
   → See files: Controller → Service → Repository
   
2. View Posts
   → Watch sidebar show GET /api/posts
   → See files: Controller → Service → Repository + Feign call
   
3. Delete Post
   → Watch sidebar show DELETE /api/posts
```

**In Users Tab:**
```
1. Create User
   → Watch sidebar show POST /api/users
   
2. View Users
   → Watch sidebar show GET /api/users
```

## Mobile View

On smaller screens (< 1024px):
- Sidebar moves to **bottom** instead of right side
- Full width below the main content
- Height capped at 300px
- Still fully functional

## Performance

### Lightweight Design

- Only last 10 requests stored (not 100 like full dashboard)
- Compact display (small font, minimal space)
- 1.5 second polling (not 2 seconds)
- No performance impact on main app

### Memory Usage

- Sidebar requests: ~10-15KB
- Main app: Unchanged
- Total overhead: Minimal

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Sidebar empty | Make requests in Posts/Users tabs |
| Not auto-updating | Click ⚡ to ensure auto-refresh is ON |
| Services not showing | Verify gateway (8080) is running |
| Can't see all files | Expand the request card |
| Sidebar too small | Resize browser or use full dashboard |

## Switching to Full Dashboard

If you prefer the full dashboard with more details:
- See **REQUEST_FLOW_GUIDE.md** for instructions
- Full dashboard available anytime

## Keyboard Shortcuts

- **Click request** - Toggle expand/collapse
- **Click ⚡** - Toggle auto-refresh
- **Click 🔄** - Manual refresh

## Tips & Tricks

### 1. Monitor While Working
Use sidebar to monitor requests while filling forms

### 2. Debug Slow Requests
Watch duration values - high numbers indicate slow queries

### 3. Watch Service Dependencies
See when one service calls another (Feign calls)

### 4. Compare Endpoints
Make the same request multiple times to see performance

## Architecture at a Glance

From the sidebar you can see:
```
Client Request (5173)
    ↓ (shown in sidebar)
Gateway (8080) [Tracking starts]
    ↓ (shown as Service)
Target Service (8081/8082/8083)
    ↓ (shown as Files)
Database
```

## Next Steps

- Make requests while watching sidebar
- Click requests to understand the flow
- Try different endpoints (posts, users, comments)
- Note performance differences
- See inter-service communication (Feign calls)

---

**Enjoy the real-time visibility! 🚀**

The sidebar gives you instant feedback on your system's behavior without interrupting your workflow.
