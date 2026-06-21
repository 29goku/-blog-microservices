# Blog Frontend Setup & Running Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            React Frontend (Port 5173)            │
│         ├─ Posts Tab                            │
│         ├─ Users Tab                            │
│         └─ Comments (nested in posts)           │
└─────────────────────────────────────────────────┘
                    ↓ HTTP API calls
┌─────────────────────────────────────────────────┐
│          Your Microservices (Backend)            │
│  ├─ User Service (8081)                         │
│  ├─ Post Service (8082)                         │
│  └─ Comment Service (8083)                      │
└─────────────────────────────────────────────────┘
```

## Quick Start (Run Everything)

### Terminal 1 - Start User Service
```bash
cd /Users/shosingh_1/blog-microservices/user-service
mvn spring-boot:run
```
Runs on: `http://localhost:8081`

### Terminal 2 - Start Post Service
```bash
cd /Users/shosingh_1/blog-microservices/post-service
mvn spring-boot:run
```
Runs on: `http://localhost:8082`

### Terminal 3 - Start Comment Service
```bash
cd /Users/shosingh_1/blog-microservices/comment-service
mvn spring-boot:run
```
Runs on: `http://localhost:8083`

### Terminal 4 - Start React Frontend
```bash
cd /Users/shosingh_1/blog-microservices/frontend
npm run dev
```
Runs on: `http://localhost:5173`

## What You Can Do

### Posts Tab
- ✅ Create a new post (select author, title, content, tags)
- ✅ View all posts with author info
- ✅ View comments on each post
- ✅ Add comments to posts
- ✅ Delete posts and comments

### Users Tab
- ✅ Create a new user (username, email, password, full name, bio)
- ✅ View all users
- ✅ Delete users

## Troubleshooting

### "Failed to fetch" Error
This means one or more backend services aren't running. Make sure:
1. User Service is running on `8081`
2. Post Service is running on `8082`
3. Comment Service is running on `8083`

### CORS Issues (if any)
The frontend calls `http://localhost:8081/8082/8083` - services must be running locally.

### "No users" when creating post
- Create at least one user first in the "Users" tab
- Then create a post and select that user

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          ← API client for all services
│   ├── components/
│   │   ├── PostList.tsx       ← Display posts with comments
│   │   ├── PostForm.tsx       ← Create new posts
│   │   ├── CommentSection.tsx ← Comments UI
│   │   ├── UserList.tsx       ← Display users
│   │   └── UserForm.tsx       ← Create new users
│   ├── App.tsx                ← Main app component
│   └── App.css                ← Global styles
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## API Endpoints Used

The frontend communicates with these endpoints:

**User Service (8081)**
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `DELETE /api/users/{id}` - Delete user

**Post Service (8082)**
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/{id}` - Delete post

**Comment Service (8083)**
- `GET /api/comments/post/{postId}` - Get comments for a post
- `POST /api/comments` - Create comment
- `DELETE /api/comments/{id}` - Delete comment

## Testing Flow

1. **Create a User**
   - Go to "Users" tab → Fill form → Click "Create User"
   
2. **Create a Post**
   - Go to "Posts" tab → Fill form (select the user you created) → Click "Publish Post"
   
3. **Add a Comment**
   - Click "💬 Comments" on a post → Select user → Type comment → Click "Post"

4. **Delete**
   - Click 🗑️ to delete posts/users
   - Click "Delete" on comments

---

**Status:** ✅ Ready to use!

Start all services and enjoy your blog platform! 🚀
