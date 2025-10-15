import React from 'react'

const ScriptCard = ({ script }) => {
  return (
    <div className="card script-card h-100" style={{
      border: '2px solid var(--milk-brown)',
      borderRadius: '1rem',
      background: 'var(--gradient-card)',
      boxShadow: '0 4px 15px rgba(45, 27, 27, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      <div className="card-header" style={{
        background: 'var(--gradient-accent)',
        color: 'var(--warm-cream)',
        borderRadius: '1rem 1rem 0 0',
        border: 'none',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
      }}>
        <h6 className="mb-0 fw-semibold d-flex align-items-center">
          <span style={{ marginRight: '0.5rem', fontSize: '1.1rem' }}>✨</span>
          {script.title}
        </h6>
      </div>
      <div className="card-body" style={{ padding: '1.5rem' }}>
        <p className="mb-0" style={{ 
          whiteSpace: 'pre-wrap', 
          color: 'var(--dark-brown)', 
          lineHeight: '1.6',
          background: 'var(--warm-cream)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--milk-brown)'
        }}>
          {script.content}
        </p>
      </div>
    </div>
  )
}

export default ScriptCard

