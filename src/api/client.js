const API_BASE = process.env.REACT_APP_API_URL || "";
const TOKEN_KEY = "aa-auth-token";
const VOTER_KEY = "aa-voter-key";

export function getVoterKey() {
  try {
    let key = localStorage.getItem(VOTER_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VOTER_KEY, key);
    }
    return key;
  } catch {
    return "anonymous";
  }
}

export function getStoredVote(postId) {
  try {
    const raw = localStorage.getItem(`aa-vote-${postId}`);
    return raw === "up" || raw === "down" ? raw : null;
  } catch {
    return null;
  }
}

export function setStoredVote(postId, direction) {
  try {
    if (direction) localStorage.setItem(`aa-vote-${postId}`, direction);
    else localStorage.removeItem(`aa-vote-${postId}`);
  } catch {
    /* ignore */
  }
}

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
  const { suppressUnauthorizedEvent, ...fetchOptions } = options;
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
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
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !suppressUnauthorizedEvent
    ) {
      window.dispatchEvent(new CustomEvent("aa-unauthorized"));
    }

    let message = data?.error || `Request failed (${res.status})`;
    if (
      typeof message === "string" &&
      message.toLowerCase().includes("proxy")
    ) {
      message =
        "Cannot reach the API. Run npm run server (port 3015) or npm run dev, then try again.";
    }
    const err = new Error(message);
    err.status = res.status;
    if (data && typeof data === 'object') {
      Object.assign(err, data);
    }
    throw err;
  }

  return data;
}

export const authApi = {
  signUp: (body) =>
    api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  signIn: (body) =>
    api("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  signInWithGoogle: (body) =>
    api("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  verifyOtp: (body) =>
    api("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  resendOtp: (body) =>
    api("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  updateProfile: (body) =>
    api("/api/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),
  me: () => api("/api/auth/me", { suppressUnauthorizedEvent: true }),
  signOut: () => api("/api/auth/signout", { method: "POST" }),
  forgotPassword: (body) =>
    api("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
  resetPassword: (body) =>
    api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
      suppressUnauthorizedEvent: true,
    }),
};

export const adminApi = {
  stats: () => api("/api/admin/stats"),
  users: () => api("/api/admin/users"),
  toggleAdminRole: (id, is_admin) =>
    api(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ is_admin }),
    }),
  toggleBlockUser: (id, is_blocked) =>
    api(`/api/admin/users/${id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ is_blocked }),
    }),
  deleteUser: (id) => api(`/api/admin/users/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  get: () => api("/api/settings"),
  update: (body) =>
    api("/api/settings", { method: "PUT", body: JSON.stringify(body) }),
  uploadLogo: (body) =>
    api("/api/settings/upload-logo", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateNavigation: (body) =>
    api("/api/settings/navigation", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  createFooterColumn: (body) =>
    api("/api/settings/footer-columns", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateFooterColumns: (body) =>
    api("/api/settings/footer-columns", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteFooterColumn: (key) =>
    api(`/api/settings/footer-columns/${key}`, { method: "DELETE" }),
};

export const postsApi = {
  list: () => api("/api/posts"),
  get: (id) => api(`/api/posts/${id}`),
  create: (body) =>
    api("/api/posts", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => api(`/api/posts/${id}`, { method: "DELETE" }),
  addComment: (id, body) =>
    api(`/api/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  vote: (id, body) =>
    api(`/api/posts/${id}/vote`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  topContributors: () => api("/api/posts/top-contributors"),
  // Admin methods
  listAdmin: () => api("/api/posts/admin"),
  createAdmin: (body) =>
    api("/api/posts/admin", { method: "POST", body: JSON.stringify(body) }),
  updateAdmin: (id, body) =>
    api(`/api/posts/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteAdmin: (id) => api(`/api/posts/admin/${id}`, { method: "DELETE" }),
  updateCommentAdmin: (postId, commentId, body) =>
    api(`/api/posts/admin/${postId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteCommentAdmin: (postId, commentId) =>
    api(`/api/posts/admin/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};

export const toolsApi = {
  list: () => api("/api/tools"),
  create: (body) =>
    api("/api/tools/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/tools/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id) => api(`/api/tools/admin/${id}`, { method: "DELETE" }),
  reorder: (body) =>
    api("/api/tools/admin/reorder", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const eventsApi = {
  list: () => api("/api/events"),
  rsvp: (eventId, body) =>
    api(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  submitProposal: (body) =>
    api("/api/events/proposals", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  // Admin endpoints
  getRsvpsAdmin: (id) => api(`/api/events/admin/${id}/rsvps`),
  listProposals: () => api("/api/events/admin/proposals"),
  approveProposal: (id, body) =>
    api(`/api/events/admin/proposals/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  rejectProposal: (id) =>
    api(`/api/events/admin/proposals/${id}`, { method: "DELETE" }),
  deleteProposal: (id) =>
    api(`/api/events/admin/proposals/${id}/force`, { method: "DELETE" }),
  create: (body) =>
    api("/api/events/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/events/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id) => api(`/api/events/admin/${id}`, { method: "DELETE" }),
  reorder: (body) =>
    api("/api/events/admin/reorder", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const articlesApi = {
  list: () => api("/api/articles"),
  listAdmin: () => api("/api/articles/admin"),
  get: (id) => api(`/api/articles/${id}`),
  getAdmin: (id) => api(`/api/articles/admin/${id}`),
  uploadCover: (body) =>
    api("/api/articles/upload-cover", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  create: (body) =>
    api("/api/articles", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/articles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  togglePublish: (id, is_published) =>
    api(`/api/articles/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    }),
  delete: (id) => api(`/api/articles/${id}`, { method: "DELETE" }),
};

export const blogpostsApi = {
  list: () => api("/api/blogposts"),
  listAdmin: () => api("/api/blogposts/admin"),
  get: (id) => api(`/api/blogposts/${id}`),
  getAdmin: (id) => api(`/api/blogposts/admin/${id}`),
  uploadCover: (body) =>
    api("/api/blogposts/upload-cover", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  create: (body) =>
    api("/api/blogposts", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/blogposts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  togglePublish: (id, is_published) =>
    api(`/api/blogposts/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    }),
  delete: (id) => api(`/api/blogposts/${id}`, { method: "DELETE" }),
};

export const newsApi = {
  feed: () => api("/api/news/feed"),
};

export const screenReadersApi = {
  list: () => api("/api/screen-readers"),
  get: (id) => api(`/api/screen-readers/${id}`),
  listAdmin: () => api("/api/screen-readers/admin/all"),
  getAdmin: (id) => api(`/api/screen-readers/admin/${id}`),
  create: (data) =>
    api("/api/screen-readers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    api(`/api/screen-readers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  togglePublish: (id, isPublished) =>
    api(`/api/screen-readers/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published: isPublished }),
    }),
  delete: (id) =>
    api(`/api/screen-readers/${id}`, {
      method: "DELETE",
    }),
};

export const resourcesApi = {
  // Public
  list: () => api("/api/resources"),
  submitProposal: (body) =>
    api("/api/resources/proposals", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Admin
  listProposals: () => api("/api/resources/admin/proposals"),
  approveProposal: (id, body) =>
    api(`/api/resources/admin/proposals/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  rejectProposal: (id) =>
    api(`/api/resources/admin/proposals/${id}`, { method: "DELETE" }),
  deleteProposal: (id) =>
    api(`/api/resources/admin/proposals/${id}/force`, { method: "DELETE" }),
  reorder: (body) =>
    api("/api/resources/admin/reorder", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  create: (body) =>
    api("/api/resources/admin", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    api(`/api/resources/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id) => api(`/api/resources/admin/${id}`, { method: "DELETE" }),
};

export const usersApi = {
  getProfile: (id) => api(`/api/users/${id}/profile`),
};
