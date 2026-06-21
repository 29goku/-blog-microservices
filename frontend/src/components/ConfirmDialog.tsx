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
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <span className={`dialog-icon icon-${isDangerous ? 'error' : 'warning'}`}>
            {isDangerous ? '⚠️' : '❓'}
          </span>
          <h2>{title}</h2>
        </div>
        <p className="dialog-message">{message}</p>
        <div className="dialog-buttons">
          <button className="dialog-cancel-btn" onClick={onCancel}>
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
