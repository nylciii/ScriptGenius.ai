# ScriptGenius.ai - Netlify Deployment Guide

## Overview
This application has been converted to work with Netlify's serverless functions. The Express server has been replaced with Netlify Functions that handle video uploads and n8n webhook integration.

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `dist`
4. Set the functions directory to: `netlify/functions`

### 3. Configure Environment Variables
In your Netlify dashboard, go to Site Settings > Environment Variables and add:

```
N8N_WEBHOOK_URL=https://cristalle.app.n8n.cloud/webhook/9a1a59e4-f5ee-467e-b1eb-2709b8b39776
```

### 4. Deploy
Once configured, Netlify will automatically deploy your site. The application will be available at your Netlify URL.

## Local Development

### For local development with Netlify Functions:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

### For local development with Express server (legacy):
```bash
npm run start
```

## File Structure

```
├── netlify/
│   └── functions/
│       ├── upload.js      # Main video upload handler
│       ├── health.js      # Health check endpoint
│       └── test-n8n.js    # n8n webhook test endpoint
├── src/
│   └── services/
│       └── api.js         # Frontend API client
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/test-n8n` - Test n8n webhook connection
- `POST /api/upload` - Upload video for processing

## Troubleshooting

### HTTP 400 Errors
- Ensure your N8N_WEBHOOK_URL environment variable is set correctly
- Check that the video file is a valid MP4 format
- Verify the file size is under 100MB

### Function Timeout
- Netlify Functions have a 10-second timeout limit on the free tier
- For longer processing times, consider upgrading to a paid plan or using a different service

### CORS Issues
- CORS headers are configured in each function
- If you encounter CORS issues, check the function responses include proper headers
