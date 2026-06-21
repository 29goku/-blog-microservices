export interface FileInfo {
  name: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'filter';
  path: string;
  description: string;
}

export const FILE_MAPPING: Record<string, FileInfo[]> = {
  'GET /api/users': [
    { name: 'UserController.java', type: 'controller', path: 'user-service/src/main/java/com/blog/user/controller/', description: 'Handles GET /api/users request' },
    { name: 'UserService.java', type: 'service', path: 'user-service/src/main/java/com/blog/user/service/', description: 'Retrieves all users from database' },
    { name: 'UserRepository.java', type: 'repository', path: 'user-service/src/main/java/com/blog/user/repository/', description: 'Queries users table' },
    { name: 'User.java', type: 'entity', path: 'user-service/src/main/java/com/blog/user/entity/', description: 'User entity model' },
  ],
  'POST /api/users': [
    { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
    { name: 'UserController.java', type: 'controller', path: 'user-service/src/main/java/com/blog/user/controller/', description: 'Handles POST /api/users request' },
    { name: 'UserService.java', type: 'service', path: 'user-service/src/main/java/com/blog/user/service/', description: 'Creates new user' },
    { name: 'UserRepository.java', type: 'repository', path: 'user-service/src/main/java/com/blog/user/repository/', description: 'Inserts user into database' },
    { name: 'User.java', type: 'entity', path: 'user-service/src/main/java/com/blog/user/entity/', description: 'User entity model' },
  ],
  'GET /api/users/:id': [
    { name: 'UserController.java', type: 'controller', path: 'user-service/src/main/java/com/blog/user/controller/', description: 'Handles GET /api/users/{id}' },
    { name: 'UserService.java', type: 'service', path: 'user-service/src/main/java/com/blog/user/service/', description: 'Fetches user by ID' },
    { name: 'UserRepository.java', type: 'repository', path: 'user-service/src/main/java/com/blog/user/repository/', description: 'Queries user by ID' },
    { name: 'User.java', type: 'entity', path: 'user-service/src/main/java/com/blog/user/entity/', description: 'User entity model' },
  ],
  'GET /api/posts': [
    { name: 'PostController.java', type: 'controller', path: 'post-service/src/main/java/com/blog/post/controller/', description: 'Handles GET /api/posts' },
    { name: 'PostService.java', type: 'service', path: 'post-service/src/main/java/com/blog/post/service/', description: 'Retrieves all posts with user enrichment via Feign' },
    { name: 'UserServiceClient.java', type: 'service', path: 'post-service/src/main/java/com/blog/post/client/', description: 'Feign client calls User Service to enrich post data' },
    { name: 'PostRepository.java', type: 'repository', path: 'post-service/src/main/java/com/blog/post/repository/', description: 'Queries posts table' },
    { name: 'Post.java', type: 'entity', path: 'post-service/src/main/java/com/blog/post/entity/', description: 'Post entity model' },
  ],
  'POST /api/posts': [
    { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
    { name: 'PostController.java', type: 'controller', path: 'post-service/src/main/java/com/blog/post/controller/', description: 'Handles POST /api/posts' },
    { name: 'PostService.java', type: 'service', path: 'post-service/src/main/java/com/blog/post/service/', description: 'Validates user via Feign, creates post' },
    { name: 'UserServiceClient.java', type: 'service', path: 'post-service/src/main/java/com/blog/post/client/', description: 'Feign validates user exists' },
    { name: 'PostRepository.java', type: 'repository', path: 'post-service/src/main/java/com/blog/post/repository/', description: 'Inserts post into database' },
    { name: 'Post.java', type: 'entity', path: 'post-service/src/main/java/com/blog/post/entity/', description: 'Post entity model' },
  ],
  'GET /api/comments': [
    { name: 'CommentController.java', type: 'controller', path: 'comment-service/src/main/java/com/blog/comment/controller/', description: 'Handles GET /api/comments' },
    { name: 'CommentService.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/service/', description: 'Retrieves all comments with enrichment' },
    { name: 'UserServiceClient.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/client/', description: 'Feign enrich with user data' },
    { name: 'PostServiceClient.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/client/', description: 'Feign enrich with post data' },
    { name: 'CommentRepository.java', type: 'repository', path: 'comment-service/src/main/java/com/blog/comment/repository/', description: 'Queries comments table' },
    { name: 'Comment.java', type: 'entity', path: 'comment-service/src/main/java/com/blog/comment/entity/', description: 'Comment entity model' },
  ],
  'POST /api/comments': [
    { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
    { name: 'CommentController.java', type: 'controller', path: 'comment-service/src/main/java/com/blog/comment/controller/', description: 'Handles POST /api/comments' },
    { name: 'CommentService.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/service/', description: 'Validates user & post, creates comment' },
    { name: 'UserServiceClient.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/client/', description: 'Feign validates user exists' },
    { name: 'PostServiceClient.java', type: 'service', path: 'comment-service/src/main/java/com/blog/comment/client/', description: 'Feign validates post exists' },
    { name: 'CommentRepository.java', type: 'repository', path: 'comment-service/src/main/java/com/blog/comment/repository/', description: 'Inserts comment into database' },
    { name: 'Comment.java', type: 'entity', path: 'comment-service/src/main/java/com/blog/comment/entity/', description: 'Comment entity model' },
  ],
  'GET /api/likedislike/count/:id': [
    { name: 'LikeDislikeController.java', type: 'controller', path: 'like-dislike-service/src/main/java/com/blog/likedislike/controller/', description: 'Handles GET /api/likedislike/count/{postId}' },
    { name: 'LikeDislikeService.java', type: 'service', path: 'like-dislike-service/src/main/java/com/blog/likedislike/service/', description: 'Counts likes and dislikes for post' },
    { name: 'LikeDislikeRepository.java', type: 'repository', path: 'like-dislike-service/src/main/java/com/blog/likedislike/repository/', description: 'Queries likes and dislikes by post' },
    { name: 'LikeDislike.java', type: 'entity', path: 'like-dislike-service/src/main/java/com/blog/likedislike/entity/', description: 'Like/Dislike entity model' },
  ],
  'POST /api/likedislike': [
    { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
    { name: 'LikeDislikeController.java', type: 'controller', path: 'like-dislike-service/src/main/java/com/blog/likedislike/controller/', description: 'Handles POST /api/likedislike' },
    { name: 'LikeDislikeService.java', type: 'service', path: 'like-dislike-service/src/main/java/com/blog/likedislike/service/', description: 'Creates or toggles like/dislike' },
    { name: 'LikeDislikeRepository.java', type: 'repository', path: 'like-dislike-service/src/main/java/com/blog/likedislike/repository/', description: 'Inserts or updates like/dislike' },
    { name: 'LikeDislike.java', type: 'entity', path: 'like-dislike-service/src/main/java/com/blog/likedislike/entity/', description: 'Like/Dislike entity model' },
  ],
  'GET /api/likedislike/post/:id': [
    { name: 'LikeDislikeController.java', type: 'controller', path: 'like-dislike-service/src/main/java/com/blog/likedislike/controller/', description: 'Handles GET /api/likedislike/post/{postId}' },
    { name: 'LikeDislikeService.java', type: 'service', path: 'like-dislike-service/src/main/java/com/blog/likedislike/service/', description: 'Fetches all likes/dislikes for post' },
    { name: 'LikeDislikeRepository.java', type: 'repository', path: 'like-dislike-service/src/main/java/com/blog/likedislike/repository/', description: 'Queries likes and dislikes by post' },
    { name: 'LikeDislike.java', type: 'entity', path: 'like-dislike-service/src/main/java/com/blog/likedislike/entity/', description: 'Like/Dislike entity model' },
  ],
  'DELETE /api/likedislike/:id': [
    { name: 'RequestTrackingFilter.java', type: 'filter', path: 'api-gateway/src/main/java/com/blog/gateway/filter/', description: 'Gateway intercepts and tracks request' },
    { name: 'LikeDislikeController.java', type: 'controller', path: 'like-dislike-service/src/main/java/com/blog/likedislike/controller/', description: 'Handles DELETE /api/likedislike/{id}' },
    { name: 'LikeDislikeService.java', type: 'service', path: 'like-dislike-service/src/main/java/com/blog/likedislike/service/', description: 'Deletes like/dislike entry' },
    { name: 'LikeDislikeRepository.java', type: 'repository', path: 'like-dislike-service/src/main/java/com/blog/likedislike/repository/', description: 'Deletes from database' },
  ],
};

export function getFilesForRequest(method: string, path: string): FileInfo[] {
  const normalizedPath = normalizePath(path);
  return FILE_MAPPING[`${method} ${normalizedPath}`] || [];
}

function normalizePath(path: string): string {
  const pathWithoutQuery = path.split('?')[0];
  return pathWithoutQuery
    .replace(/\/\d+$/g, '/:id')
    .replace(/\/count\/\d+$/, '/count/:id')
    .replace(/\/post\/\d+$/, '/post/:id')
    .replace(/\/search.*/, '/search');
}

export function getServiceFromPath(path: string): string {
  if (path.startsWith('/api/users')) return 'user-service (8081)';
  if (path.startsWith('/api/posts')) return 'post-service (8082)';
  if (path.startsWith('/api/comments')) return 'comment-service (8083)';
  if (path.startsWith('/api/likedislike')) return 'like-dislike-service (8084)';
  return 'gateway (8080)';
}
