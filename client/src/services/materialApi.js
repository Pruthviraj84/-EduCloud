import api from './api';

export const materialApi = {
  getMaterials: (params) => api.get('/materials', { params }),
  getMaterialById: (id) => api.get(`/materials/${id}`),
  uploadMaterial: (formData) => api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMaterial: (id) => api.delete(`/materials/${id}`)
};
