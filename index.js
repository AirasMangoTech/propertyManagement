const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const {uploadToCloudinary,upload} = require('./upload/index');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const propertyRoutes = require('./routes/propertyRoutes');
app.use('/api/properties', propertyRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const agentAuthRoutes = require('./routes/agentAuthRoutes');
app.use('/api/auth', agentAuthRoutes);

app.post('/api/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    console.log(files,'files');
    
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
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));
