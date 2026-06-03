import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../utils/api.js';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Stats State
  const [issueStats, setIssueStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [developerStats, setDeveloperStats] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [issuesRes, projectsRes, devsRes] = await Promise.all([
        apiGet('/analytics/issues'),
        apiGet('/analytics/projects'),
        apiGet('/analytics/developers'),
      ]);

      setIssueStats(issuesRes.data);
      setProjectStats(projectsRes.data);
      setDeveloperStats(devsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await apiPost('/sync', {});
      setSyncResult(res.data);
      // Reload dashboard data with new synced records!
      await fetchDashboardData();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-large" />
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Synchronization Banner */}
      <div className="sync-section">
        <div className="sync-info">
          <span className="sync-title">Database Dataset Sync</span>
          <span className="sync-desc">
            Connect to the remote server to pull, parse, and synchronize default issues, users, and comments.
          </span>
        </div>
        <button className="sync-btn" onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <>
              <div className="spinner" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Sync Dataset</span>
            </>
          )}
        </button>
      </div>

      {syncResult && (
        <div 
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <strong>✅ Dataset Synchronization Successful!</strong>
          <div>
            Fetched: <strong>{syncResult.totalFetched}</strong> | 
            Inserted: <strong>{syncResult.inserted}</strong> | 
            Duplicates: <strong>{syncResult.duplicates}</strong> | 
            Rejected: <strong>{syncResult.rejected}</strong>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-label">Total Issues</div>
          <div className="stat-value">{issueStats?.totalIssues || 0}</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-label">Open Issues</div>
          <div className="stat-value">{issueStats?.openIssues || 0}</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-label">In-Progress</div>
          <div className="stat-value">{issueStats?.inProgressIssues || 0}</div>
        </div>
        <div className="stat-card stat-testing">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{issueStats?.resolvedIssues || 0}</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{projectStats?.activeProjects || 0}</div>
        </div>
      </div>

      {/* Leaderboard and Project List */}
      <div className="dashboard-row">
        
        {/* Project List */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="card-title">Projects Status Tracker</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {projectStats?.projects?.slice(0, 5).map((proj) => (
                  <tr key={proj.projectId}>
                    <td><strong style={{ color: 'var(--accent-purple)' }}>{proj.projectId}</strong></td>
                    <td>{proj.title}</td>
                    <td>{proj.owner}</td>
                    <td>
                      <span className={`badge badge-active ${proj.status !== 'active' ? 'badge-inactive' : ''}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td><span className="counter-num">{proj.issueCount}</span></td>
                  </tr>
                ))}
                {(!projectStats?.projects || projectStats.projects.length === 0) && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No projects found. Please run the dataset synchronization.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Developer Leaderboard */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="card-title">Developer Stats</h3>
          </div>

          <div className="leaderboard-list">
            {/* Top Developer */}
            {developerStats?.highestResolvedDeveloper && (
              <div className="leaderboard-item highest">
                <div className="leaderboard-info">
                  <span className="crown-icon">👑</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="leaderboard-name">{developerStats.highestResolvedDeveloper.name}</span>
                    <span className="leaderboard-uid">{developerStats.highestResolvedDeveloper.userId}</span>
                  </div>
                </div>
                <div className="leaderboard-stats">
                  <span>Resolved: <strong className="stat-num">{developerStats.highestResolvedDeveloper.resolvedIssues}</strong></span>
                </div>
              </div>
            )}

            {/* List of Developers */}
            {developerStats?.developers?.slice(0, 5).map((dev) => {
              const isTop = dev.userId === developerStats?.highestResolvedDeveloper?.userId;
              if (isTop) return null; // Already displayed on top
              return (
                <div className="leaderboard-item" key={dev.userId}>
                  <div className="leaderboard-info">
                    <span style={{ fontSize: '14px', marginRight: '6px' }}>👤</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="leaderboard-name">{dev.name}</span>
                      <span className="leaderboard-uid">{dev.userId}</span>
                    </div>
                  </div>
                  <div className="leaderboard-stats">
                    <span>Assigned: <strong>{dev.assignedIssues}</strong></span>
                    <span>Resolved: <strong className="stat-num">{dev.resolvedIssues}</strong></span>
                  </div>
                </div>
              );
            })}
            
            {(!developerStats?.developers || developerStats.developers.length === 0) && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No developer records available.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
