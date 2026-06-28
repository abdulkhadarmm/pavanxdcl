import { request } from './apiClient';

export const courseService = {
  getCourses: () => request('/courses'),
  getDeletedCourses: () => request('/courses/deleted'),
  getCourseById: (id) => request(`/courses/${id}`),
  getCourseSyllabus: (id) => request(`/courses/${id}/syllabus`),
  getDashboardStats: () => request('/courses/dashboard-stats'),
  createCourse: (data) => request('/courses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCourse: (id, data) => request(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCourse: (id) => request(`/courses/${id}`, {
    method: 'DELETE'
  }),
  restoreCourse: (id) => request(`/courses/${id}/restore`, {
    method: 'PUT'
  }),
  reorderCourses: (orderedIds) => request('/courses/reorder', {
    method: 'PUT',
    body: JSON.stringify(orderedIds)
  })
};

export default courseService;
