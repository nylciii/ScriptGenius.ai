#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('🧪 Testing ScriptGenius.ai setup...\n');

// Test 1: Check if all required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  'client/package.json',
  'client/src/app/page.tsx',
  'client/src/app/layout.tsx',
  '.env'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please run "npm run setup" first.');
  process.exit(1);
}

// Test 2: Check if dependencies are installed
console.log('\n📦 Checking dependencies...');
const nodeModulesExists = fs.existsSync('node_modules') && fs.existsSync('client/node_modules');
if (nodeModulesExists) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed. Please run "npm run setup" first.');
  process.exit(1);
}

// Test 3: Check .env configuration
console.log('\n🔧 Checking environment configuration...');
const envContent = fs.readFileSync('.env', 'utf8');
const hasN8nUrl = envContent.includes('N8N_WEBHOOK_URL=') && !envContent.includes('your-n8n-instance.com');

if (hasN8nUrl) {
  console.log('✅ N8N_WEBHOOK_URL is configured');
} else {
  console.log('⚠️  N8N_WEBHOOK_URL needs to be updated with your actual webhook URL');
}

// Test 4: Check if uploads directory exists
console.log('\n📂 Checking uploads directory...');
if (fs.existsSync('uploads')) {
  console.log('✅ Uploads directory exists');
} else {
  console.log('❌ Uploads directory missing. Creating...');
  fs.mkdirSync('uploads');
  console.log('✅ Uploads directory created');
}

console.log('\n🎉 Setup verification completed!');
console.log('\n📋 Summary:');
console.log('✅ All required files present');
console.log('✅ Dependencies installed');
console.log(`${hasN8nUrl ? '✅' : '⚠️ '} Environment configuration ${hasN8nUrl ? 'complete' : 'needs attention'}`);
console.log('✅ Uploads directory ready');

if (!hasN8nUrl) {
  console.log('\n⚠️  Remember to update your .env file with the correct N8N_WEBHOOK_URL');
}

console.log('\n🚀 You can now run "npm run dev" to start the application!');
