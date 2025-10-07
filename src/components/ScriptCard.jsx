import React from 'react'

const ScriptCard = ({ script }) => {
  return (
    <div className="card script-card h-100">
      <div className="card-header">
        <h6 className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--primary-blue)' }}>
          <span style={{ marginRight: '0.5rem', fontSize: '1.1rem' }}>✨</span>
          {script.title}
        </h6>
      </div>
      <div className="card-body">
        <p className="mb-0" style={{ 
          whiteSpace: 'pre-wrap', 
          color: 'var(--primary-slate)', 
          lineHeight: '1.6' 
        }}>
          {script.content}
        </p>
      </div>
    </div>
  )
}

export default ScriptCard

