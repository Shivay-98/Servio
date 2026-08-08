const cloudinary = require('../config/cloudinary');

class CloudinaryService {
  static async upload(fileBuffer, options = {}) {
    const defaultOptions = {
      folder: 'servio',
      resource_type: 'auto',
      ...options,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  static async delete(publicId) {
    return cloudinary.uploader.destroy(publicId);
  }

  static async deleteMultiple(publicIds) {
    return cloudinary.api.delete_resources(publicIds);
  }
}

module.exports = CloudinaryService;
