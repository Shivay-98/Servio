const User = require('../models/User');

const missingCredentialsError = () => {
  const error = new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  error.code = 'MISSING_ADMIN_CREDENTIALS';
  return error;
};

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw missingCredentialsError();
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    return {
      created: false,
      email: existingAdmin.email,
    };
  }

  try {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: normalizedEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
    });

    return {
      created: true,
      email: admin.email,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        created: false,
        email: normalizedEmail,
      };
    }

    throw error;
  }
};

module.exports = seedAdmin;
