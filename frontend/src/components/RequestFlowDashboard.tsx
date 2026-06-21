import { useState, useEffect } from 'react';
import { getFilesForRequest, type FileInfo } from '../services/fileMapping';
import styles from './RequestFlowDashboard.module.css';

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

export function RequestFlowDashboard() {
  const [requests, setRequests] = useState<RequestMetadata[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestMetadata | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'duration'>('time');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/tracking/requests?limit=50');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.reverse());
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusClass = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400 && statusCode < 500) return 'client-error';
    if (statusCode >= 500) return 'server-error';
    return 'pending';
  };

  const getStatusLabel = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return '✓ Success';
    if (statusCode >= 400 && statusCode < 500) return '⚠ Client Error';
    if (statusCode >= 500) return '✗ Server Error';
    return '⏳ Pending';
  };

  const getFiles = (method: string, path: string): FileInfo[] => {
    return getFilesForRequest(method, path);
  };

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return '#28a745';
      case 'POST': return '#007bff';
      case 'PUT': return '#ffc107';
      case 'DELETE': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
    const req = requests.find(r => r.id === id);
    if (req) setSelectedRequest(req);
  };

  const clearHistory = async () => {
    try {
      await fetch('http://localhost:8080/api/tracking/history', { method: 'DELETE' });
      setRequests([]);
      setExpanded(null);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'success') return getStatusClass(req.statusCode) === 'success';
    if (filter === 'errors') return getStatusClass(req.statusCode) !== 'success';
    if (filter === 'slow') return req.duration > 50;
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'duration') return b.duration - a.duration;
    return 0;
  });

  const stats = {
    total: requests.length,
    success: requests.filter(r => getStatusClass(r.statusCode) === 'success').length,
    errors: requests.filter(r => getStatusClass(r.statusCode) !== 'success').length,
    avgDuration: requests.length > 0 ? Math.round(requests.reduce((a, b) => a + b.duration, 0) / requests.length) : 0,
    slowest: requests.length > 0 ? Math.max(...requests.map(r => r.duration)) : 0,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>📊 API Request Flow Dashboard</h2>
          <p className={styles.subtitle}>Real-time microservices request tracking</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={fetchRequests} disabled={loading} className={styles.refreshBtn}>
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          <button onClick={clearHistory} className={styles.dangerBtn}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Requests</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statLabel}>Successful</div>
          <div className={styles.statValue}>{stats.success}</div>
        </div>
        <div className={`${styles.statCard} ${styles.error}`}>
          <div className={styles.statLabel}>Errors</div>
          <div className={styles.statValue}>{stats.errors}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Duration</div>
          <div className={styles.statValue}>{stats.avgDuration}ms</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Slowest</div>
          <div className={styles.statValue}>{stats.slowest}ms</div>
        </div>
      </div>

      <div className={styles.instructions}>
        <p>
          <strong>🔍 How to read:</strong> Each request shows its journey from React Client → API Gateway →
          Request Tracker → Target Microservice. Click any request to see detailed file flow and architecture involvement.
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Filter by:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.select}>
            <option value="all">All Requests</option>
            <option value="success">Successful Only</option>
            <option value="errors">Errors Only</option>
            <option value="slow">Slow (>50ms)</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'time' | 'duration')} className={styles.select}>
            <option value="time">Most Recent</option>
            <option value="duration">Slowest First</option>
          </select>
        </div>
        <div className={styles.resultCount}>
          Showing {sortedRequests.length} of {requests.length} requests
        </div>
      </div>

      {sortedRequests.length === 0 ? (
        <div className={styles.empty}>
          <p>📭 No requests yet. Make some requests using the Posts/Users tabs above!</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.requestsList}>
            {sortedRequests.map((req, idx) => (
              <div
                key={req.id}
                className={`${styles.requestItem} ${expanded === req.id ? styles.expanded : ''} ${styles[getStatusClass(req.statusCode)]}`}
                onClick={() => toggleExpand(req.id)}
              >
                <div className={styles.requestItemHeader}>
                  <div className={styles.requestNumber}>{sortedRequests.length - idx}</div>
                  <div className={styles.methodBadge} style={{ backgroundColor: getMethodColor(req.method) }}>
                    {req.method}
                  </div>
                  <div className={styles.pathDisplay}>{req.path}</div>
                  <div className={styles.statusBadge} style={{ borderColor: getMethodColor(req.method) }}>
                    {req.statusCode}
                  </div>
                  <div className={styles.durationDisplay}>{req.duration}ms</div>
                  <div className={styles.expandIndicator}>
                    {expanded === req.id ? '▼' : '▶'}
                  </div>
                </div>

                {expanded === req.id && (
                  <div className={styles.requestItemDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailSection}>
                        <div className={styles.sectionTitle}>📍 Request Info</div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>ID:</span>
                          <code className={styles.value}>{req.id.substring(0, 12)}...</code>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Time:</span>
                          <span className={styles.value}>{new Date(req.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Duration:</span>
                          <span className={styles.value}>{req.duration}ms</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Status:</span>
                          <span className={`${styles.value} ${styles[`status-${Math.floor(req.statusCode/100)}xx`]}`}>
                            {req.statusCode} - {getStatusLabel(req.statusCode)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.flowVisualization}>
                        <div className={styles.flowTitle}>🔀 Request Flow Architecture</div>
                        <div className={styles.flowTree}>
                          <div className={styles.treeLevel}>
                            <div className={`${styles.flowNode} ${styles.client} ${styles.nodeLevel0}`}>
                              <div className={styles.nodeIcon}>📱</div>
                              <div className={styles.nodeName}>Client</div>
                              <div className={styles.nodePort}>React:5173</div>
                              <div className={styles.nodeStatus}>Initiates Request</div>
                            </div>
                            <div className={styles.verticalConnector}></div>
                          </div>

                          <div className={styles.treeLevel}>
                            <div className={`${styles.flowNode} ${styles.gateway} ${styles.nodeLevel1}`}>
                              <div className={styles.nodeIcon}>🔗</div>
                              <div className={styles.nodeName}>API Gateway</div>
                              <div className={styles.nodePort}>localhost:8080</div>
                              <div className={styles.nodeStatus}>Routes & Forwards</div>
                            </div>
                            <div className={styles.verticalConnector}></div>
                          </div>

                          <div className={styles.treeLevel}>
                            <div className={`${styles.flowNode} ${styles.filter} ${styles.nodeLevel2}`}>
                              <div className={styles.nodeIcon}>🔍</div>
                              <div className={styles.nodeName}>Request Tracking</div>
                              <div className={styles.nodePort}>RequestTrackingFilter</div>
                              <div className={styles.nodeStatus}>Intercepts & Logs</div>
                            </div>
                            <div className={styles.verticalConnector}></div>
                          </div>

                          <div className={styles.treeLevel}>
                            <div className={`${styles.flowNode} ${styles.service} ${styles.nodeLevel3}`}>
                              <div className={styles.nodeIcon}>⚙️</div>
                              <div className={styles.nodeName}>{req.targetService.split(' ')[0]}</div>
                              <div className={styles.nodePort}>{req.targetService}</div>
                              <div className={styles.nodeStatus}>Processes Request</div>
                            </div>
                          </div>

                          <div className={styles.flowStats}>
                            <div className={styles.flowStat}>
                              <span className={styles.statIcon}>⏱️</span>
                              <span className={styles.statLabel}>Total Time:</span>
                              <span className={styles.statValue}>{req.duration}ms</span>
                            </div>
                            <div className={styles.flowStat}>
                              <span className={styles.statIcon}>📍</span>
                              <span className={styles.statLabel}>Response:</span>
                              <span className={`${styles.statValue} ${styles[`stat-${Math.floor(req.statusCode/100)}xx`]}`}>{req.statusCode}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.filesInvolved}>
                      <div className={styles.filesTitle}>📁 Files Processing This Request</div>
                      <div className={styles.filesList}>
                        {getFiles(req.method, req.path).length > 0 ? (
                          getFiles(req.method, req.path).map((file, idx) => (
                            <div key={idx} className={styles.fileFlow}>
                              <div className={styles.fileStep}>
                                <span className={`${styles.fileBadge} ${styles[file.type]}`}>
                                  {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                                </span>
                                <div className={styles.fileInfo}>
                                  <div className={styles.fileName}>{file.name}</div>
                                  <div className={styles.filePath}>{file.path}</div>
                                  <div className={styles.fileDesc}>{file.description}</div>
                                </div>
                              </div>
                              {idx < getFiles(req.method, req.path).length - 1 && (
                                <div className={styles.fileArrow}>↓</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className={styles.noFiles}>No file mapping found for this request type</div>
                        )}
                      </div>
                    </div>

                    <div className={styles.requestMetrics}>
                      <div className={styles.metricsTitle}>📊 Performance Metrics</div>
                      <div className={styles.metricsGrid}>
                        <div className={styles.metricItem}>
                          <div className={styles.metricLabel}>Response Time</div>
                          <div className={styles.metricValue}>{req.duration}ms</div>
                          <div className={`${styles.metricBar} ${req.duration > 100 ? styles.slow : req.duration > 50 ? styles.medium : styles.fast}`}>
                            <div className={styles.metricFill} style={{width: `${Math.min((req.duration / 200) * 100, 100)}%`}}></div>
                          </div>
                        </div>
                        <div className={styles.metricItem}>
                          <div className={styles.metricLabel}>Status Code</div>
                          <div className={`${styles.metricValue} ${styles[`code-${Math.floor(req.statusCode/100)}xx`]}`}>{req.statusCode}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedRequest && expanded === selectedRequest.id && (
            <div className={styles.sidebar}>
              <div className={styles.sidebarTitle}>📋 Request Details</div>
              <div className={styles.sidebarContent}>
                <div className={styles.sidebarSection}>
                  <h4>Endpoint</h4>
                  <code className={styles.code}>{selectedRequest.method} {selectedRequest.path}</code>
                </div>
                <div className={styles.sidebarSection}>
                  <h4>Target Service</h4>
                  <div className={styles.serviceName}>{selectedRequest.targetService}</div>
                </div>
                <div className={styles.sidebarSection}>
                  <h4>Timeline</h4>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <span className={styles.time}>Request Start</span>
                      <span className={styles.dot}></span>
                    </div>
                    <div className={styles.timelineLine}></div>
                    <div className={styles.timelineItem}>
                      <span className={styles.time}>Processing</span>
                      <span className={styles.dot}>{selectedRequest.duration}ms</span>
                    </div>
                    <div className={styles.timelineLine}></div>
                    <div className={styles.timelineItem}>
                      <span className={styles.time}>Response</span>
                      <span className={styles.dot}>{selectedRequest.statusCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
