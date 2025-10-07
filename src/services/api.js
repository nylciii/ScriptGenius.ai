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

    console.log('Upload response:', response.data)
    return response.data
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

export default api

