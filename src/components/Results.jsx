import React from 'react'
import Scripts from './Scripts'

const Results = ({ results }) => {
  const hasTranscript = Boolean(results?.transcript)
  const hasScripts = Array.isArray(results?.scripts) && results.scripts.length > 0
  return (
    <div className="mt-4 fade-in">
      <div className="output-box">
        <div className="output-header">
          <span>📝</span>
          <span>Video Processing Results</span>
        </div>
        <div className="output-content">
          <p>Your video has been successfully processed! Here are the results:</p>
        </div>
      </div>
      <Scripts scripts={results.scripts} transcript={results.transcript} />

      {/* Debug box removed as requested */}
    </div>
  )
}

export default Results

