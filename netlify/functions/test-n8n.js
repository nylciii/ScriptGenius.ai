import axios from 'axios'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
          error: 'N8N webhook URL not configured. Please set N8N_WEBHOOK_URL in your Netlify environment variables.' 
        })
      }
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        status: 'OK', 
        message: 'n8n webhook is accessible',
        n8nUrl: process.env.N8N_WEBHOOK_URL,
        response: testResponse.data
      })
    }
  } catch (error) {
    console.error('n8n test error:', error.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'n8n webhook test failed',
        message: error.message,
        n8nUrl: process.env.N8N_WEBHOOK_URL
      })
    }
  }
}
