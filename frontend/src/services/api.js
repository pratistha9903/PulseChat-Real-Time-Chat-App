const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function getToken() {
  return localStorage.getItem('pulsechat_token');
}

function clearSession() {
  localStorage.removeItem('pulsechat_token');
  localStorage.removeItem('pulsechat_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const isAuthAttempt = path.includes('/api/auth/login') || path.includes('/api/auth/register');
    if (!isAuthAttempt) {
      clearSession();
      onUnauthorized?.();
    }
    throw new Error(data.error || 'Session expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

export function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || API_URL;
}

export function getApiUrl() {
  return API_URL;
}

export const api = {
  getMe: () => request('/api/auth/me'),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getRooms: () => request('/api/rooms'),
  getRoom: (id) => request(`/api/rooms/${id}`),
  createRoom: (body) => request('/api/rooms/group', { method: 'POST', body: JSON.stringify(body) }),
  createGroup: (body) => request('/api/rooms/group', { method: 'POST', body: JSON.stringify(body) }),
  createDm: (userId) => request(`/api/rooms/dm/${userId}`, { method: 'POST' }),
  joinRoom: (id) => request(`/api/rooms/${id}/join`, { method: 'POST' }),
  getRoomMembers: (id) => request(`/api/rooms/${id}/members`),
  getUsers: () => request('/api/rooms/users'),
  searchUsers: (q) => request(`/api/rooms/users/search?q=${encodeURIComponent(q)}`),

  getMessages: (roomId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/messages/${roomId}${qs ? `?${qs}` : ''}`);
  },
  sendMessage: (roomId, body) =>
    request(`/api/messages/${roomId}`, { method: 'POST', body: JSON.stringify(body) }),
  editMessage: (id, content) =>
    request(`/api/messages/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteMessage: (id) => request(`/api/messages/${id}`, { method: 'DELETE' }),
  markRead: (roomId, messageId) =>
    request(`/api/messages/${roomId}/read`, { method: 'POST', body: JSON.stringify({ messageId }) }),
  searchMessages: (q) => request(`/api/messages/search?q=${encodeURIComponent(q)}`),

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/api/upload', { method: 'POST', body: formData });
  },
};
