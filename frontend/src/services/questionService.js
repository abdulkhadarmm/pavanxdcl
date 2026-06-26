import { request } from './apiClient';

export const questionService = {
  getQuestions: (topicId) => request(`/modules/${topicId}/questions`),
  getDeletedQuestions: (topicId) => request(`/modules/${topicId}/questions/deleted`),
  createQuestion: (topicId, data) => request(`/modules/${topicId}/questions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateQuestion: (id, data) => request(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteQuestion: (id) => request(`/questions/${id}`, {
    method: 'DELETE'
  }),
  restoreQuestion: (id) => request(`/questions/${id}/restore`, {
    method: 'PUT'
  }),
  reorderQuestions: (orderedIds) => request('/questions/reorder', {
    method: 'PUT',
    body: JSON.stringify(orderedIds)
  })
};

export default questionService;
