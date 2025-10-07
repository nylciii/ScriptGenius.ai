const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ScriptGenius.ai...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created! Please edit it with your n8n webhook URL.\n');
} else {
    console.log('✅ .env file already exists.\n');
}

// Create uploads directory
if (!fs.existsSync('uploads')) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync('uploads');
    console.log('✅ uploads directory created!\n');
} else {
    console.log('✅ uploads directory already exists.\n');
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('1. Edit .env file and add your N8N_WEBHOOK_URL');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. Open: http://localhost:3001\n');
