const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const ApiFeatures = require('../utils/ApiFeatures');
const NotificationService = require('../services/notification.service');

// Helper function to prune orphaned provider profiles (whose user doesn't exist anymore)
const pruneOrphanedProviders = async () => {
  try {
    const orphanedProfiles = await ProviderProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $match: {
          userData: { $size: 0 },
        },
      },
    ]);

    if (orphanedProfiles.length === 0) return;

    const orphanedIds = orphanedProfiles.map((p) => p._id);
    const orphanedUserIds = orphanedProfiles.map((p) => p.user);

    // Find and delete documents
    const docRecords = await Document.find({ provider: { $in: orphanedIds } });
    const publicIds = docRecords.map((doc) => doc.publicId).filter(Boolean);

    if (publicIds.length > 0) {
      try {
        const CloudinaryService = require('../services/cloudinary.service');
        await CloudinaryService.deleteMultiple(publicIds);
      } catch (e) {
        console.error('Failed to delete documents from Cloudinary:', e.message);
      }
    }

    // Delete database records
    await Document.deleteMany({ provider: { $in: orphanedIds } });
    await Notification.deleteMany({ user: { $in: orphanedUserIds } });
    await ProviderProfile.deleteMany({ _id: { $in: orphanedIds } });

    console.log(`Successfully pruned ${orphanedIds.length} orphaned provider profiles and associated data.`);
  } catch (error) {
    console.error('Error pruning orphaned provider profiles:', error);
  }
};

exports.pruneOrphanedProviders = pruneOrphanedProviders;

exports.getDashboardStats = asyncHandler(async (req, res) => {
  await pruneOrphanedProviders();
  const [
    totalProviders,
    pendingApplications,
    approvedProviders,
    rejectedProviders,
    totalDocuments,
    recentApplications,
  ] = await Promise.all([
    ProviderProfile.countDocuments(),
    ProviderProfile.countDocuments({ applicationStatus: 'pending' }),
    ProviderProfile.countDocuments({ applicationStatus: 'approved' }),
    ProviderProfile.countDocuments({ applicationStatus: 'rejected' }),
    Document.countDocuments(),
    ProviderProfile.find({ applicationStatus: { $ne: 'draft' } })
      .sort('-submittedAt')
      .limit(5)
      .populate('user', 'firstName lastName email avatar'),
  ]);

  const underReview = await ProviderProfile.countDocuments({
    applicationStatus: 'under_review',
  });

  const monthlyRegistrations = await ProviderProfile.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const categoryDistribution = await ProviderProfile.aggregate([
    { $unwind: '$categories' },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo.name',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const topCities = await ProviderProfile.aggregate([
    { $match: { 'address.city': { $exists: true, $ne: '' } } },
    {
      $group: {
        _id: '$address.city',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const recentAuditLogs = await AuditLog.find()
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'firstName lastName email');

  sendResponse(res, 200, 'Admin dashboard stats fetched', {
    stats: {
      totalProviders,
      pendingApplications,
      approvedProviders,
      rejectedProviders,
      underReview,
      totalDocuments,
    },
    monthlyRegistrations,
    categoryDistribution,
    topCities,
    recentApplications,
    recentAuditLogs,
  });
});

exports.getAllProviders = asyncHandler(async (req, res) => {
  await pruneOrphanedProviders();
  const { search, applicationStatus, city, category, sort, page, limit } =
    req.query;

  const filter = {};

  if (applicationStatus && applicationStatus !== 'all') {
    filter.applicationStatus = applicationStatus;
  }

  if (city) {
    filter['address.city'] = new RegExp(city, 'i');
  }

  if (category) {
    filter.categories = category;
  }

  let query = ProviderProfile.find(filter)
    .populate('user', 'firstName lastName email phone avatar isActive')
    .populate('categories', 'name slug');

  if (search) {
    const users = await User.find({
      $or: [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ],
    }).select('_id');

    const userIds = users.map((u) => u._id);
    query = query.find({
      ...filter,
      $or: [
        { user: { $in: userIds } },
        { 'address.city': new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') },
      ],
    });
  }

  const sortOption = sort || '-createdAt';
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await ProviderProfile.countDocuments(filter);

  const providers = await query
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  sendResponse(res, 200, 'Providers fetched successfully', providers, {
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

exports.getProviderById = asyncHandler(async (req, res, next) => {
  const profile = await ProviderProfile.findById(req.params.id)
    .populate('user', 'firstName lastName email phone avatar isActive createdAt')
    .populate('categories', 'name slug icon')
    .populate('reviewedBy', 'firstName lastName')
    .populate('statusHistory.changedBy', 'firstName lastName');

  if (!profile) {
    return next(new AppError('Provider not found', 404));
  }

  const documents = await Document.find({ provider: profile._id });

  sendResponse(res, 200, 'Provider fetched successfully', {
    profile,
    documents,
  });
});

exports.reviewApplication = asyncHandler(async (req, res, next) => {
  const { status, reason } = req.validatedBody;

  const profile = await ProviderProfile.findById(req.params.id).populate(
    'user',
    'firstName lastName email'
  );

  if (!profile) {
    return next(new AppError('Provider not found', 404));
  }

  if (!['pending', 'under_review'].includes(profile.applicationStatus)) {
    return next(
      new AppError(
        `Cannot review application with status: ${profile.applicationStatus}`,
        400
      )
    );
  }

  profile.applicationStatus = status;
  profile.reviewedBy = req.user._id;
  profile.reviewedAt = new Date();

  if (status === 'approved') {
    profile.approvedAt = new Date();
  }

  if (status === 'rejected') {
    profile.rejectionReason = reason || 'Application does not meet requirements';
  }

  profile.statusHistory.push({
    status,
    comment: reason || `Application ${status} by admin`,
    changedBy: req.user._id,
  });

  await profile.save();

  const notificationType =
    status === 'approved' ? 'application_approved' : 'application_rejected';

  await NotificationService.create({
    user: profile.user._id,
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message:
      status === 'approved'
        ? 'Congratulations! Your application has been approved.'
        : `Your application has been rejected. Reason: ${profile.rejectionReason}`,
    type: notificationType,
  });

  sendResponse(res, 200, `Application ${status} successfully`, profile);
});

exports.suspendProvider = asyncHandler(async (req, res, next) => {
  const profile = await ProviderProfile.findById(req.params.id);

  if (!profile) {
    return next(new AppError('Provider not found', 404));
  }

  profile.isSuspended = !profile.isSuspended;
  profile.suspendedReason = req.body.reason || '';

  profile.statusHistory.push({
    status: profile.isSuspended ? 'suspended' : 'unsuspended',
    comment: req.body.reason || '',
    changedBy: req.user._id,
  });

  await profile.save();

  const user = await User.findById(profile.user);
  if (user) {
    user.isActive = !profile.isSuspended;
    await user.save({ validateBeforeSave: false });
  }

  sendResponse(
    res,
    200,
    `Provider ${profile.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
    profile
  );
});

exports.deleteProvider = asyncHandler(async (req, res, next) => {
  const profile = await ProviderProfile.findById(req.params.id);

  if (!profile) {
    return next(new AppError('Provider not found', 404));
  }

  const documents = await Document.find({ provider: profile._id });
  for (const doc of documents) {
    await require('../services/cloudinary.service').delete(doc.publicId);
  }
  await Document.deleteMany({ provider: profile._id });

  await Notification.deleteMany({ user: profile.user });

  await profile.deleteOne();

  sendResponse(res, 200, 'Provider deleted successfully');
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  await pruneOrphanedProviders();
  const [
    total,
    pending,
    approved,
    rejected,
    draft,
    avgCompletion,
    categoryDist,
    monthlyCounts,
    topCities,
    statusBreakdown,
  ] = await Promise.all([
    ProviderProfile.countDocuments(),
    ProviderProfile.countDocuments({ applicationStatus: 'pending' }),
    ProviderProfile.countDocuments({ applicationStatus: 'approved' }),
    ProviderProfile.countDocuments({ applicationStatus: 'rejected' }),
    ProviderProfile.countDocuments({ applicationStatus: 'draft' }),
    ProviderProfile.aggregate([
      { $group: { _id: null, avg: { $avg: '$profileCompletion' } } },
    ]),
    ProviderProfile.aggregate([
      { $unwind: '$categories' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ProviderProfile.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    ProviderProfile.aggregate([
      { $match: { 'address.city': { $exists: true, $ne: '' } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    ProviderProfile.aggregate([
      { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
    ]),
  ]);

  sendResponse(res, 200, 'Analytics fetched', {
    overview: { total, pending, approved, rejected, draft },
    averageCompletion: avgCompletion[0]?.avg || 0,
    categoryDistribution: categoryDist,
    monthlyRegistrations: monthlyCounts,
    topCities,
    statusBreakdown,
  });
});
