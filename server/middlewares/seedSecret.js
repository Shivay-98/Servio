const crypto = require('crypto');
const config = require('../config');

const isValidSeedSecret = (providedSecret, expectedSecret) => {
  if (
    typeof providedSecret !== 'string' ||
    typeof expectedSecret !== 'string' ||
    providedSecret.length !== expectedSecret.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(providedSecret),
    Buffer.from(expectedSecret)
  );
};

const verifySeedSecret = (req, res, next) => {
  const seedSecret = req.header('x-seed-secret');

  if (!isValidSeedSecret(seedSecret, config.adminSeedSecret)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
    });
  }

  return next();
};

module.exports = verifySeedSecret;
