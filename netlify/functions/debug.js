export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const debugInfo = {
      method: event.httpMethod,
      headers: event.headers,
      hasBody: !!event.body,
      bodyLength: event.body ? event.body.length : 0,
      isBase64Encoded: event.isBase64Encoded,
      hasN8nUrl: !!process.env.N8N_WEBHOOK_URL,
      n8nUrl: process.env.N8N_WEBHOOK_URL ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'] || 'Unknown'
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2)
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Debug function failed', 
        message: error.message,
        stack: error.stack 
      })
    }
  }
}
