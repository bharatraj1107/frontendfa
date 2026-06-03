import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../utils/api.js';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [severity, setSeverity] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formSeverity, setFormSeverity] = useState('minor');
  const [formType, setFormType] = useState('bug');
  const [tags, setTags] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const query = `?search=${search}&priority=${priority}&severity=${severity}&page=1&limit=100`;
      const res = await apiGet(`/issues${query}`);
      setIssues(res.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        apiGet('/projects?page=1&limit=100'),
        apiGet('/users'),
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading issue form requirements:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [search, priority, severity]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/issues', {
        title,
        description,
        project,
        assignedTo: assignedTo || null,
        priority: formPriority,
        severity: formSeverity,
        type: formType,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      });
      setIsCreateOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setProject('');
      setAssignedTo('');
      setFormPriority('medium');
      setFormSeverity('minor');
      setFormType('bug');
      setTags('');
      // Refresh
      fetchIssues();
    } catch (err) {
      alert(`Failed to create issue: ${err.message}`);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await apiPatch(`/issues/${issueId}/status`, { status: newStatus });
      fetchIssues();
      // If modal is open, refresh selected issue state
      if (selectedIssue && selectedIssue.issueId === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleAssignChange = async (issueId, devUserId) => {
    try {
      const res = await apiPatch(`/issues/${issueId}/assign`, { assignedTo: devUserId || null });
      fetchIssues();
      // Update modal state if open
      if (selectedIssue && selectedIssue.issueId === issueId) {
        setSelectedIssue(res.data);
      }
    } catch (err) {
      alert(`Failed to assign developer: ${err.message}`);
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm(`Are you sure you want to delete issue ${issueId}?`)) return;
    try {
      await apiDelete(`/issues/${issueId}`);
      setSelectedIssue(null);
      fetchIssues();
    } catch (err) {
      alert(`Failed to delete issue: ${err.message}`);
    }
  };

  // Group Issues by Status for Kanban Columns
  const columns = {
    open: issues.filter((i) => i.status === 'open'),
    'in-progress': issues.filter((i) => i.status === 'in-progress'),
    testing: issues.filter((i) => i.status === 'testing'),
    resolved: issues.filter((i) => i.status === 'resolved'),
    closed: issues.filter((i) => i.status === 'closed'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
      
      {/* Filters bar */}
      <div className="filter-bar">
        <div className="filter-input-wrap">
          <input
            type="text"
            className="form-input"
            placeholder="Search issues by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          className="filter-select"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="minor">Minor</option>
          <option value="major">Major</option>
          <option value="critical">Critical</option>
          <option value="blocker">Blocker</option>
        </select>

        <button className="action-btn" onClick={() => setIsCreateOpen(true)}>
          <span>➕</span>
          <span>Report Issue</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-large" />
          <p>Loading issues board...</p>
        </div>
      ) : (
        /* Kanban Board */
        <div className="kanban-board">
          {Object.keys(columns).map((status) => (
            <div className="kanban-column" key={status}>
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className={`kanban-dot ${status}`} />
                  <span>{status.replace('-', ' ')}</span>
                </div>
                <span className="kanban-counter">{columns[status].length}</span>
              </div>

              <div className="kanban-cards-container">
                {columns[status].map((issue) => (
                  <div 
                    className="kanban-card" 
                    key={issue.issueId} 
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <span className="issue-id">{issue.issueId}</span>
                    <h4 className="issue-title">{issue.title}</h4>
                    
                    {issue.tags && issue.tags.length > 0 && (
                      <div className="issue-tags">
                        {issue.tags.map((t, idx) => (
                          <span className="issue-tag" key={idx}>{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="issue-card-meta">
                      <span className={`badge-priority ${issue.priority}`}>
                        {issue.priority}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        👤 {issue.assignedTo ? issue.assignedTo.name.split(' ')[0] : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Issue Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Report New Issue</h3>
              <button className="modal-close" onClick={() => setIsCreateOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Issue Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Server connection timeout on signup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Enter replication steps and crash details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select
                    className="filter-select"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.title} ({p.projectId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="filter-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Leave Unassigned</option>
                    {users.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="filter-select"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select
                      className="filter-select"
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                    >
                      <option value="minor">Minor</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                      <option value="blocker">Blocker</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="filter-select"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="task">Task</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="frontend, api, critical"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn">
                  File Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Detail / Edit Modal */}
      {selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <span className="issue-id">{selectedIssue.issueId}</span>
                <h3 className="modal-title">{selectedIssue.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedIssue(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                
                {/* Details Left */}
                <div className="detail-section">
                  <div className="detail-block">
                    <span className="detail-block-label">Description</span>
                    <span className="detail-block-value">
                      {selectedIssue.description || 'No description provided.'}
                    </span>
                  </div>

                  {selectedIssue.tags && selectedIssue.tags.length > 0 && (
                    <div className="detail-block">
                      <span className="detail-block-label">Tags</span>
                      <div className="issue-tags">
                        {selectedIssue.tags.map((t, idx) => (
                          <span className="issue-tag" key={idx}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detail-block">
                    <span className="detail-block-label">Parent Project</span>
                    <span className="detail-block-value" style={{ fontWeight: 600 }}>
                      💼 {selectedIssue.project?.title || 'Unknown Project'} ({selectedIssue.project?.projectId})
                    </span>
                  </div>
                </div>

                {/* Controls Right */}
                <div className="detail-section" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Workflow Status</label>
                    <select
                      className="filter-select"
                      value={selectedIssue.status}
                      onChange={(e) => handleStatusChange(selectedIssue.issueId, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assignee</label>
                    <select
                      className="filter-select"
                      value={selectedIssue.assignedTo?.userId || ''}
                      onChange={(e) => handleAssignChange(selectedIssue.issueId, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.userId} value={u.userId}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="detail-block">
                    <span className="detail-block-label">Reporter</span>
                    <span className="detail-block-value" style={{ fontSize: '13px' }}>
                      👤 {selectedIssue.reportedBy?.name || 'Unknown'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '12px' }}>
                    <div className="meta-item">
                      <span className="meta-label">Priority</span>
                      <span className={`badge-priority ${selectedIssue.priority}`} style={{ width: 'fit-content' }}>
                        {selectedIssue.priority}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Severity</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {selectedIssue.severity}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button 
                      type="button" 
                      className="secondary-btn" 
                      onClick={() => handleDelete(selectedIssue.issueId)}
                      style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', width: '100%' }}
                    >
                      Delete Issue
                    </button>
                  </div>

                </div>

              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="action-btn" onClick={() => setSelectedIssue(null)}>
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
