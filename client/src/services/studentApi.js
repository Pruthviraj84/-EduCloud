import api from './api';

export const studentApi = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  updateProfile: (data) => api.put('/students/profile', data)
};
