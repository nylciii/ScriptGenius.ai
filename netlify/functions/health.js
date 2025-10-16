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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    })
  }
}
