import React, { useState } from 'react'
import VideoUpload from './components/VideoUpload'
import Results from './components/Results'
import Header from './components/Header'

function App() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUploadSuccess = (data) => {
    setResults(data)
    setError(null)
  }

  const handleUploadError = (errorMessage) => {
    setError(errorMessage)
    setResults(null)
  }

  const handleLoadingChange = (loading) => {
    setIsLoading(loading)
  }

  const resetForm = () => {
    setResults(null)
    setError(null)
    setIsLoading(false)
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Header />
          
          <VideoUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onLoadingChange={handleLoadingChange}
            isLoading={isLoading}
            onReset={resetForm}
          />

          {error && (
            <div className="alert alert-danger fade-in">
              <h5 className="alert-heading">Error</h5>
              <p className="mb-0">{error}</p>
            </div>
          )}

          {results && (
            <Results results={results} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App

