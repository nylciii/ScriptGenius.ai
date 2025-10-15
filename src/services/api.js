import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout for video processing
})

// Upload video to n8n webhook
export const uploadVideo = async (file) => {
  try {
    const formData = new FormData()
    formData.append('video', file)

    console.log('Uploading file:', file.name, 'Size:', file.size)

    const response = await api.post('/upload', formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    })

    let data = response.data
    // Client-side normalization fallback (in case backend not restarted yet)
    if (Array.isArray(data)) {
      // n8n often returns [{ json: {...} }]
      const first = data[0]
      data = (first && (first.json || first.data || first.payload || first.body)) || first || {}
    }
    // unwrap common wrappers
    if (data && typeof data === 'object' && (data.json || data.data || data.payload || data.body)) {
      data = data.json || data.data || data.payload || data.body
    }
    const deepFindFirst = (obj, keys) => {
      const seen = new Set()
      const stack = [obj]
      while (stack.length) {
        const cur = stack.pop()
        if (!cur || typeof cur !== 'object' || seen.has(cur)) continue
        seen.add(cur)
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(cur, k) && cur[k]) return cur[k]
        }
        for (const v of Object.values(cur)) if (v && typeof v === 'object') stack.push(v)
      }
      return undefined
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
    const clean = (val) => {
      if (val == null) return ''
      let t = typeof val === 'string' ? val : JSON.stringify(val)
      return t.replace(/[{}\[\]"\\]/g, '').trim()
    }
    const transcript = clean(
      data?.transcript || data?.text || data?.transcription || data?.transcript_text ||
      deepFindFirst(data, ['transcript', 'text', 'transcription'])
    )
    let scriptsRaw = data?.scripts || data?.generatedScripts || data?.outputs || deepFindFirst(data, ['scripts','generatedScripts','ideas','outline','sections','bullets'])
    let scripts = []
    if (typeof scriptsRaw === 'string') scripts = [{ title: 'Script 1', content: clean(scriptsRaw) }]
    else if (Array.isArray(scriptsRaw)) scripts = scriptsRaw.map((s, i) => ({ title: `Script ${i+1}` , content: clean(s?.content || s?.text || s)}))
    else if (scriptsRaw && typeof scriptsRaw === 'object') scripts = Object.keys(scriptsRaw).map((k,i)=>({ title: clean(k||`Script ${i+1}`), content: clean(scriptsRaw[k]) }))

    // Heuristic extraction when expected fields are missing
    let finalTranscript = transcript
    let finalScripts = scripts
    if (!finalTranscript) {
      const candidates = collectStrings(data)
        .map(s => s.trim())
        .filter(s => s.split(' ').length > 8) // likely sentences
      // pick the longest paragraph-looking string
      finalTranscript = candidates.sort((a,b)=>b.length-a.length)[0] || ''
    }
    if (finalScripts.length === 0) {
      // Look for arrays that look like script items
      const possible = deepFindFirst(data, ['scripts','generatedScripts','ideas','outline','sections','bullets','items','points'])
      if (Array.isArray(possible)) {
        finalScripts = possible
          .map((s,i) => ({ title: `Script ${i+1}`, content: clean(s?.content || s?.text || s) }))
          .filter(it => it.content)
      } else if (typeof possible === 'string') {
        // Split by double newlines or numbered lines
        const parts = possible.split(/\n\s*\n|^\d+\.|^-\s/gm).map(p=>p.trim()).filter(Boolean)
        finalScripts = parts.map((p,i)=>({ title: `Script ${i+1}`, content: clean(p) }))
      }
    }

    const normalized = finalTranscript || finalScripts.length > 0 ? { transcript: finalTranscript, scripts: finalScripts } : data

    console.log('Upload response (normalized):', normalized)
    return normalized
  } catch (error) {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || `HTTP error! status: ${error.response.status}`
      throw new Error(errorMessage)
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The video processing took too long.')
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to server. Please check your connection.')
      } else {
        throw new Error('Network error. Please check your connection and try again.')
      }
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred.')
    }
  }
}

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Test API connection
export const testConnection = async () => {
  try {
    console.log('Testing API connection...')
    const response = await api.get('/health')
    console.log('API connection successful:', response.data)
    return response.data
  } catch (error) {
    console.error('API connection failed:', error)
    throw error
  }
}

// Test n8n webhook connection
export const testN8nConnection = async () => {
  try {
    console.log('Testing n8n webhook connection...')
    const response = await api.get('/test-n8n')
    console.log('n8n connection successful:', response.data)
    return response.data
  } catch (error) {
    console.error('n8n connection failed:', error)
    throw error
  }
}

export default api

