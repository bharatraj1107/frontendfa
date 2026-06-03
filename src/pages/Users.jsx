import React, { useEffect, useState } from 'react';
import { apiGet } from '../utils/api.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiGet('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch user directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-large" />
        <p>Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="card-title">User Accounts Directory</h3>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>
                  <strong style={{ color: 'var(--accent-purple)' }}>{u.userId}</strong>
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-role-${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.department || 'N/A'}</td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No user records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
