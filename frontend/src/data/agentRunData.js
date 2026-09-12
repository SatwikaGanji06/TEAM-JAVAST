export const AGENT_RUN_META = {
  document: 'Finance_Mids_Inspection_Report.pdf',
  task: 'Inspection Report Analysis',
}

export const WORKFLOW_STEPS = [
  {
    id: 'ingestion',
    title: 'Document Ingestion',
    description: 'Load and prepare the uploaded document.',
  },
  {
    id: 'extraction',
    title: 'Text Extraction',
    description: 'Extract text and structured content from the document.',
  },
  {
    id: 'visual',
    title: 'Visual Analysis',
    description: 'Inspect document pages and visual evidence.',
  },
  {
    id: 'retrieval',
    title: 'Knowledge Retrieval',
    description: 'Retrieve relevant information from the local knowledge base.',
  },
  {
    id: 'reasoning',
    title: 'Agent Reasoning',
    description: 'Evaluate findings and determine recommendations.',
  },
  {
    id: 'recommendation',
    title: 'Recommendation',
    description: 'Prepare a recommendation for human review.',
  },
]

export const INITIAL_COMPLETED_COUNT = 2

export const INITIAL_EVENTS = [
  { id: 'e1', time: '09:41:02', message: 'Agent initialized' },
  { id: 'e2', time: '09:41:03', message: 'Document loaded: Finance_Mids_Inspection_Report.pdf' },
  { id: 'e3', time: '09:41:05', message: 'Text extraction completed' },
  { id: 'e4', time: '09:41:08', message: 'Visual analysis started' },
  { id: 'e5', time: '09:41:11', message: 'Inspecting page 3 of 12' },
  { id: 'e6', time: '09:41:14', message: 'Analyzing inspection evidence' },
]

export const STEP_ADVANCE_EVENTS = {
  visual: [
    { time: '09:41:16', message: 'Visual analysis completed' },
    { time: '09:41:17', message: 'Knowledge retrieval started' },
    { time: '09:41:19', message: 'Querying local knowledge base' },
  ],
  retrieval: [
    { time: '09:41:21', message: 'Knowledge retrieval completed' },
    { time: '09:41:22', message: 'Agent reasoning started' },
    { time: '09:41:24', message: 'Evaluating findings against retrieved context' },
  ],
  reasoning: [
    { time: '09:41:26', message: 'Agent reasoning completed' },
    { time: '09:41:27', message: 'Recommendation started' },
    { time: '09:41:29', message: 'Preparing recommendation for human review' },
  ],
  recommendation: [
    { time: '09:41:31', message: 'Recommendation draft prepared' },
    { time: '09:41:32', message: 'Agent workflow completed successfully' },
  ],
}

export const STEP_INTERVAL_MS = 2500
