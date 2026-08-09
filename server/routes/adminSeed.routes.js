const express = require('express');
const rateLimit = require('express-rate-limit');
const { seedAdminUser } = require('../controllers/admin.controller');
const verifySeedSecret = require('../middlewares/seedSecret');

const router = express.Router();

const adminSeedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

router.post('/seed', adminSeedLimiter, verifySeedSecret, seedAdminUser);

module.exports = router;
