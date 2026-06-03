import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api.js';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // First try local storage
      const localData = localStorage.getItem('user');
      if (localData) {
        setUser(JSON.parse(localData));
        setLoading(false);
      }

      // Sync with server profile just in case
      try {
        const res = await apiGet('/auth/me');
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to sync profile from server:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-large" />
        <p>Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        <div className="avatar profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
        
        <div>
          <h2>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {user?.email}
          </p>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <span className="profile-label">System User ID</span>
            <span className="profile-value" style={{ color: 'var(--accent-purple)' }}>
              {user?.userId}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Account Role</span>
            <span className="profile-value" style={{ textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Department</span>
            <span className="profile-value">{user?.department || 'Engineering'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Account Status</span>
            <span className="profile-value" style={{ color: '#10b981', fontWeight: 700 }}>
              Active
            </span>
          </div>
          
          {user?.createdAt && (
            <div className="profile-field">
              <span className="profile-label">Member Since</span>
              <span className="profile-value">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout} 
          className="logout-btn" 
          style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
        >
          <span>🚪</span>
          <span>Log Out of Workspace</span>
        </button>

      </div>
    </div>
  );
}
