import React from 'react'

const Header = () => {
  return (
    <div className="text-center mb-5 fade-in">
      <h1 className="display-4 fw-bold gradient-text mb-3">ScriptGenius.ai</h1>
      <p className="lead" style={{ color: 'var(--primary-slate)', fontSize: '1.2rem', fontWeight: '400' }}>
        Transform your videos into powerful content with AI-powered transcription and script generation
      </p>
      <div className="mt-4">
        <span className="badge">
          ✨ Powered by AI
        </span>
      </div>
    </div>
  )
}

export default Header

