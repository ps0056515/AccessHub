import { clearToken, getToken, setToken } from './token';

const API_BASE = process.env.REACT_APP_API_URL || '';

async function request(path, options = {}) {
  const { skipAuth, headers: extraHeaders, ...rest } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'omit',
    headers,
  });

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
    let message = data?.error || res.statusText || 'Request failed';
    if (res.status === 431) {
      message =
        'Request rejected (headers too large). Run: npm run build && npm run start:prod';
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

function saveAuthResponse(data) {
  if (data?.token) {
    setToken(data.token);
  }
}

export const authApi = {
  me: () => {
    if (!getToken()) {
      return Promise.reject(new Error('No session'));
    }
    return request('/api/auth/me');
  },
  login: async (email, password) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
    saveAuthResponse(data);
    return data;
  },
  register: async (email, password, displayName) => {
    const data = await request('/api/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password, displayName }),
    });
    saveAuthResponse(data);
    return data;
  },
  logout: async () => {
    try {
      if (getToken()) {
        await request('/api/auth/logout', { method: 'POST' });
      }
    } finally {
      clearToken();
    }
  },
};
