import { useState, useEffect } from 'react';
import { getFilesForRequest, type FileInfo } from '../services/fileMapping';
import styles from './RequestFlowSidebar.module.css';

interface RequestMetadata {
  id: string;
  method: string;
  path: string;
  targetService: string;
  timestamp: string;
  duration: number;
  statusCode: number;
  filesInvolved: string[];
}

interface RequestFlowSidebarProps {
  isVisible: boolean;
  onHide: () => void;
}

export function RequestFlowSidebar({ isVisible, onHide }: RequestFlowSidebarProps) {
  const [requests, setRequests] = useState<RequestMetadata[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tracking/requests?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.reverse());
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusClass = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400 && statusCode < 500) return 'client-error';
    if (statusCode >= 500) return 'server-error';
    return 'pending';
  };

  const getFiles = (method: string, path: string): FileInfo[] => {
    return getFilesForRequest(method, path);
  };

  const getServiceColor = (service: string) => {
    if (service.includes('user')) return '#007bff';
    if (service.includes('post')) return '#28a745';
    if (service.includes('comment')) return '#ffc107';
    return '#6c757d';
  };

  const handleClear = () => {
    setRequests([]);
    setExpandedId(null);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span>📊 Live Requests</span>
        <div className={styles.controls}>
          <button
            className={styles.toggleBtn}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            {autoRefresh ? '⚡' : '⏸'}
          </button>
          <button
            className={styles.refreshBtn}
            onClick={fetchRequests}
            title="Refresh now"
          >
            🔄
          </button>
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            title="Clear all requests"
          >
            🗑️
          </button>
          <button
            className={styles.hideBtn}
            onClick={onHide}
            title="Hide requests panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {requests.length === 0 ? (
          <div className={styles.empty}>
            <p>No requests yet</p>
            <small>Make a request to see it here</small>
          </div>
        ) : (
          <div className={styles.list}>
            {requests.map((req, idx) => (
              <div
                key={req.id}
                className={`${styles.item} ${styles[getStatusClass(req.statusCode)]}`}
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                <div className={styles.itemHeader}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemNum}>{requests.length - idx}</span>
                    <span className={styles.method}>{req.method}</span>
                    <span className={styles.path} title={req.path}>
                      {req.path.length > 20 ? req.path.substring(0, 20) + '...' : req.path}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.duration}>{req.duration}ms</span>
                    <span className={styles.status}>{req.statusCode}</span>
                  </div>
                </div>

                {expandedId === req.id && (
                  <div className={styles.itemDetails}>
                    <div className={styles.detailRow}>
                      <strong>Service:</strong>
                      <span
                        className={styles.service}
                        style={{ backgroundColor: getServiceColor(req.targetService) }}
                      >
                        {req.targetService.split(' ')[0]}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <strong>Time:</strong>
                      <small>{new Date(req.timestamp).toLocaleTimeString()}</small>
                    </div>

                    <div className={styles.filesLabel}>Files:</div>
                    <div className={styles.files}>
                      {getFiles(req.method, req.path).map((file, idx) => (
                        <div key={idx} className={styles.file}>
                          <span className={`${styles.fileType} ${styles[file.type]}`}>
                            {file.type.charAt(0).toUpperCase()}
                          </span>
                          <small title={file.name}>{file.name}</small>
                        </div>
                      ))}
                    </div>

                    <div className={styles.reqId}>
                      <small title={req.id}>
                        ID: {req.id.substring(0, 8)}...
                      </small>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
