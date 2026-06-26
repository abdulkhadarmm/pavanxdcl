import { request } from './apiClient';

export const moduleService = {
  getModules: (courseId) => request(`/courses/${courseId}/modules`),
  getDeletedModules: (courseId) => request(`/courses/${courseId}/modules/deleted`),
  createModule: (courseId, data) => request(`/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateModule: (id, data) => request(`/modules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteModule: (id) => request(`/modules/${id}`, {
    method: 'DELETE'
  }),
  restoreModule: (id) => request(`/modules/${id}/restore`, {
    method: 'PUT'
  }),
  reorderModules: (orderedIds) => request('/modules/reorder', {
    method: 'PUT',
    body: JSON.stringify(orderedIds)
  })
};

export default moduleService;
