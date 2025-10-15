import React, { useState, useRef } from 'react'
import { uploadVideo } from '../services/api'

const VideoUpload = ({ onUploadSuccess, onUploadError, onLoadingChange, isLoading, onReset }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    
    if (file) {
      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        onUploadError('File too large. Maximum size is 100MB.')
        event.target.value = ''
        return
      }
      
      // Check if file is MP4
      if (file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')) {
        setSelectedFile(file)
        setFileInfo({
          name: file.name,
          size: formatFileSize(file.size)
        })
        onUploadError(null)
        onReset()
      } else {
        onUploadError('Please select an MP4 video file only.')
        setSelectedFile(null)
        setFileInfo(null)
        onReset()
        event.target.value = ''
      }
    } else {
      setSelectedFile(null)
      setFileInfo(null)
      onReset()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    console.log('Form submitted, selectedFile:', selectedFile)
    
    if (!selectedFile) {
      console.log('No file selected')
      onUploadError('Please select an MP4 video file')
      return
    }

    console.log('Starting upload process...')
    onLoadingChange(true)
    onUploadError(null)
    onReset()

    try {
      console.log('Calling uploadVideo with file:', selectedFile.name)
      const result = await uploadVideo(selectedFile)
      console.log('Upload successful, result:', result)
      onUploadSuccess(result)
    } catch (error) {
      console.error('Upload error:', error)
      
      let errorMsg = 'An unexpected error occurred. Please try again.'
      
      if (error.message.includes('timeout')) {
        errorMsg = 'Request timeout. The video processing took too long.'
      } else if (error.message.includes('Network Error')) {
        errorMsg = 'Network error. Please check if the server is running.'
      } else if (error.message) {
        errorMsg = error.message
      }
      
      console.log('Setting error message:', errorMsg)
      onUploadError(errorMsg)
    } finally {
      console.log('Upload process finished')
      onLoadingChange(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = 'var(--caramel)'
    event.currentTarget.style.background = 'var(--pale-beige)'
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = 'var(--milk-brown)'
    event.currentTarget.style.background = 'var(--warm-cream)'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = 'var(--milk-brown)'
    event.currentTarget.style.background = 'var(--warm-cream)'
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      fileInputRef.current.files = files
      handleFileChange({ target: { files: files } })
    }
  }

  return (
    <div className="card shadow-sm fade-in">
      <div className="card-header">
        <h4 className="mb-0 d-flex align-items-center">
          <span style={{ marginRight: '0.75rem', fontSize: '1.5rem' }}>🎬</span>
          Video Upload & Processing
        </h4>
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center mb-3">
              <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📁</span>
              Select Video File
            </label>
            <input 
              ref={fileInputRef}
              type="file" 
              className="form-control form-control-lg" 
              accept=".mp4,video/mp4"
              onChange={handleFileChange}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: '2px dashed var(--milk-brown)',
                background: 'var(--warm-cream)',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                padding: '2rem 1rem'
              }}
            />
            <div className="form-text" style={{ color: 'var(--warm-brown)', fontSize: '0.95rem', textAlign: 'center' }}>
              Supported format: MP4 video files only. Max size: 100MB
            </div>
            {fileInfo && (
              <div className="mt-3 p-3" style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                borderRadius: '1rem',
                border: '2px solid var(--warm-brown)',
                textAlign: 'center'
              }}>
                <small className="d-flex align-items-center justify-content-center" style={{ color: 'var(--warm-brown)', fontWeight: '500' }}>
                  <span style={{ marginRight: '0.5rem' }}>✅</span>
                  Selected: {fileInfo.name} ({fileInfo.size})
                </small>
              </div>
            )}
          </div>

          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg fw-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing Video...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '0.5rem' }}>🚀</span>
                  Transcribe & Generate Scripts
                </>
              )}
            </button>
            
            {/* Debug and test buttons removed per request */}
          </div>
        </form>
      </div>
    </div>
  )
}

export default VideoUpload

