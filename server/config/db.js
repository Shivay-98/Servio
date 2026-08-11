const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Prune orphaned provider profiles on startup
    setImmediate(async () => {
      try {
        const { pruneOrphanedProviders } = require('../controllers/admin.controller');
        await pruneOrphanedProviders();
      } catch (err) {
        console.error('Failed to run initial database pruning:', err);
      }
    });
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
