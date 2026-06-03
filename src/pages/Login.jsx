import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../utils/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [department, setDepartment] = useState('Engineering');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register Call
        const payload = { name, email, password, role, department };
        const res = await apiPost('/auth/register', payload);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data));
      } else {
        // Login Call
        const payload = { email, password };
        const res = await apiPost('/auth/login', payload);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🐛</div>
          <h2 className="header-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="login-subtitle">
            {isRegister
              ? 'Register a new profile in the Issue Tracker'
              : 'Sign in to access your tracking workspace'}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full NameLabel</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Meera Krishnan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. user@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="filter-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="tester">Tester</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            onClick={() => {
              setError('');
              setIsRegister(!isRegister);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-purple)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </div>

        <div className="demo-credentials">
          <h4>💡 Test Instructions:</h4>
          <p>
            You can register a new account above, or click <strong>Sync Dataset</strong> inside
            the dashboard after logging in to populate the database with default server records.
          </p>
        </div>
      </div>
    </div>
  );
}
