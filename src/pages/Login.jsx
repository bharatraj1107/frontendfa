import React, { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    window.appState = window.appState || {
      authUser: null,
      token: null,
      users: [],
      projects: [],
      issues: [],
      comments: [],
      filters: {},
      analytics: {}
    };
  }, []);

  return (
    <div>
      <h1>Login</h1>
      <p>This is a placeholder UI for Vercel deployment.</p>
    </div>
  );
}

