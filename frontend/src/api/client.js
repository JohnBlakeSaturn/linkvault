import { API_BASE } from '../utils/constants';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export const api = {
  request,
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  createLink: (formData) => request('/links', { method: 'POST', body: formData }),
  resolveLink: (token, password) =>
    request(`/links/${token}`, {
      headers: password ? { 'x-link-password': password } : {}
    }),
  myLinks: () => request('/links/mine'),
  deleteLink: (id) => request(`/links/mine/${id}`, { method: 'DELETE' })
};
