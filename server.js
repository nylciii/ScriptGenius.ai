const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Serve static files from Next.js build
app.use(express.static(path.join(__dirname, 'client/.next/static')));
app.use(express.static(path.join(__dirname, 'client/out')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Main upload endpoint
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('File uploaded:', req.file.filename);

    // Check if n8n webhook URL is configured
    if (!process.env.N8N_WEBHOOK_URL) {
      return res.status(500).json({ 
        error: 'N8N webhook URL not configured. Please set N8N_WEBHOOK_URL in your .env file.' 
      });
    }

    // Prepare form data for n8n webhook
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('video', require('fs').createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Sending file to n8n webhook...');

    // Send file to n8n webhook
    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 300000, // 5 minute timeout
    });

    console.log('Received response from n8n:', n8nResponse.data);

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    // Return the response from n8n
    res.json(n8nResponse.data);

  } catch (error) {
    console.error('Error processing video:', error);

    // Clean up uploaded file if it exists
    if (req.file && require('fs').existsSync(req.file.path)) {
      require('fs').unlinkSync(req.file.path);
    }

    // Handle different types of errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }

    if (error.message === 'Only video files are allowed!') {
      return res.status(400).json({ error: 'Only video files are allowed.' });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        error: 'Unable to connect to n8n service. Please check your N8N_WEBHOOK_URL configuration.' 
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ 
        error: 'Request timeout. The video processing took too long.' 
      });
    }

    res.status(500).json({ 
      error: 'An error occurred while processing the video. Please try again.' 
    });
  }
});

// Catch-all handler for Next.js pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/out/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
