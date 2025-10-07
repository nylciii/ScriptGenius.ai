import React from 'react'
import Transcript from './Transcript'
import Scripts from './Scripts'

const Results = ({ results }) => {
  return (
    <div className="mt-4 fade-in">
      <Transcript transcript={results.transcript} />
      <Scripts scripts={results.scripts} />
    </div>
  )
}

export default Results

