import axios from 'axios'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    if (!process.env.N8N_WEBHOOK_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'N8N webhook URL not configured' 
        })
      }
    }

    // Test with a simple text file instead of video
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    
    // Create a simple test file
    const testContent = 'This is a test file for ScriptGenius.ai'
    formData.append('video', Buffer.from(testContent), {
      filename: 'test.txt',
      contentType: 'text/plain'
    })

    console.log('Testing n8n webhook with simple file...')

    const response = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
      headers: { 
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'ScriptGenius-AI/1.0'
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Test upload successful',
        n8nResponse: response.data,
        status: response.status
      })
    }

  } catch (error) {
    console.error('Test upload error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
    }
  }
}
