import { request } from './apiClient';

export const sessionService = {
  getSessions: (moduleId) => request(`/modules/${moduleId}/sessions`),
  getDeletedSessions: (moduleId) => request(`/modules/${moduleId}/sessions/deleted`),
  createSession: (moduleId, data) => request(`/modules/${moduleId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSession: (id, data) => request(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSession: (id) => request(`/sessions/${id}`, {
    method: 'DELETE'
  }),
  restoreSession: (id) => request(`/sessions/${id}/restore`, {
    method: 'PUT'
  }),
  reorderSessions: (orderedIds) => request('/sessions/reorder', {
    method: 'PUT',
    body: JSON.stringify(orderedIds)
  }),
  
  // Resource links
  addResource: (sessionId, data) => request(`/sessions/${sessionId}/resources`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteResource: (id) => request(`/resources/${id}`, {
    method: 'DELETE'
  }),

  // Practice links
  addPracticeLink: (sessionId, data) => request(`/sessions/${sessionId}/practice-links`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deletePracticeLink: (id) => request(`/practice-links/${id}`, {
    method: 'DELETE'
  })
};

export default sessionService;
