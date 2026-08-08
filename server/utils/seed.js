const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const ProviderProfile = require('../models/ProviderProfile');

const connectDB = require('../config/db');

const categories = [
  { name: 'Home Cleaning', slug: 'home-cleaning', icon: 'Sparkles', order: 1, description: 'Professional home cleaning services' },
  { name: 'Plumbing', slug: 'plumbing', icon: 'Wrench', order: 2, description: 'Plumbing repair and installation' },
  { name: 'Electrical', slug: 'electrical', icon: 'Zap', order: 3, description: 'Electrical work and repairs' },
  { name: 'Painting', slug: 'painting', icon: 'Paintbrush', order: 4, description: 'Interior and exterior painting' },
  { name: 'Carpentry', slug: 'carpentry', icon: 'Hammer', order: 5, description: 'Furniture and woodwork' },
  { name: 'Pest Control', slug: 'pest-control', icon: 'Bug', order: 6, description: 'Pest control and fumigation' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Settings', order: 7, description: 'Home appliance repairs' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'Heart', order: 8, description: 'Beauty and wellness services' },
  { name: 'Tutoring', slug: 'tutoring', icon: 'BookOpen', order: 9, description: 'Private tutoring and coaching' },
  { name: 'Photography', slug: 'photography', icon: 'Camera', order: 10, description: 'Professional photography services' },
  { name: 'Moving & Packing', slug: 'moving-packing', icon: 'Package', order: 11, description: 'Relocation and packing' },
  { name: 'Gardening', slug: 'gardening', icon: 'Leaf', order: 12, description: 'Garden maintenance and landscaping' },
];

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await ProviderProfile.deleteMany();

    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories seeded`);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@servio.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`Admin user created: ${admin.email}`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
