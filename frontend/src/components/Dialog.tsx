import { useEffect, useRef } from 'react';
import './Dialog.css';

interface DialogProps {
  title: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  onClose: () => void;
}

const iconPaths: Record<DialogProps['type'], React.ReactNode> = {
  error: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 5-5" /></>,
  warning: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.5v.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M12 11v5" /></>,
};

export default function Dialog({ title, message, type, onClose }: DialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <span className={`dialog-icon icon-${type}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {iconPaths[type]}
            </svg>
          </span>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <p className="dialog-message">{message}</p>
        <button ref={closeBtnRef} className="dialog-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
