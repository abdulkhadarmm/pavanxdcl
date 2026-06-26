const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function handleResponse(response) {
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
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  }).then(handleResponse);
}

export default apiClient;
const apiClient = { request };
