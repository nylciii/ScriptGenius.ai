import React from 'react'
import ScriptCard from './ScriptCard'

const sanitize = (text) => {
  if (!text) return ''
  return String(text).replace(/\*/g, '').trim()
}

const Scripts = ({ scripts, transcript }) => {
  const mergedScripts = (() => {
    if (scripts && scripts.length > 0) return scripts
    if (transcript && transcript.trim()) {
      // Put transcript as a single script card titled "Generated Script"
      return [{ title: 'Generated Script', content: sanitize(transcript) }]
    }
    return []
  })()

  if (!mergedScripts || mergedScripts.length === 0) {
    return (
      <div className="output-box">
        <div className="output-header">
          <span>📄</span>
          <span>Generated Scripts</span>
        </div>
        <div className="output-content">
          <div className="text-center py-4">
            <p style={{ color: 'var(--warm-brown)', fontSize: '1.1rem' }}>
              No scripts were generated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="output-box">
      <div className="output-header">
        <span>📄</span>
        <span>Generated Scripts</span>
      </div>
      <div className="output-content">
        <div className="row">
          {mergedScripts.map((script, index) => (
            <div key={index} className="col-md-6 mb-3">
              <ScriptCard script={{
                title: typeof script?.title === 'string' && script.title.trim() ? script.title : `Script ${index + 1}`,
                content: typeof script?.content === 'string' ? sanitize(script.content) : (typeof script === 'string' ? sanitize(script) : '')
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Scripts

