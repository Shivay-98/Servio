import api from './api';

const CATEGORY_URL = '/categories';

export const getCategories = async () => {
  const response = await api.get(CATEGORY_URL);
  return response.data;
};

export const getCategory = async (id) => {
  const response = await api.get(`${CATEGORY_URL}/${id}`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post(CATEGORY_URL, data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`${CATEGORY_URL}/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`${CATEGORY_URL}/${id}`);
  return response.data;
};
