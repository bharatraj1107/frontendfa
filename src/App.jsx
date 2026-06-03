import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Users from './pages/Users.jsx';
import Projects from './pages/Projects.jsx';
import Issues from './pages/Issues.jsx';
import Comments from './pages/Comments.jsx';
import Profile from './pages/Profile.jsx';

function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Projects', path: '/projects', icon: '📁' },
    { name: 'Issues', path: '/issues', icon: '🐛' },
    { name: 'Comments', path: '/comments', icon: '💬' },
    { name: 'Users', path: '/users', icon: '👥' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">🐛</span>
          <h2 className="logo-text">BugTracker</h2>
        </div>

        {user && (
          <div className="user-badge">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}

        <nav className="nav-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="header-title">
            {menuItems.find((item) => item.path === location.pathname)?.name || 'App'}
          </h1>
          <div className="header-date">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </header>
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <Comments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
