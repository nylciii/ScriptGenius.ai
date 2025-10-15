import React from 'react'

const Header = () => {
  return (
    <div className="text-center mb-5 fade-in">
      <h1
        className="display-4 fw-bold mb-3"
        style={{
          color: '#ffffff',
          textShadow: '0 6px 24px rgba(0,0,0,0.45)',
          letterSpacing: '0.6px'
        }}
      >
        ScriptGenius.ai
      </h1>
      <p className="lead" style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '600', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>
        Transform your videos into powerful content with AI-powered transcription and script generation
      </p>
      <div className="mt-4">
        <span className="badge">
          ✨ Powered by AgentGenius.ai
        </span>
      </div>
    </div>
  )
}

export default Header

