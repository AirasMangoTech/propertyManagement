const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
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




app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      port:465
    });

    
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    


    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});


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
