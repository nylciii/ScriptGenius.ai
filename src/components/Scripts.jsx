import React from 'react'
import ScriptCard from './ScriptCard'

const Scripts = ({ scripts }) => {
  if (!scripts || scripts.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-header" style={{ background: 'var(--gradient-primary)' }}>
          <h5 className="mb-0 d-flex align-items-center text-white">
            <span style={{ marginRight: '0.75rem', fontSize: '1.3rem' }}>📄</span>
            Generated Scripts
          </h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <p style={{ color: 'var(--primary-slate)', fontSize: '1.1rem' }}>
              No scripts were generated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header" style={{ background: 'var(--gradient-primary)' }}>
        <h5 className="mb-0 d-flex align-items-center text-white">
          <span style={{ marginRight: '0.75rem', fontSize: '1.3rem' }}>📄</span>
          Generated Scripts
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          {scripts.map((script, index) => (
            <div key={index} className="col-md-6 mb-3">
              <ScriptCard script={script} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Scripts

