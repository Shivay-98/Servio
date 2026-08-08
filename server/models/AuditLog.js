const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_registered',
        'user_login',
        'user_logout',
        'password_reset',
        'profile_updated',
        'document_uploaded',
        'document_deleted',
        'application_submitted',
        'application_approved',
        'application_rejected',
        'provider_suspended',
        'provider_deleted',
        'category_created',
        'category_updated',
        'category_deleted',
        'admin_action',
      ],
    },
    entity: {
      type: String,
      enum: ['user', 'provider', 'document', 'category', 'notification'],
    },
    entityId: mongoose.Schema.Types.ObjectId,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
