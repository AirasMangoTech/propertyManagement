const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { uploadToCloudinary, upload } = require('./upload/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const agentAuthRoutes = require('./routes/agentAuthRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', agentAuthRoutes); // consider merging if duplicate
app.use('/api/bookings', bookingRoutes);
app.use('/api', dashboardRoutes);

// Upload multiple images
app.post('/api/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const urls = await Promise.all(
      files.map(file => uploadToCloudinary(file.buffer))
    );

    res.status(200).json({ message: 'Images uploaded successfully', urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload single doc or PDF/image
app.post('/api/docUpload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const url = await uploadToCloudinary(file.buffer, 'documents');

    res.status(200).json({ message: 'File uploaded successfully', url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Connect to DB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
