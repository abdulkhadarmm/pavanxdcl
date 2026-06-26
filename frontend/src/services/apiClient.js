const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_token');
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // response was not JSON
    }
    const message = errorData && errorData.message ? errorData.message : 'An unexpected error occurred';
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }
  const json = await response.json();
  return json.data;
}

export function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('admin_session_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  }).then(handleResponse);
}

const apiClient = { request };
export default apiClient;

