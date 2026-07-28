import api from './api';

export const adminApi = {
  getColleges: () => api.get('/colleges'),
  createCollege: (data) => api.post('/colleges', data),
  getCollegeById: (id) => api.get(`/colleges/${id}`),
  updateCollege: (id, data) => api.put(`/colleges/${id}`, data),
  toggleCollegeStatus: (id) => api.patch(`/colleges/${id}/toggle-status`),
  getAnalyticsReport: () => api.get('/results/reports/analytics')
};
