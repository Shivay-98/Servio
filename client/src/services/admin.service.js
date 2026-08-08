import api from './api';

const ADMIN_URL = '/admin';

export const getDashboardStats = async () => {
  const response = await api.get(`${ADMIN_URL}/dashboard`);
  return response.data;
};

export const getDashboard = getDashboardStats;

export const getAllProviders = async (params) => {
  const response = await api.get(`${ADMIN_URL}/providers`, { params });
  return response.data;
};

export const getProviders = getAllProviders;

export const getProviderById = async (id) => {
  const response = await api.get(`${ADMIN_URL}/providers/${id}`);
  return response.data;
};

export const reviewApplication = async (id, data) => {
  const response = await api.put(
    `${ADMIN_URL}/providers/${id}/review`,
    data,
  );
  return response.data;
};

export const suspendProvider = async (id, reason) => {
  const response = await api.put(`${ADMIN_URL}/providers/${id}/suspend`, {
    reason,
  });
  return response.data;
};

export const deleteProvider = async (id) => {
  const response = await api.delete(`${ADMIN_URL}/providers/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get(`${ADMIN_URL}/analytics`);
  return response.data;
};
