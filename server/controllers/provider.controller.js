const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const ApiFeatures = require('../utils/ApiFeatures');
const CloudinaryService = require('../services/cloudinary.service');
const NotificationService = require('../services/notification.service');

exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email phone avatar')
    .populate('categories', 'name slug icon');

  if (!profile) {
    return next(new AppError('Provider profile not found', 404));
  }

  sendResponse(res, 200, 'Profile fetched successfully', profile);
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  let profile = await ProviderProfile.findOne({ user: req.user._id });

  if (!profile) {
    return next(new AppError('Provider profile not found', 404));
  }

  if (profile.applicationStatus === 'approved') {
    return next(
      new AppError('Cannot update profile after approval. Contact support.', 400)
    );
  }

  const allowedUpdates = req.validatedBody;
  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] !== undefined) {
      profile[key] = allowedUpdates[key];
    }
  });

  profile.calculateCompletion();
  await profile.save();

  profile = await profile.populate('categories', 'name slug icon');

  sendResponse(res, 200, 'Profile updated successfully', profile);
});

exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    await CloudinaryService.delete(user.avatar.publicId);
  }

  const result = await CloudinaryService.upload(req.file.buffer, {
    folder: 'servio/avatars',
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  });

  user.avatar = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, 'Profile photo uploaded successfully', {
    avatar: user.avatar,
  });
});

exports.submitApplication = asyncHandler(async (req, res, next) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });

  if (!profile) {
    return next(new AppError('Provider profile not found', 404));
  }

  if (profile.applicationStatus !== 'draft') {
    return next(
      new AppError(
        `Application has already been ${profile.applicationStatus}`,
        400
      )
    );
  }

  profile.calculateCompletion();

  if (profile.profileCompletion < 60) {
    return next(
      new AppError(
        'Profile must be at least 60% complete before submitting',
        400
      )
    );
  }

  const documents = await Document.find({ user: req.user._id });
  const requiredDocs = ['aadhar', 'profile_photo'];
  const uploadedTypes = documents.map((doc) => doc.type);
  const missingDocs = requiredDocs.filter((doc) => !uploadedTypes.includes(doc));

  if (missingDocs.length > 0) {
    return next(
      new AppError(
        `Missing required documents: ${missingDocs.join(', ')}`,
        400
      )
    );
  }

  profile.applicationStatus = 'pending';
  profile.submittedAt = new Date();
  profile.statusHistory.push({
    status: 'pending',
    comment: 'Application submitted for review',
    changedBy: req.user._id,
  });

  await profile.save();

  await NotificationService.create({
    user: req.user._id,
    title: 'Application Submitted',
    message: 'Your application has been submitted and is pending review.',
    type: 'application_submitted',
  });

  sendResponse(res, 200, 'Application submitted successfully', profile);
});

exports.getApplicationStatus = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
    .select('applicationStatus statusHistory submittedAt approvedAt rejectionReason profileCompletion')
    .populate('statusHistory.changedBy', 'firstName lastName');

  sendResponse(res, 200, 'Application status fetched', profile);
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
    .populate('categories', 'name');

  const documents = await Document.find({ user: req.user._id });
  const notifications = await NotificationService.getUserNotifications(
    req.user._id,
    { limit: 5 }
  );
  const unreadCount = await NotificationService.getUnreadCount(req.user._id);

  sendResponse(res, 200, 'Dashboard data fetched', {
    profile,
    documents,
    notifications: notifications.notifications,
    unreadNotifications: unreadCount,
  });
});
