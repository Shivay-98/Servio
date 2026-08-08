const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'aadhar',
        'pan',
        'driving_license',
        'police_verification',
        'experience_certificate',
        'resume',
        'portfolio',
        'profile_photo',
        'other',
      ],
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Document URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
    },
    mimeType: String,
    size: Number,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ user: 1, type: 1 });
documentSchema.index({ provider: 1 });
documentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', documentSchema);
