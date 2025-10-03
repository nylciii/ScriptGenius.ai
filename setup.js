#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up ScriptGenius.ai...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

// Check if .env file exists
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
  fs.writeFileSync(envFile, envExample);
  console.log('✅ Created .env file. Please update N8N_WEBHOOK_URL with your actual webhook URL.');
} else {
  console.log('✅ .env file already exists');
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies:', error.message);
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with the correct N8N_WEBHOOK_URL');
console.log('2. Set up your n8n workflow using the provided example');
console.log('3. Run "npm run dev" to start the application');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For detailed instructions, see README.md');
