import React from 'react'

const Transcript = ({ transcript }) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header" style={{ background: 'var(--gradient-secondary)' }}>
        <h5 className="mb-0 d-flex align-items-center text-white">
          <span style={{ marginRight: '0.75rem', fontSize: '1.3rem' }}>📝</span>
          Transcript
        </h5>
      </div>
      <div className="card-body">
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(171, 108, 130, 0.2)'
        }}>
          <p className="mb-0" style={{
            whiteSpace: 'pre-wrap',
            color: 'var(--primary-blue)',
            lineHeight: '1.7',
            fontSize: '1rem'
          }}>
            {transcript || 'No transcript available.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Transcript

