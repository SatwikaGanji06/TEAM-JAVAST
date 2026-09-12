import { useState } from 'react'
import AnalysisSection from '../components/analysis/AnalysisSection.jsx'
import FileUploader from '../components/analysis/FileUploader.jsx'
import AnalysisTypeCard from '../components/analysis/AnalysisTypeCard.jsx'
import AnalysisSummary from '../components/analysis/AnalysisSummary.jsx'
import {
  ANALYSIS_TYPES,
  DEFAULT_ANALYSIS_TYPE,
  DEFAULT_INSTRUCTIONS,
} from '../data/analysisOptions.js'

export default function NewAnalysis() {
  const [file, setFile] = useState(null)
  const [analysisType, setAnalysisType] = useState(DEFAULT_ANALYSIS_TYPE)
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS)
  const [analysisStarted, setAnalysisStarted] = useState(false)

  const selectedType = ANALYSIS_TYPES.find((option) => option.id === analysisType)

  function handleFileChange(nextFile) {
    setFile(nextFile)
    if (!nextFile) {
      setAnalysisStarted(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-8">
      <header>
        <h2 className="text-lg font-medium tracking-tight text-ink">
          New Analysis
        </h2>
        <p className="mt-1 text-sm text-muted">
          Analyze confidential industrial documents using local AI.
        </p>
      </header>

      <AnalysisSection number="01" title="Document">
        <FileUploader file={file} onFileChange={handleFileChange} />
      </AnalysisSection>

      <AnalysisSection number="02" title="Analysis type">
        <div className="grid grid-cols-3 gap-3">
          {ANALYSIS_TYPES.map((option) => (
            <AnalysisTypeCard
              key={option.id}
              option={option}
              selected={option.id === analysisType}
              onSelect={setAnalysisType}
            />
          ))}
        </div>
      </AnalysisSection>

      <AnalysisSection number="03" title="Task instructions">
        <label className="block">
          <span className="mb-2 block text-xs text-ink-secondary">Task Instructions</span>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={5}
            className="w-full resize-y rounded-sm border border-line bg-panel px-3 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/50"
          />
        </label>
      </AnalysisSection>

      <AnalysisSection number="04" title="Review / Start">
        <AnalysisSummary
          documentName={file?.name}
          analysisLabel={selectedType?.title ?? 'Inspection Report Analysis'}
          canStart={Boolean(file)}
          onStart={() => setAnalysisStarted(true)}
        />

        {analysisStarted ? (
          <div className="mt-3 rounded-sm border border-warning/30 bg-panel px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-warning uppercase">
              Analysis queued
            </p>
            <p className="mt-1.5 text-sm text-ink">
              Your document has been prepared for local analysis.
            </p>
            <p className="mt-1 text-xs text-muted">
              This is a frontend demo state only.
            </p>
          </div>
        ) : null}
      </AnalysisSection>
    </div>
  )
}
