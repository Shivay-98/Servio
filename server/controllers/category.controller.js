const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const slugify = require('slugify');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort('order name')
    .populate('providerCount');
  sendResponse(res, 200, 'Categories fetched successfully', categories);
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  sendResponse(res, 200, 'Category fetched successfully', category);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, order } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const category = await Category.create({
    name,
    slug,
    description,
    icon,
    order,
  });

  sendResponse(res, 201, 'Category created successfully', category);
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  Object.assign(category, req.body);
  await category.save();

  sendResponse(res, 200, 'Category updated successfully', category);
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  await category.deleteOne();
  sendResponse(res, 200, 'Category deleted successfully');
});
