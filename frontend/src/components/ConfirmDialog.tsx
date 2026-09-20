import { useEffect, useRef } from 'react';
import './Dialog.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <span className={`dialog-icon icon-${isDangerous ? 'error' : 'warning'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l9 16H3z" />
              <path d="M12 10v4M12 17.5v.01" />
            </svg>
          </span>
          <h2 id="confirm-dialog-title">{title}</h2>
        </div>
        <p className="dialog-message">{message}</p>
        <div className="dialog-buttons">
          <button ref={cancelBtnRef} className="dialog-cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`dialog-confirm-btn ${isDangerous ? 'dangerous' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
