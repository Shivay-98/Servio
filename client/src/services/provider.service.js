import api from './api';

const PROVIDER_URL = '/provider';

export const getProfile = async () => {
  const response = await api.get(`${PROVIDER_URL}/profile`);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put(`${PROVIDER_URL}/profile`, data);
  return response.data;
};

export const uploadProfilePhoto = async (formData) => {
  const response = await api.post(`${PROVIDER_URL}/profile/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitApplication = async () => {
  const response = await api.post(`${PROVIDER_URL}/application/submit`);
  return response.data;
};

export const getApplicationStatus = async () => {
  const response = await api.get(`${PROVIDER_URL}/application/status`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get(`${PROVIDER_URL}/dashboard`);
  return response.data;
};
