import api from './api';

const AUTH_URL = '/auth';

export const register = async (data) => {
  const response = await api.post(`${AUTH_URL}/register`, data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post(`${AUTH_URL}/login`, data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post(`${AUTH_URL}/logout`);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get(`${AUTH_URL}/me`);
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post(`${AUTH_URL}/refresh`);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`${AUTH_URL}/verify-email/${token}`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post(`${AUTH_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`${AUTH_URL}/reset-password/${token}`, {
    password,
  });
  return response.data;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const response = await api.put(`${AUTH_URL}/update-password`, {
    currentPassword,
    newPassword,
  });
  return response.data;
};
