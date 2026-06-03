import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../utils/api.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [owner, setOwner] = useState('');
  const [members, setMembers] = useState([]);
  const [formStatus, setFormStatus] = useState('active');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = `?search=${search}&category=${category}&status=${status}&page=${page}&limit=6`;
      const res = await apiGet(`/projects${query}`);
      setProjects(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiGet('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, category, status, page]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/projects', {
        title,
        description,
        category: formCategory,
        owner,
        members,
        status: formStatus,
      });
      setIsModalOpen(false);
      // Reset Form
      setTitle('');
      setDescription('');
      setFormCategory('');
      setOwner('');
      setMembers([]);
      setFormStatus('active');
      // Refresh list
      fetchProjects();
    } catch (err) {
      alert(`Failed to create project: ${err.message}`);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm(`Are you sure you want to delete project ${projectId}?`)) return;
    try {
      await apiDelete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const toggleMember = (userId) => {
    if (members.includes(userId)) {
      setMembers(members.filter((m) => m !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filters & Actions bar */}
      <div className="filter-bar">
        <div className="filter-input-wrap">
          <input
            type="text"
            className="form-input"
            placeholder="Search projects by title, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="CRM">CRM</option>
          <option value="Billing">Billing</option>
          <option value="Marketing">Marketing</option>
          <option value="Mobile App">Mobile App</option>
          <option value="Infrastructure">Infrastructure</option>
        </select>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <button className="action-btn" onClick={() => setIsModalOpen(true)}>
          <span>➕</span>
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-large" />
          <p>Loading projects...</p>
        </div>
      ) : (
        <>
          <div className="projects-grid">
            {projects.map((proj) => (
              <div className="project-card" key={proj.projectId}>
                <div className="project-card-header">
                  <span className="issue-id">{proj.projectId}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge badge-active ${proj.status !== 'active' ? 'badge-inactive' : ''}`}>
                      {proj.status}
                    </span>
                    <button 
                      onClick={() => handleDelete(proj.projectId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      title="Delete Project"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h3 className="project-title">{proj.title}</h3>
                <p className="project-desc">{proj.description || 'No description provided.'}</p>

                <div className="project-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">{proj.category || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Owner</span>
                    <span className="meta-value">{proj.owner?.name || 'Unassigned'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Members</span>
                    <span className="meta-value">{proj.members?.length || 0} developers</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Started</span>
                    <span className="meta-value">
                      {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No projects match the selected criteria.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button 
                className="secondary-btn" 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: '13px' }}>Page {page} of {totalPages}</span>
              <button 
                className="secondary-btn" 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New Project</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CRM Portal Upgrade"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CRM, Mobile App, Billing"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Enter project details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select
                    className="filter-select"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    required
                  >
                    <option value="">Select Project Owner</option>
                    {users.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Members (Developers/Testers)</label>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {users.map((u) => (
                      <label key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={members.includes(u.userId)}
                          onChange={() => toggleMember(u.userId)}
                        />
                        {u.name} ({u.role})
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="filter-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
