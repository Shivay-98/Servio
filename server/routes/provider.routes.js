const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  submitApplication,
  getApplicationStatus,
  getDashboardStats,
} = require('../controllers/provider.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/provider.validator');
const upload = require('../middlewares/upload');

router.use(protect);
router.use(authorize('provider'));

router.get('/dashboard', getDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);
router.post('/application/submit', submitApplication);
router.get('/application/status', getApplicationStatus);

module.exports = router;
