import { useState } from 'react';
import './Dialog.css';

interface DialogProps {
  title: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  onClose: () => void;
}

export default function Dialog({ title, message, type, onClose }: DialogProps) {
  const iconMap = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <span className={`dialog-icon icon-${type}`}>{iconMap[type]}</span>
          <h2>{title}</h2>
        </div>
        <p className="dialog-message">{message}</p>
        <button className="dialog-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
