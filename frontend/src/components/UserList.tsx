import { useState } from 'react';
import { userAPI } from '../api/client';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import './UserList.css';

interface UserListProps {
  users: any[];
  onUserDeleted: () => void;
  onRefresh: () => void;
}

export default function UserList({
  users,
  onUserDeleted,
  onRefresh,
}: UserListProps) {
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = async (userId: number) => {
    setConfirmDelete(null);
    try {
      await userAPI.delete(userId);
      onUserDeleted();
    } catch (err) {
      setDialog({
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete user',
        type: 'error',
      });
    }
  };

  return (
    <>
      <div className="user-list">
        {users.length === 0 ? (
          <p className="empty">👥 No users yet. Create one!</p>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <h3>{user.fullName}</h3>
                  <button
                    className="btn-delete"
                    onClick={() => setConfirmDelete(user.id)}
                    title="Delete this user"
                  >
                    🗑️
                  </button>
                </div>
                <p className="username">@{user.username}</p>
                <p className="email">✉️ {user.email}</p>
                {user.bio && <p className="bio">{user.bio}</p>}
                <p className="created">
                  📅 Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialog && <Dialog {...dialog} onClose={() => setDialog(null)} />}
      {confirmDelete !== null && (
        <ConfirmDialog
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
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
