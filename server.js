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

// Test endpoint to verify n8n webhook configuration
app.get('/api/test-n8n', async (req, res) => {
  try {
    if (!process.env.N8N_WEBHOOK_URL) {
      return res.status(500).json({ 
        error: 'N8N webhook URL not configured. Please set N8N_WEBHOOK_URL in your .env file.' 
      })
    }

    // Test with a simple POST request to n8n (webhooks only accept POST)
    const testResponse = await axios.post(process.env.N8N_WEBHOOK_URL, {
      test: 'ping from ScriptGenius',
      timestamp: new Date().toISOString()
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ScriptGenius-AI/1.0'
      }
    })

    res.json({ 
      status: 'OK', 
      message: 'n8n webhook is accessible',
      n8nUrl: process.env.N8N_WEBHOOK_URL,
      response: testResponse.data
    })
  } catch (error) {
    console.error('n8n test error:', error.message)
    res.status(500).json({ 
      error: 'n8n webhook test failed',
      message: error.message,
      n8nUrl: process.env.N8N_WEBHOOK_URL
    })
  }
})

// Debug endpoint to test binary data structure
app.post('/api/debug-upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    console.log('Debug upload - File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    })

    // Test form data structure
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    const videoStream = fs.createReadStream(req.file.path)
    
    formData.append('video', videoStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size
    })

    console.log('Form data headers:', formData.getHeaders())

    // Clean up
    fs.unlinkSync(req.file.path)

    res.json({
      status: 'OK',
      message: 'Debug upload successful',
      fileDetails: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      formHeaders: formData.getHeaders()
    })

  } catch (error) {
    console.error('Debug upload error:', error)
    res.status(500).json({ error: 'Debug upload failed', message: error.message })
  }
})

let lastN8nResponse = null

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

    // Prepare binary data for n8n webhook - n8n expects specific format
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    
    // Create a readable stream for the binary video data
    const videoStream = fs.createReadStream(req.file.path)
    
    // Append the video file with the exact field name n8n expects
    formData.append('video', videoStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size
    })

    console.log('Sending binary video data to n8n webhook...')
    console.log('File details:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    })

    // Send file to n8n webhook with proper binary data configuration
    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
      headers: { 
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'ScriptGenius-AI/1.0'
      },
      timeout: 300000, // 5 minute timeout
      maxContentLength: Infinity, // Allow large responses
      maxBodyLength: Infinity, // Allow large requests
      responseType: 'json' // Ensure we expect JSON response
    })

    console.log('Received response from n8n:', n8nResponse.data)
    lastN8nResponse = n8nResponse.data

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    // Normalize response shape for frontend expectations
    const data = n8nResponse.data || {}

    // Utility to stringify and sanitize any value into human-readable text
    const toCleanText = (value) => {
      if (value == null) return ''
      let text = ''
      if (typeof value === 'string') {
        text = value
      } else if (Array.isArray(value)) {
        text = value.map(v => (typeof v === 'string' ? v : JSON.stringify(v))).join('\n\n')
      } else {
        text = JSON.stringify(value)
      }
      // Remove JSON-like punctuation and escape artifacts
      return text
        .replace(/[{}\[\]\"\\]/g, '')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s+,\s*/g, ', ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    const collectStrings = (obj) => {
      const seen = new Set()
      const stack = [obj]
      const strings = []
      while (stack.length) {
        const cur = stack.pop()
        if (cur == null || seen.has(cur)) continue
        if (typeof cur === 'string') {
          strings.push(cur)
          continue
        }
        if (typeof cur === 'object') {
          seen.add(cur)
          if (Array.isArray(cur)) {
            for (const it of cur) stack.push(it)
          } else {
            for (const v of Object.values(cur)) stack.push(v)
          }
        }
      }
      return strings
    }

    // Deep helpers to hunt for fields inside arbitrary nested n8n outputs
    const deepFindFirst = (obj, keys) => {
      const seen = new Set()
      const stack = [obj]
      while (stack.length) {
        const cur = stack.pop()
        if (!cur || typeof cur !== 'object' || seen.has(cur)) continue
        seen.add(cur)
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(cur, k) && cur[k]) {
            return cur[k]
          }
        }
        for (const v of Object.values(cur)) {
          if (v && typeof v === 'object') stack.push(v)
        }
      }
      return undefined
    }

    const deepFindOpenAIContent = (obj) => {
      // Common OpenAI shape
      const content = deepFindFirst(obj, ['content', 'message', 'response'])
      if (typeof content === 'string') return content
      if (content && typeof content === 'object') {
        if (typeof content.content === 'string') return content.content
        if (Array.isArray(content.choices) && content.choices[0]?.message?.content) {
          return content.choices[0].message.content
        }
      }
      if (Array.isArray(obj?.choices) && obj.choices[0]?.message?.content) {
        return obj.choices[0].message.content
      }
      return undefined
    }

    // Extract possible transcript fields
    let rawTranscript = data.transcript
      || data.text
      || data.transcription
      || data.transcript_text
      || data?.data?.transcript
      || data?.result?.transcript
      || deepFindFirst(data, ['transcript', 'text', 'transcription'])
      || deepFindOpenAIContent(data)
      || ''

    // Extract possible scripts fields
    let rawScripts = data.scripts
      || data.generatedScripts
      || data.outputs
      || data?.data?.scripts
      || data?.result?.scripts
      || deepFindFirst(data, ['scripts', 'generatedScripts', 'ideas', 'outline', 'sections', 'bullets'])
      || []

    // Normalize scripts to array of { title, content }
    const normalizeScripts = (input) => {
      if (!input) return []
      if (typeof input === 'string') {
        return [{ title: 'Script 1', content: toCleanText(input) }]
      }
      if (Array.isArray(input)) {
        return input.map((item, idx) => {
          if (typeof item === 'string') {
            return { title: `Script ${idx + 1}`, content: toCleanText(item) }
          }
          if (item && typeof item === 'object') {
            const title = toCleanText(item.title || item.name || `Script ${idx + 1}`)
            const content = toCleanText(item.content || item.body || item.text || item.script || item)
            return { title, content }
          }
          return { title: `Script ${idx + 1}`, content: toCleanText(item) }
        })
      }
      if (typeof input === 'object') {
        // Object map -> convert each key/value to a card
        return Object.keys(input).map((key, idx) => ({
          title: toCleanText(key || `Script ${idx + 1}`),
          content: toCleanText(input[key])
        }))
      }
      return []
    }

    let normalized = {
      transcript: toCleanText(rawTranscript),
      scripts: normalizeScripts(rawScripts)
    }

    // Heuristic fallback if empty
    if (!normalized.transcript) {
      const strings = collectStrings(data)
        .map(s => s.trim())
        .filter(s => s.split(' ').length > 8)
      normalized.transcript = toCleanText(strings.sort((a,b)=>b.length-a.length)[0] || '')
    }
    if (!normalized.scripts || normalized.scripts.length === 0) {
      const possible = deepFindFirst(data, ['scripts','generatedScripts','ideas','outline','sections','bullets','items','points'])
      if (Array.isArray(possible)) {
        normalized.scripts = possible
          .map((s,i)=>({ title: `Script ${i+1}`, content: toCleanText(s?.content || s?.text || s) }))
          .filter(it => it.content)
      } else if (typeof possible === 'string') {
        const parts = possible.split(/\n\s*\n|^\d+\.|^-\s/gm).map(p=>p.trim()).filter(Boolean)
        normalized.scripts = parts.map((p,i)=>({ title: `Script ${i+1}`, content: toCleanText(p) }))
      }
    }

    res.json(normalized)

  } catch (error) {
    console.error('Error processing video:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })

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

    // Handle n8n specific errors
    if (error.response?.status === 413) {
      return res.status(400).json({ 
        error: 'File too large for n8n processing. Please try a smaller file.' 
      })
    }

    if (error.response?.status === 415) {
      return res.status(400).json({ 
        error: 'Unsupported media type. Please ensure the file is a valid MP4 video.' 
      })
    }

    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Invalid request format. n8n could not process the binary data.' 
      })
    }

    // Handle CloudConvert rate limiting
    if (error.response?.data?.message?.includes('PARALLEL_JOB_LIMIT_EXCEEDED') || 
        error.message?.includes('PARALLEL_JOB_LIMIT_EXCEEDED')) {
      return res.status(429).json({ 
        error: 'CloudConvert is processing too many jobs. Please wait 5-10 minutes and try again.',
        retryAfter: 600, // 10 minutes
        details: 'Your video was received successfully, but CloudConvert has reached its concurrent job limit.'
      })
    }

    if (error.response?.status >= 500) {
      return res.status(500).json({ 
        error: 'n8n service error. Please try again later.' 
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

// Endpoint to fetch the last raw n8n response (diagnostics)
app.get('/api/_last-n8n', (req, res) => {
  res.json({ last: lastN8nResponse })
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
