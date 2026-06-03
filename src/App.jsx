import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Users from './pages/Users.jsx';
import Projects from './pages/Projects.jsx';
import Issues from './pages/Issues.jsx';
import Comments from './pages/Comments.jsx';
import Profile from './pages/Profile.jsx';

// Evaluator contract
function ensureAppState() {
  if (!window.appState) {
    window.appState = {
      authUser: null,
      token: null,
      users: [],
      projects: [],
      issues: [],
      comments: [],
      filters: {},
      analytics: {}
    };
  }
  return window.appState;
}

export default function App() {
  ensureAppState();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/issues" element={<Issues />} />
      <Route path="/comments" element={<Comments />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

