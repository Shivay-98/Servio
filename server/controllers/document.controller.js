const Document = require('../models/Document');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const CloudinaryService = require('../services/cloudinary.service');

exports.uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  const { type, name } = req.body;

  if (!type) {
    return next(new AppError('Document type is required', 400));
  }

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    return next(new AppError('Provider profile not found', 404));
  }

  const existingDoc = await Document.findOne({
    user: req.user._id,
    type,
  });

  if (existingDoc) {
    await CloudinaryService.delete(existingDoc.publicId);
    await existingDoc.deleteOne();
  }

  const result = await CloudinaryService.upload(req.file.buffer, {
    folder: `servio/documents/${req.user._id}`,
    resource_type: 'auto',
  });

  const document = await Document.create({
    user: req.user._id,
    provider: profile._id,
    type,
    name: name || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    url: result.secure_url,
    publicId: result.public_id,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  sendResponse(res, 201, 'Document uploaded successfully', document);
});

exports.getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user._id }).sort(
    '-createdAt'
  );
  sendResponse(res, 200, 'Documents fetched successfully', documents);
});

exports.getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    return next(new AppError('Document not found', 404));
  }

  sendResponse(res, 200, 'Document fetched successfully', document);
});

exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    return next(new AppError('Document not found', 404));
  }

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (profile && profile.applicationStatus !== 'draft') {
    return next(
      new AppError('Cannot delete documents after application submission', 400)
    );
  }

  await CloudinaryService.delete(document.publicId);
  await document.deleteOne();

  sendResponse(res, 200, 'Document deleted successfully');
});
