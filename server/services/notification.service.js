const Notification = require('../models/Notification');

class NotificationService {
  static async create({ user, title, message, type, link, metadata }) {
    return Notification.create({ user, title, message, type, link, metadata });
  }

  static async getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }

  static async getUnreadCount(userId) {
    return Notification.countDocuments({ user: userId, isRead: false });
  }
}

module.exports = NotificationService;
