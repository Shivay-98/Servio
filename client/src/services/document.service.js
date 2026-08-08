import api from './api';

const DOCUMENT_URL = '/documents';

export const uploadDocument = async (formData) => {
  const response = await api.post(DOCUMENT_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get(DOCUMENT_URL);
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`${DOCUMENT_URL}/${id}`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`${DOCUMENT_URL}/${id}`);
  return response.data;
};
