const API_BASE = process.env.REACT_APP_API_URL || '';
const TOKEN_KEY = 'aa-auth-token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function api(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const authApi = {
  signUp: body => api('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signIn: body => api('/api/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  signInWithGoogle: body =>
    api('/api/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: body => api('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  me: () => api('/api/auth/me'),
  signOut: () => api('/api/auth/signout', { method: 'POST' }),
};

export const adminApi = {
  stats: () => api('/api/admin/stats'),
  users: () => api('/api/admin/users'),
};
