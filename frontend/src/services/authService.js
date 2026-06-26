import { request } from './apiClient';

export const authService = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  update: (currentEmail, newEmail, newPassword) => request('/auth/update', {
    method: 'PUT',
    body: JSON.stringify({ currentEmail, newEmail, newPassword })
  }),
  getProfile: () => request('/auth/profile'),
  logout: () => request('/auth/logout', {
    method: 'POST'
  })
};

export default authService;
