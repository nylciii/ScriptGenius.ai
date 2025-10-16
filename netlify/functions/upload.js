import axios from 'axios'
import FormData from 'form-data'

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

// Simple multipart parser for Netlify functions
const parseMultipart = (event) => {
  const contentType = event.headers['content-type'] || event.headers['Content-Type']
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data')
  }

  const boundary = contentType.split('boundary=')[1]
  if (!boundary) {
    throw new Error('Invalid multipart data - no boundary found')
  }

  const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
  const parts = body.toString('binary').split(`--${boundary}`)
  
  for (const part of parts) {
    if (part.includes('name="video"')) {
      const headerEnd = part.indexOf('\r\n\r\n')
      if (headerEnd === -1) continue
      
      const headers = part.substring(0, headerEnd)
      const content = part.substring(headerEnd + 4)
      
      // Extract filename and content type from headers
      const filenameMatch = headers.match(/filename="([^"]+)"/)
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/)
      
      const filename = filenameMatch ? filenameMatch[1] : 'video.mp4'
      const fileContentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'video/mp4'
      
      // Convert content back to buffer
      const fileBuffer = Buffer.from(content, 'binary')
      
      return {
        filename,
        contentType: fileContentType,
        content: fileBuffer
      }
    }
  }
  
  throw new Error('No video file found in multipart data')
}

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Check if n8n webhook URL is configured
    if (!process.env.N8N_WEBHOOK_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'N8N webhook URL not configured. Please set N8N_WEBHOOK_URL in your Netlify environment variables.' 
        })
      }
    }

    // Parse multipart form data
    const videoFile = parseMultipart(event)
    
    // Validate file type
    if (!videoFile.contentType.includes('video/mp4') && !videoFile.filename.toLowerCase().endsWith('.mp4')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only MP4 video files are allowed.' })
      }
    }

    // Validate file size (100MB limit)
    if (videoFile.content.length > 100 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File too large. Maximum size is 100MB.' })
      }
    }
    
    // Create form data for n8n
    const formData = new FormData()
    formData.append('video', videoFile.content, {
      filename: videoFile.filename,
      contentType: videoFile.contentType
    })

    console.log('Sending video to n8n webhook...')

    // Send file to n8n webhook
    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
      headers: { 
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'ScriptGenius-AI/1.0'
      },
      timeout: 300000, // 5 minute timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      responseType: 'json'
    })

    console.log('Received response from n8n:', n8nResponse.data)

    // Normalize response shape for frontend expectations
    const data = n8nResponse.data || {}

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(normalized)
    }

  } catch (error) {
    console.error('Error processing video:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    })

    // Log the event for debugging
    console.error('Event details:', {
      httpMethod: event.httpMethod,
      headers: event.headers,
      hasBody: !!event.body,
      bodyLength: event.body ? event.body.length : 0,
      isBase64Encoded: event.isBase64Encoded
    })

    // Handle different types of errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File too large. Maximum size is 100MB.' })
      }
    }

    if (error.message === 'Only MP4 video files are allowed!') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only MP4 video files are allowed.' })
      }
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Unable to connect to n8n service. Please check your N8N_WEBHOOK_URL configuration.' 
        })
      }
    }

    if (error.code === 'ECONNABORTED') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Request timeout. The video processing took too long.' 
        })
      }
    }

    // Handle n8n specific errors
    if (error.response?.status === 413) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large for n8n processing. Please try a smaller file.' 
        })
      }
    }

    if (error.response?.status === 415) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Unsupported media type. Please ensure the file is a valid MP4 video.' 
        })
      }
    }

    if (error.response?.status === 400) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request format. n8n could not process the binary data.' 
        })
      }
    }

    // Handle CloudConvert rate limiting
    if (error.response?.data?.message?.includes('PARALLEL_JOB_LIMIT_EXCEEDED') || 
        error.message?.includes('PARALLEL_JOB_LIMIT_EXCEEDED')) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'CloudConvert is processing too many jobs. Please wait 5-10 minutes and try again.',
          retryAfter: 600,
          details: 'Your video was received successfully, but CloudConvert has reached its concurrent job limit.'
        })
      }
    }

    if (error.response?.status >= 500) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'n8n service error. Please try again later.' 
        })
      }
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred while processing the video. Please try again.' 
      })
    }
  }
}
