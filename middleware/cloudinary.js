const cloudinary = require('cloudinary');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.uploads = (file) => new Promise((resolve, reject) => {
  cloudinary.v2.uploader.upload(file, { resource_type: 'auto' }, (error, result) => {
    if (error) reject(error); else resolve(result);
  });
});
