import api from './api';

export const testApi = {
  getTests: (params) => api.get('/tests', { params }),
  getTestById: (id) => api.get(`/tests/${id}`),
  createTest: (data) => api.post('/tests', data),
  updateTest: (id, data) => api.put(`/tests/${id}`, data),
  deleteTest: (id) => api.delete(`/tests/${id}`),
  generateTestWithAI: (formData) => api.post('/tests/generate-ai', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllQuestions: (params) => api.get('/tests/questions/bank/all', { params }),
  getQuestionsByTest: (testId, mode) => api.get(`/tests/${testId}/questions`, { params: { mode } }),
  addQuestion: (data) => api.post('/tests/questions', data),
  deleteQuestion: (id) => api.delete(`/tests/questions/${id}`),
  submitTest: (submissionData) => api.post('/results/submit', submissionData),
  getResults: (params) => api.get('/results', { params }),
  getResultById: (id) => api.get(`/results/${id}`),
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
  recalculateLeaderboard: (data) => api.post('/leaderboard/recalculate', data),
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`)
};
