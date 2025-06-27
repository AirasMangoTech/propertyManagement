const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { config } = require('dotenv');
const fs = require('fs');
const streamifier = require('streamifier');
config(); // Load env vars

const app = express();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer for memory storage
const storage = multer.memoryStorage();
exports.upload = multer({ storage });

// Helper function to upload buffer to Cloudinary
exports.uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Route: Upload multiple images
app.post('/api/upload', this.upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const urls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));

    res.status(200).json({ message: 'Images uploaded successfully', urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});


