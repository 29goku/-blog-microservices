import { useState, useEffect } from 'react';
import { likeDislikeAPI, type LikeDislikeCount } from '../api/client';
import Dialog from './Dialog';
import './LikeDislikeButton.css';

interface LikeDislikeButtonProps {
  postId: number;
  userId: number;
}

export default function LikeDislikeButton({ postId, userId }: LikeDislikeButtonProps) {
  const [counts, setCounts] = useState<LikeDislikeCount>({ postId, likeCount: 0, dislikeCount: 0 });
  const [userVote, setUserVote] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    loadCounts();
  }, [postId]);

  const loadCounts = async () => {
    try {
      const data = await likeDislikeAPI.getCount(postId);
      setCounts(data);
    } catch (err) {
      console.error('Failed to load like/dislike counts:', err);
    }
  };

  const handleToggle = async (type: 'LIKE' | 'DISLIKE') => {
    setLoading(true);
    try {
      await likeDislikeAPI.toggle(userId, postId, type);
      setUserVote(userVote === type ? null : type);
      await loadCounts();
    } catch (err) {
      setDialog({
        title: 'Vote Failed',
        message: err instanceof Error ? err.message : 'Failed to update vote',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="like-dislike-button">
        <button
          className={`btn-like ${userVote === 'LIKE' ? 'active' : ''}`}
          onClick={() => handleToggle('LIKE')}
          disabled={loading}
          title="Like this post"
        >
          👍 {counts.likeCount}
        </button>
        <button
          className={`btn-dislike ${userVote === 'DISLIKE' ? 'active' : ''}`}
          onClick={() => handleToggle('DISLIKE')}
          disabled={loading}
          title="Dislike this post"
        >
          👎 {counts.dislikeCount}
        </button>
      </div>
      {dialog && <Dialog {...dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
