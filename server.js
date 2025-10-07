import express from 'express'
import multer from 'multer'
import cors from 'cors'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from dist directory (React build)
app.use(express.static(path.join(__dirname, 'dist')))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4' || file.originalname.toLowerCase().endsWith('.mp4')) {
      cb(null, true)
    } else {
      cb(new Error('Only MP4 video files are allowed!'), false)
    }
  }
})

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Main upload endpoint - connects to n8n
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    console.log('File uploaded:', req.file.filename)

    // Check if n8n webhook URL is configured
    if (!process.env.N8N_WEBHOOK_URL) {
      return res.status(500).json({ 
        error: 'N8N webhook URL not configured. Please set N8N_WEBHOOK_URL in your .env file.' 
      })
    }

    // Prepare form data for n8n webhook
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('video', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    })

    console.log('Sending file to n8n webhook...')

    // Send file to n8n webhook
    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 300000, // 5 minute timeout
    })

    console.log('Received response from n8n:', n8nResponse.data)

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    // Return the response from n8n
    res.json(n8nResponse.data)

  } catch (error) {
    console.error('Error processing video:', error)

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    // Handle different types of errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' })
    }

    if (error.message === 'Only MP4 video files are allowed!') {
      return res.status(400).json({ error: 'Only MP4 video files are allowed.' })
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        error: 'Unable to connect to n8n service. Please check your N8N_WEBHOOK_URL configuration.' 
      })
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ 
        error: 'Request timeout. The video processing took too long.' 
      })
    }

    res.status(500).json({ 
      error: 'An error occurred while processing the video. Please try again.' 
    })
  }
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Open: http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
