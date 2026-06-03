const DEFAULT_BASE_URL = 'https://backendfa.onrender.com/api';
// Fallback to local server if we are running locally and have a local env override
const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Direct redirect to login in case of unauthenticated requests
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const apiGet = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const apiPatch = async (path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const apiDelete = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};
