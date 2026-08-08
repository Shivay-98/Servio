const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllProviders,
  getProviderById,
  reviewApplication,
  suspendProvider,
  deleteProvider,
  getAnalytics,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { reviewApplicationSchema } = require('../validators/provider.validator');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/providers', getAllProviders);
router.get('/providers/:id', getProviderById);
router.put('/providers/:id/review', validate(reviewApplicationSchema), reviewApplication);
router.put('/providers/:id/suspend', suspendProvider);
router.delete('/providers/:id', deleteProvider);

module.exports = router;
