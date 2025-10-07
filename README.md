# ScriptGenius.ai - HTML Version

A simple HTML interface for video transcription and script generation with n8n integration.

## 🚀 Quick Start

### Option 1: With n8n Integration (Recommended)
1. **Install dependencies**: `npm install`
2. **Setup environment**: `node setup.js`
3. **Configure n8n**: Edit `.env` file with your n8n webhook URL
4. **Start server**: `npm start`
5. **Open browser**: `http://localhost:3001`

### Option 2: Standalone Demo
1. **Open file**: Double-click `scriptgenius-standalone.html`
2. **That's it!** (Demo mode only - no real processing)

## ✨ Features

- **Pure HTML**: Single file with embedded CSS and JavaScript
- **No Dependencies**: Works offline, no server required
- **Responsive Design**: Beautiful UI that works on all devices
- **Drag & Drop**: Easy file upload with drag and drop support
- **File Validation**: MP4 video files only, 100MB max size
- **Demo Mode**: Shows example results for demonstration
- **Modern UI**: Gradient design with smooth animations

## 🎯 How to Use

1. **Open the HTML file** in your web browser
2. **Select a video file** (MP4 format, max 100MB)
3. **Click "Transcribe & Generate Scripts"**
4. **View the results** - transcript and generated scripts

## 📁 File Structure

```
ScriptGenius.ai/
├── scriptgenius-standalone.html    # Main HTML file (everything included)
├── README.md                       # This file
└── env.example                     # Environment variables template (for reference)
```

## 🔧 Customization

To integrate with your own video processing API:

1. **Open** `scriptgenius-standalone.html`
2. **Find** the `handleSubmit` function in the JavaScript section
3. **Replace** the demo simulation with your API call:

```javascript
// Replace this demo code:
setTimeout(() => {
    const mockResult = { /* demo data */ };
    showResults(mockResult);
    setLoading(false);
}, 3000);

// With your API call:
const formData = new FormData();
formData.append('video', selectedFile);

fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(result => {
    showResults(result);
    setLoading(false);
})
.catch(error => {
    showError('Error processing video: ' + error.message);
    setLoading(false);
});
```

## 🌐 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🎨 Styling

The HTML file includes all CSS embedded in the `<style>` section. You can customize:

- **Colors**: Modify the CSS variables in `:root`
- **Fonts**: Change the Google Fonts imports
- **Layout**: Adjust Bootstrap classes and custom CSS
- **Animations**: Modify the CSS animations and transitions

## 📱 Mobile Friendly

The design is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- All screen sizes

## 🔒 Security

- **Client-side only**: No server-side processing
- **File validation**: MP4 format and size limits
- **XSS protection**: HTML escaping for user content
- **No data storage**: Files are processed in memory only

## 🚀 Deployment

To deploy this HTML file:

1. **Web Server**: Upload to any web server (Apache, Nginx, etc.)
2. **CDN**: Host on any CDN (Cloudflare, AWS CloudFront, etc.)
3. **Static Hosting**: Deploy to GitHub Pages, Netlify, Vercel, etc.
4. **Local**: Just open the file directly in a browser

## 💡 Tips

- **File Size**: Keep videos under 100MB for best performance
- **Format**: Only MP4 files are supported
- **Browser**: Use a modern browser for best experience
- **Offline**: Works completely offline (except for Google Fonts)

## 🆚 vs Original Version

| Feature | Original (Next.js) | Pure HTML |
|---------|-------------------|-----------|
| Setup | Complex (Node.js, npm) | None |
| Dependencies | Many | None |
| File Size | Large | Single file |
| Server Required | Yes | No |
| Offline | No | Yes |
| Deployment | Complex | Simple |
| Customization | Complex | Easy |

## 📞 Support

This is a pure HTML file - no server, no dependencies, no complex setup. If you need help customizing it, just edit the HTML file directly!

---

**ScriptGenius.ai** - Transform your videos into powerful content with AI! ✨