const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function handleResponse(response) {
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

export const api = {
  // Courses
  getCourses: () => fetch(`${BASE_URL}/courses`).then(handleResponse),
  getDeletedCourses: () => fetch(`${BASE_URL}/courses/deleted`).then(handleResponse),
  getCourseById: (id) => fetch(`${BASE_URL}/courses/${id}`).then(handleResponse),
  createCourse: (data) => fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateCourse: (id, data) => fetch(`${BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCourse: (id) => fetch(`${BASE_URL}/courses/${id}`, { method: 'DELETE' }).then(handleResponse),
  restoreCourse: (id) => fetch(`${BASE_URL}/courses/${id}/restore`, { method: 'PUT' }).then(handleResponse),
  reorderCourses: (orderedIds) => fetch(`${BASE_URL}/courses/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderedIds)
  }).then(handleResponse),

  // Modules/Topics
  getModules: (courseId) => fetch(`${BASE_URL}/courses/${courseId}/modules`).then(handleResponse),
  getDeletedModules: (courseId) => fetch(`${BASE_URL}/courses/${courseId}/modules/deleted`).then(handleResponse),
  createModule: (courseId, data) => fetch(`${BASE_URL}/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateModule: (id, data) => fetch(`${BASE_URL}/modules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteModule: (id) => fetch(`${BASE_URL}/modules/${id}`, { method: 'DELETE' }).then(handleResponse),
  restoreModule: (id) => fetch(`${BASE_URL}/modules/${id}/restore`, { method: 'PUT' }).then(handleResponse),
  reorderModules: (orderedIds) => fetch(`${BASE_URL}/modules/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderedIds)
  }).then(handleResponse),

  // Sessions
  getSessions: (moduleId) => fetch(`${BASE_URL}/modules/${moduleId}/sessions`).then(handleResponse),
  getDeletedSessions: (moduleId) => fetch(`${BASE_URL}/modules/${moduleId}/sessions/deleted`).then(handleResponse),
  createSession: (moduleId, data) => fetch(`${BASE_URL}/modules/${moduleId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateSession: (id, data) => fetch(`${BASE_URL}/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteSession: (id) => fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' }).then(handleResponse),
  restoreSession: (id) => fetch(`${BASE_URL}/sessions/${id}/restore`, { method: 'PUT' }).then(handleResponse),
  reorderSessions: (orderedIds) => fetch(`${BASE_URL}/sessions/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderedIds)
  }).then(handleResponse),

  // Resources
  addResource: (sessionId, data) => fetch(`${BASE_URL}/sessions/${sessionId}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteResource: (id) => fetch(`${BASE_URL}/resources/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Practice Links
  addPracticeLink: (sessionId, data) => fetch(`${BASE_URL}/sessions/${sessionId}/practice-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deletePracticeLink: (id) => fetch(`${BASE_URL}/practice-links/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Questions
  getQuestions: (topicId) => fetch(`${BASE_URL}/modules/${topicId}/questions`).then(handleResponse),
  getDeletedQuestions: (topicId) => fetch(`${BASE_URL}/modules/${topicId}/questions/deleted`).then(handleResponse),
  createQuestion: (topicId, data) => fetch(`${BASE_URL}/modules/${topicId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateQuestion: (id, data) => fetch(`${BASE_URL}/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteQuestion: (id) => fetch(`${BASE_URL}/questions/${id}`, { method: 'DELETE' }).then(handleResponse),
  restoreQuestion: (id) => fetch(`${BASE_URL}/questions/${id}/restore`, { method: 'PUT' }).then(handleResponse),
  reorderQuestions: (orderedIds) => fetch(`${BASE_URL}/questions/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderedIds)
  }).then(handleResponse),
};

export default api;
