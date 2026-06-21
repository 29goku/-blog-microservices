import { postAPI, commentAPI, type Comment as BlogComment } from '../api/client';
import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import LikeDislikeButton from './LikeDislikeButton';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import './PostList.css';

interface PostListProps {
  posts: any[];
  users: any[];
  onPostDeleted: () => void;
  onRefresh: () => void;
  currentUserId: number;
}

export default function PostList({
  posts,
  users,
  onPostDeleted,
  onRefresh: _onRefresh,
  currentUserId,
}: PostListProps) {
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: BlogComment[] }>({});
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    preloadComments();
  }, [posts]);

  const preloadComments = async () => {
    if (posts.length === 0) return;
    const allComments: { [key: number]: BlogComment[] } = {};
    for (const post of posts) {
      try {
        const postComments = await commentAPI.getByPostId(post.id);
        allComments[post.id] = postComments;
      } catch (err) {
        console.warn(`Failed to load comments for post ${post.id}`);
        allComments[post.id] = [];
      }
    }
    setComments(allComments);
  };

  const getUserName = (userId: number) => {
    return users.find((u) => u.id === userId)?.username || `User ${userId}`;
  };

  const handleDelete = async (postId: number) => {
    setConfirmDelete(null);
    try {
      await postAPI.delete(postId);
      onPostDeleted();
    } catch (err) {
      setDialog({
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete post',
        type: 'error',
      });
    }
  };

  const handleToggleComments = (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
  };

  const handleCommentAdded = async (postId: number) => {
    try {
      const updated = await commentAPI.getByPostId(postId);
      setComments((prev) => ({ ...prev, [postId]: updated }));
    } catch (err) {
      console.error('Failed to refresh comments:', err);
    }
  };

  return (
    <>
      <div className="post-list">
        {posts.length === 0 ? (
          <p className="empty">📝 No posts yet. Create one!</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <h2>{post.title}</h2>
                <button
                  className="btn-delete"
                  onClick={() => setConfirmDelete(post.id)}
                  title="Delete this post"
                >
                  🗑️
                </button>
              </div>
            <p className="post-meta">
              by <strong>{getUserName(post.userId)}</strong> •{' '}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p className="post-content">{post.content}</p>
            {post.tags && (
              <div className="post-tags">
                {post.tags.split(',').map((tag: string) => (
                  <span key={tag} className="tag">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
            <div className="post-actions">
              <LikeDislikeButton postId={post.id} userId={currentUserId} />
              <button
                className="btn-comments"
                onClick={() => handleToggleComments(post.id)}
              >
                💬 Comments ({comments[post.id]?.length || 0})
              </button>
            </div>
              {expandedPostId === post.id && (
                <CommentSection
                  postId={post.id}
                  comments={comments[post.id] || []}
                  users={users}
                  onCommentAdded={() => handleCommentAdded(post.id)}
                  currentUserId={currentUserId}
                />
              )}
            </article>
          ))
        )}
      </div>

      {dialog && <Dialog {...dialog} onClose={() => setDialog(null)} />}
      {confirmDelete !== null && (
        <ConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
