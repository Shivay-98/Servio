const NotificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await NotificationService.getUserNotifications(req.user._id, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });

  sendResponse(res, 200, 'Notifications fetched', result.notifications, {
    pagination: result.pagination,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAsRead(req.params.id, req.user._id);
  sendResponse(res, 200, 'Notification marked as read');
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.user._id);
  sendResponse(res, 200, 'All notifications marked as read');
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await NotificationService.getUnreadCount(req.user._id);
  sendResponse(res, 200, 'Unread count fetched', { count });
});
