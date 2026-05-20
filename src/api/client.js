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
    let message = data?.error || `Request failed (${res.status})`;
    if (typeof message === 'string' && message.toLowerCase().includes('proxy')) {
      message =
        'Cannot reach the API. Run npm run server (port 3015) or npm run dev, then try again.';
    }
    const err = new Error(message);
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

export const postsApi = {
  list: () => api('/api/posts'),
  get: id => api(`/api/posts/${id}`),
  create: body => api('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
  addComment: (id, body) =>
    api(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
};
