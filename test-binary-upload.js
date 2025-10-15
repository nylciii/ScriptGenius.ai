#!/usr/bin/env node

/**
 * Test script to verify binary data upload to n8n webhook
 * This script tests the binary data handling without requiring the full React app
 */

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE_URL = 'http://localhost:3002/api'

async function testBinaryUpload() {
  try {
    console.log('🧪 Testing binary data upload to n8n...\n')

    // First, test the n8n webhook connection
    console.log('1. Testing n8n webhook connection...')
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/test-n8n`)
      console.log('✅ n8n webhook is accessible:', testResponse.data.message)
    } catch (error) {
      console.log('❌ n8n webhook test failed:', error.response?.data?.error || error.message)
      return
    }

    // Check if there are any test video files in uploads directory
    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ No uploads directory found. Please upload a video first.')
      return
    }

    const videoFiles = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.mp4'))
    if (videoFiles.length === 0) {
      console.log('❌ No MP4 video files found in uploads directory.')
      console.log('   Please upload a video through the web interface first.')
      return
    }

    // Use the first available video file for testing
    const testVideoFile = path.join(uploadsDir, videoFiles[0])
    const videoStats = fs.statSync(testVideoFile)
    
    console.log(`\n2. Testing binary upload with file: ${videoFiles[0]}`)
    console.log(`   File size: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`)

    // Create form data for binary upload
    const formData = new FormData()
    formData.append('video', fs.createReadStream(testVideoFile), {
      filename: videoFiles[0],
      contentType: 'video/mp4',
      knownLength: videoStats.size
    })

    console.log('3. Testing debug upload first...')
    
    // First test with debug endpoint
    const debugResponse = await axios.post(`${API_BASE_URL}/debug-upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'ScriptGenius-AI-Test/1.0'
      },
      timeout: 30000
    })

    console.log('✅ Debug upload successful!')
    console.log('   Debug response:', JSON.stringify(debugResponse.data, null, 2))

    // Now test with actual n8n upload
    console.log('\n4. Sending binary data to n8n webhook...')
    
    // Recreate form data for n8n
    const n8nFormData = new FormData()
    n8nFormData.append('video', fs.createReadStream(testVideoFile), {
      filename: videoFiles[0],
      contentType: 'video/mp4',
      knownLength: videoStats.size
    })
    
    const startTime = Date.now()
    const response = await axios.post(`${API_BASE_URL}/upload`, n8nFormData, {
      headers: {
        ...n8nFormData.getHeaders(),
        'Accept': 'application/json',
        'User-Agent': 'ScriptGenius-AI-Test/1.0'
      },
      timeout: 300000, // 5 minute timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('✅ Binary upload to n8n successful!')
    console.log(`   Processing time: ${duration.toFixed(2)} seconds`)
    console.log('   Response from n8n:', JSON.stringify(response.data, null, 2))

  } catch (error) {
    console.error('❌ Binary upload test failed:')
    console.error('   Error:', error.message)
    
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Response:', error.response.data)
    }
    
    if (error.code) {
      console.error('   Code:', error.code)
    }
  }
}

// Run the test
testBinaryUpload()
