import api from './api';

const NOTIFICATION_URL = '/notifications';

export const getNotifications = async (params) => {
  const response = await api.get(NOTIFICATION_URL, { params });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`${NOTIFICATION_URL}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put(`${NOTIFICATION_URL}/read-all`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get(`${NOTIFICATION_URL}/unread-count`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};

export default notificationService;
