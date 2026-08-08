const AuditLog = require('../models/AuditLog');

const auditLogger = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (body.success) {
      AuditLog.create({
        user: req.user?._id,
        action,
        entity,
        entityId: body.data?._id || body.data?.id,
        description: body.message,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }).catch(console.error);
    }
    return originalJson(body);
  };

  next();
};

module.exports = auditLogger;
