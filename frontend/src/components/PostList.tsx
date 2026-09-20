import { postAPI, commentAPI, tagAPI, type Comment as BlogComment, type Tag } from '../api/client';
import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import LikeDislikeButton from './LikeDislikeButton';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import { TrashIcon, EditIcon, CloseIcon, CommentIcon } from './icons';
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
  onRefresh,
  currentUserId,
}: PostListProps) {
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: BlogComment[] }>({});
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [addTagPostId, setAddTagPostId] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editPostForm, setEditPostForm] = useState({ title: '', content: '' });
  const [savingPost, setSavingPost] = useState(false);

  useEffect(() => {
    tagAPI.getAll().then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    preloadComments();
  }, [posts]);

  const preloadComments = async () => {
    if (posts.length === 0) return;
    const allComments: { [key: number]: BlogComment[] } = {};
    for (const post of posts) {
      try {
        const postComments: BlogComment[] = await commentAPI.getByPostId(post.id);
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

  const startEditPost = (post: any) => {
    setEditingPostId(post.id);
    setEditPostForm({ title: post.title, content: post.content });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditPostForm({ title: '', content: '' });
  };

  const handleUpdatePost = async (postId: number) => {
    if (!editPostForm.title.trim() || !editPostForm.content.trim()) {
      setDialog({ title: 'Error', message: 'Title and content are required', type: 'error' });
      return;
    }
    setSavingPost(true);
    try {
      await postAPI.update(postId, {
        title: editPostForm.title,
        content: editPostForm.content,
      });
      setEditingPostId(null);
      onPostDeleted();
    } catch (err) {
      setDialog({
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Failed to update post',
        type: 'error',
      });
    } finally {
      setSavingPost(false);
    }
  };

  const handleToggleComments = (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
  };

  const handleRemoveTag = async (postId: number, tagId: number) => {
    try {
      await tagAPI.removeFromPost(postId, tagId);
      onPostDeleted();
    } catch (err) {
      setDialog({ title: 'Error', message: 'Failed to remove tag', type: 'error' });
    }
  };

  const handleAddTag = async (postId: number, tagId: number) => {
    try {
      await tagAPI.assignToPost(postId, tagId);
      setAddTagPostId(null);
      onPostDeleted();
    } catch (err) {
      setDialog({ title: 'Error', message: 'Tag already assigned or not found', type: 'error' });
    }
  };

  const handleCreateAndAddTag = async (postId: number) => {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    try {
      const created = await tagAPI.create({ name, description: '', color: '#3b82f6' });
      await tagAPI.assignToPost(postId, created.id);
      setAllTags((prev) => [...prev, created]);
      setNewTagName('');
      setAddTagPostId(null);
      onPostDeleted();
    } catch (err) {
      setDialog({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create and add tag',
        type: 'error',
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleCommentAdded = async (postId: number) => {
    try {
      const updated = await commentAPI.getByPostId(postId);
      setComments((prev) => ({ ...prev, [postId]: updated }));
    } catch (err) {
      console.error('Failed to refresh comments:', err);
    }

    // The comment-created Kafka event is consumed asynchronously by post-service,
    // so give it a moment before refetching posts for the updated commentCount.
    setTimeout(() => {
      onRefresh();
    }, 1000);
  };

  return (
    <>
      <div className="post-list">
        {posts.length === 0 ? (
          <p className="empty">No posts yet. Create one!</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                {editingPostId === post.id ? (
                  <input
                    type="text"
                    className="post-edit-title"
                    value={editPostForm.title}
                    onChange={(e) => setEditPostForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Title"
                  />
                ) : (
                  <h2>{post.title}</h2>
                )}
                <div className="post-header-actions">
                  {editingPostId !== post.id && (
                    <button
                      className="btn-edit"
                      onClick={() => startEditPost(post)}
                      title="Edit this post"
                    >
                      <EditIcon />
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => setConfirmDelete(post.id)}
                    title="Delete this post"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            <p className="post-meta">
              by <strong>{getUserName(post.userId)}</strong> •{' '}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            {editingPostId === post.id ? (
              <div className="post-edit-form">
                <textarea
                  className="post-edit-content"
                  value={editPostForm.content}
                  onChange={(e) => setEditPostForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Content"
                  rows={4}
                />
                <div className="post-edit-actions">
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleUpdatePost(post.id)}
                    disabled={savingPost}
                  >
                    {savingPost ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn-cancel" onClick={cancelEditPost}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="post-content">{post.content}</p>
            )}
            <div className="post-tags">
              {post.tagList?.length > 0
                ? post.tagList.map((tag: { id: number; name: string; color: string }) => (
                    <span
                      key={tag.id}
                      className="tag tag-colored"
                      style={{ '--tag-color': tag.color } as React.CSSProperties}
                    >
                      <span className="tag-dot" />
                      {tag.name}
                      <button
                        className="tag-remove"
                        onClick={() => handleRemoveTag(post.id, tag.id)}
                        title="Remove tag"
                        aria-label={`Remove tag ${tag.name}`}
                      >×</button>
                    </span>
                  ))
                : post.tags?.split(',').filter((t: string) => t.trim()).map((tag: string) => (
                    <span key={tag} className="tag">{tag.trim()}</span>
                  ))
              }
              {addTagPostId === post.id ? (
                <div className="tag-add-picker">
                  {allTags
                    .filter(t => !post.tagList?.some((pt: { id: number }) => pt.id === t.id))
                    .map(tag => (
                      <button
                        key={tag.id}
                        className="tag-pill-small"
                        style={{ '--tag-color': tag.color } as React.CSSProperties}
                        onClick={() => handleAddTag(post.id, tag.id)}
                      >
                        <span className="tag-dot" />{tag.name}
                      </button>
                    ))
                  }
                  <form
                    className="tag-create-inline"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateAndAddTag(post.id);
                    }}
                  >
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="New tag name"
                      className="tag-create-input"
                    />
                    <button
                      type="submit"
                      className="tag-create-submit"
                      disabled={creatingTag || !newTagName.trim()}
                    >
                      {creatingTag ? '...' : '+ Create & Add'}
                    </button>
                  </form>
                  <button
                    className="tag-add-cancel"
                    onClick={() => {
                      setAddTagPostId(null);
                      setNewTagName('');
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <button className="btn-add-tag" onClick={() => setAddTagPostId(post.id)} title="Add tag">+ Tag</button>
              )}
            </div>
            <div className="post-actions">
              <LikeDislikeButton postId={post.id} userId={currentUserId} />
              <button
                className="btn-comments"
                onClick={() => handleToggleComments(post.id)}
              >
                <CommentIcon /> Comments ({comments[post.id]?.length || 0})
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
