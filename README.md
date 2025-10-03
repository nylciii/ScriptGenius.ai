# ScriptGenius.ai

A full-stack web application for video transcription and AI-powered script generation using n8n workflows.

## Features

- 🎥 **Video Upload**: Upload video files up to 100MB
- 🎯 **AI Transcription**: Automatic speech-to-text conversion
- 📝 **Script Generation**: AI-generated scripts for different formats
- 🎨 **Clean UI**: Bootstrap-styled responsive interface
- ⚡ **Real-time Processing**: Live progress indicators and error handling

## Tech Stack

- **Frontend**: Next.js 15 with React 19, Bootstrap 5, TypeScript
- **Backend**: Node.js with Express.js
- **File Upload**: Multer for multipart form handling
- **AI Processing**: n8n workflow integration
- **Styling**: Bootstrap 5 with custom CSS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- n8n instance with webhook endpoint configured

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001

# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/transcribe-and-script
```

### 3. n8n Workflow Setup

Your n8n workflow should:

1. **Receive webhook** with video file
2. **Transcribe video** using Whisper or similar ASR API
3. **Generate scripts** using an LLM (GPT, Claude, etc.)
4. **Return JSON response** in this format:

```json
{
  "transcript": "The transcribed text from the video",
  "scripts": [
    {
      "title": "Short Social Post",
      "content": "Generated social media post content..."
    },
    {
      "title": "1-Minute Explainer",
      "content": "Generated explainer video script..."
    },
    {
      "title": "Blog Intro",
      "content": "Generated blog introduction..."
    }
  ]
}
```

### 4. Run the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Development

### Project Structure

```
ScriptGenius.ai/
├── client/                 # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx    # Main upload page
│   │       ├── layout.tsx  # Root layout
│   │       └── globals.css # Global styles
│   ├── next.config.js      # Next.js configuration
│   └── package.json
├── uploads/                # Temporary file storage
├── server.js              # Express backend
├── package.json           # Root dependencies
└── README.md
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the frontend
- `npm run server` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm start` - Start production server

### API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/upload` - Video upload and processing endpoint

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | 3001 |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint URL | Yes | - |

### File Upload Limits

- Maximum file size: 100MB
- Supported formats: All video formats (`video/*`)
- Files are temporarily stored in `uploads/` directory

## Error Handling

The application includes comprehensive error handling for:

- File upload errors (size, format, network)
- n8n workflow errors (timeout, connection, processing)
- Frontend validation errors
- Network connectivity issues

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Environment Setup

Ensure your production environment has:
- Node.js 18+
- Proper `.env` configuration
- n8n webhook endpoint accessible

### 3. Start Production Server

```bash
npm start
```

## Troubleshooting

### Common Issues

1. **"N8N webhook URL not configured"**
   - Ensure `N8N_WEBHOOK_URL` is set in your `.env` file

2. **"Unable to connect to n8n service"**
   - Check if your n8n instance is running
   - Verify the webhook URL is correct
   - Ensure network connectivity

3. **"File too large"**
   - Video files must be under 100MB
   - Consider compressing large videos

4. **"Request timeout"**
   - Video processing took longer than 5 minutes
   - Check n8n workflow performance
   - Consider using smaller video files

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review n8n workflow configuration
- Ensure all dependencies are properly installed
