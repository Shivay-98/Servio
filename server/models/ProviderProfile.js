const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    dateOfBirth: Date,
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      years: { type: Number, min: 0, max: 50 },
      description: String,
    },
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    certificates: [
      {
        name: String,
        issuer: String,
        year: Number,
        url: String,
        publicId: String,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    workingHours: {
      start: String,
      end: String,
      days: [
        {
          type: String,
          enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
        },
      ],
    },
    pricing: {
      hourlyRate: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      minimumCharge: { type: Number, min: 0 },
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'on_leave', 'offline'],
      default: 'available',
    },
    applicationStatus: {
      type: String,
      enum: ['draft', 'pending', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    rejectionReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    approvedAt: Date,
    submittedAt: Date,
    statusHistory: [
      {
        status: String,
        comment: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: String,
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

providerProfileSchema.index({ 'address.city': 1 });
providerProfileSchema.index({ applicationStatus: 1 });
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({ location: '2dsphere' });
providerProfileSchema.index({ createdAt: -1 });

providerProfileSchema.methods.calculateCompletion = function () {
  const fields = [
    { key: 'bio', weight: 10 },
    { key: 'gender', weight: 5 },
    { key: 'dateOfBirth', weight: 5 },
    { key: 'languages', weight: 5, isArray: true },
    { key: 'experience.years', weight: 10 },
    { key: 'skills', weight: 10, isArray: true },
    { key: 'categories', weight: 10, isArray: true },
    { key: 'workingHours.start', weight: 5 },
    { key: 'pricing.hourlyRate', weight: 10 },
    { key: 'address.city', weight: 10 },
    { key: 'address.state', weight: 5 },
    { key: 'address.pincode', weight: 5 },
    { key: 'education', weight: 5, isArray: true },
    { key: 'certificates', weight: 5, isArray: true },
  ];

  let completed = 0;

  for (const field of fields) {
    const value = field.key.split('.').reduce((obj, k) => obj?.[k], this);
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) completed += field.weight;
    } else if (value !== undefined && value !== null && value !== '') {
      completed += field.weight;
    }
  }

  this.profileCompletion = completed;
  return completed;
};

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
