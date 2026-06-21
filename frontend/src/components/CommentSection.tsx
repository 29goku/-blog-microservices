import { useState } from 'react';
import { commentAPI } from '../api/client';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import './CommentSection.css';

interface CommentSectionProps {
  postId: number;
  comments: any[];
  users: any[];
  onCommentAdded: () => void;
  currentUserId: number;
}

export default function CommentSection({
  postId,
  comments,
  users,
  onCommentAdded,
  currentUserId,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(String(currentUserId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const getUserName = (userId: number) => {
    return users.find((u) => u.id === userId)?.username || `User ${userId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newComment.trim()) {
      setError('Please select a user and enter a comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await commentAPI.create({
        postId,
        userId: Number(selectedUserId),
        content: newComment,
      });
      setNewComment('');
      setSelectedUserId('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    setConfirmDelete(null);
    try {
      await commentAPI.delete(commentId);
      onCommentAdded();
    } catch (err) {
      setDialog({
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete comment',
        type: 'error',
      });
    }
  };

  return (
    <>
      <div className="comment-section">
        <form className="comment-form" onSubmit={handleSubmit}>
          {error && <div className="error">❌ {error}</div>}
          <div className="form-row">
            <span className="commenter-badge">
              👤 {users.find((u) => u.id === currentUserId)?.username || `User ${currentUserId}`}
            </span>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <button type="submit" disabled={loading} className="btn-comment">
              💬 Post
            </button>
          </div>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <strong>{getUserName(comment.userId)}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
                <button
                  className="btn-delete-comment"
                  onClick={() => setConfirmDelete(comment.id)}
                  title="Delete this comment"
                >
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {dialog && <Dialog {...dialog} onClose={() => setDialog(null)} />}
      {confirmDelete !== null && (
        <ConfirmDialog
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
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
