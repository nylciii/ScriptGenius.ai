# ScriptGenius.ai - React.js App

A modern React.js web application for video transcription and script generation using AI, with n8n webhook integration.

## Features

- **Modern React.js**: Built with React 18 and Vite for fast development
- **Video Upload**: Upload MP4 video files (up to 100MB) with drag & drop
- **AI Transcription**: Automatic speech-to-text conversion
- **Script Generation**: AI-powered script creation from video content
- **n8n Integration**: Seamless connection to n8n workflows via webhook
- **Responsive Design**: Beautiful, modern UI with gradient themes
- **Real-time Processing**: Live status updates during video processing
- **Component Architecture**: Modular, reusable React components

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd scriptgenius-ai-react
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env and add your n8n webhook URL
   ```

3. **Development Mode**
   ```bash
   npm start
   # This runs both React dev server (port 3000) and Express server (port 3001)
   ```

4. **Production Build**
   ```bash
   npm run build
   npm run server
   ```

5. **Open in Browser**
   ```
   http://localhost:3000 (development)
   http://localhost:3001 (production)
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001

# OpenAI Configuration (if needed)
OPENAI_API_KEY=your_openai_api_key_here

# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### n8n Webhook Setup

1. Create a new webhook node in your n8n workflow
2. Copy the webhook URL
3. Add it to your `.env` file as `N8N_WEBHOOK_URL`
4. Configure your n8n workflow to process video files and return:
   ```json
   {
     "transcript": "Your video transcript here...",
     "scripts": [
       {
         "title": "Script Title",
         "content": "Script content here..."
       }
     ]
   }
   ```

## File Structure

```
scriptgenius-ai-react/
├── src/
│   ├── components/           # React components
│   │   ├── Header.jsx
│   │   ├── VideoUpload.jsx
│   │   ├── Results.jsx
│   │   ├── Transcript.jsx
│   │   ├── Scripts.jsx
│   │   └── ScriptCard.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── dist/                    # Production build (generated)
├── server.js                # Express server
├── vite.config.js           # Vite configuration
├── index.html               # HTML template
├── package.json             # Dependencies
├── env.example              # Environment template
├── uploads/                 # Temporary file storage
└── README.md                # This file
```

## API Endpoints

- `GET /` - Serve the React application
- `GET /api/health` - Health check endpoint
- `POST /api/upload` - Upload video file to n8n webhook

## Development

### Available Scripts

- `npm start` - Start both React dev server and Express server
- `npm run dev` - Start only React development server
- `npm run build` - Build React app for production
- `npm run server` - Start only Express server
- `npm run preview` - Preview production build
- `npm run setup` - Run initial setup

### Development Workflow

1. **React Development**: The React app runs on port 3000 with hot reload
2. **API Proxy**: Vite proxies `/api` requests to the Express server on port 3001
3. **Hot Reload**: Changes to React components update instantly
4. **API Testing**: Express server handles n8n webhook integration

### Component Architecture

- **App.jsx**: Main application component with state management
- **Header.jsx**: Application header with branding
- **VideoUpload.jsx**: File upload component with drag & drop
- **Results.jsx**: Container for displaying results
- **Transcript.jsx**: Transcript display component
- **Scripts.jsx**: Scripts container component
- **ScriptCard.jsx**: Individual script card component

## Features

### Video Upload
- Drag and drop support
- File validation (MP4 only, 100MB max)
- Real-time file information display
- Progress indicators and loading states

### Processing
- Automatic file upload to n8n webhook
- Real-time status updates
- Comprehensive error handling
- Automatic file cleanup

### Results Display
- Formatted transcript display
- Multiple script generation
- Responsive card layout
- Copy-friendly formatting

### Modern UI
- Gradient color scheme
- Smooth animations and transitions
- Responsive design for all devices
- Accessible form controls

## Customization

### Styling

The application uses CSS custom properties for easy theming:

```css
:root {
  --primary-gold: #FCBB6D;
  --primary-rose: #D8737F;
  --primary-mauve: #AB6C82;
  --primary-slate: #685D79;
  --primary-blue: #475C7A;
}
```

### Components

All components are modular and can be easily customized or extended:

```jsx
// Example: Custom script card
<ScriptCard 
  script={{
    title: "Custom Title",
    content: "Custom content..."
  }} 
/>
```

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (must be under 100MB)
   - Ensure file is MP4 format
   - Verify server has write permissions to uploads directory

2. **n8n Connection Issues**
   - Verify N8N_WEBHOOK_URL is correct
   - Check n8n workflow is active
   - Ensure webhook node is properly configured

3. **Development Server Issues**
   - Ensure both React and Express servers are running
   - Check port availability (3000 for React, 3001 for Express)
   - Verify proxy configuration in vite.config.js

4. **Build Issues**
   - Run `npm run build` before production deployment
   - Ensure all dependencies are installed
   - Check for TypeScript errors if using TypeScript

## Performance

- **Vite**: Fast development server with instant hot reload
- **React 18**: Latest React features and optimizations
- **Code Splitting**: Automatic code splitting for better performance
- **Optimized Build**: Production builds are optimized and minified

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository.