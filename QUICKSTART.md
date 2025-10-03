# 🚀 ScriptGenius.ai - Quick Start Guide

Get your video transcription and script generation webapp running in 5 minutes!

## ⚡ One-Command Setup

```bash
npm run setup
```

This will:
- ✅ Install all dependencies
- ✅ Create necessary directories
- ✅ Set up environment files
- ✅ Verify your installation

## 🔧 Configuration

1. **Update your `.env` file:**
   ```env
   N8N_WEBHOOK_URL=https://your-actual-n8n-instance.com/webhook/transcribe-and-script
   ```

2. **Set up your n8n workflow:**
   - Import `n8n-workflow-example.json` into your n8n instance
   - Configure your OpenAI API credentials
   - Update the webhook URL in the workflow

## 🎬 Start the Application

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🧪 Test Your Setup

```bash
npm run test-setup
```

## 📱 How to Use

1. Open http://localhost:3000
2. Select a video file (max 100MB)
3. Click "Transcribe & Generate Scripts"
4. Wait for processing (up to 5 minutes)
5. View your transcript and generated scripts!

## 🆘 Need Help?

- Check the full [README.md](README.md) for detailed instructions
- Verify your n8n workflow is running
- Ensure your webhook URL is correct
- Check the browser console for errors

## 🎯 Expected Response Format

Your n8n workflow should return:
```json
{
  "transcript": "Your video transcript here...",
  "scripts": [
    {
      "title": "Short Social Post",
      "content": "Generated social media content..."
    },
    {
      "title": "1-Minute Explainer", 
      "content": "Generated explainer script..."
    },
    {
      "title": "Blog Intro",
      "content": "Generated blog introduction..."
    }
  ]
}
```

Happy coding! 🎉
