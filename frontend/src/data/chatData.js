export const CHAT_CONTEXT = {
  document: 'Finance_Mids_Inspection_Report.pdf',
  analysis: 'Inspection Report Analysis',
  status: 'Analysis complete',
  findings: 4,
  high: 1,
  medium: 2,
  low: 1,
  sources: [
    'Extracted report text',
    'Inspection findings',
    'Visual observations',
    'Maintenance knowledge',
    'Agent recommendation',
  ],
  model: 'Qwen3:4B',
  runtime: 'Ollama',
  execution: 'Local',
}

export const SUGGESTED_QUESTIONS = [
  'Summarize the key findings',
  'Why is finding #1 high severity?',
  'Show the evidence for the recommendation',
  'What should be reviewed before approval?',
]

export const INITIAL_MESSAGES = [
  {
    id: 'm0',
    role: 'assistant',
    text: 'Analysis context loaded. I can help explain the findings, evidence, and recommendation from this inspection analysis.',
  },
  {
    id: 'm1',
    role: 'user',
    text: 'Why is finding #1 classified as HIGH?',
  },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Finding #1 was classified as HIGH because the inspection evidence indicates a potentially significant equipment condition that may affect operational reliability.\n\nThe classification is based on:\n• Severity of the observed condition\n• Potential operational impact\n• Evidence extracted from the inspection report\n• Relevant maintenance context',
    action: 'evidence',
  },
  {
    id: 'm3',
    role: 'user',
    text: 'What evidence supports the recommendation?',
  },
  {
    id: 'm4',
    role: 'assistant',
    text: 'The recommendation is supported by the inspection observations and the retrieved maintenance guidance associated with the affected equipment.\n\nRelevant evidence:\n1. Inspection observation\n2. Equipment condition\n3. Historical maintenance context',
    action: 'sources',
  },
]

export const MOCK_REPLIES = [
  {
    match: /summarize|key findings/i,
    text: 'Four findings were identified in this inspection analysis:\n\n1. Hydraulic pressure fluctuation — HIGH\n2. Excessive vibration near the compressor — MEDIUM\n3. Localized thermal anomaly — MEDIUM\n4. Missing maintenance documentation — LOW\n\nThe high-severity hydraulic condition is the primary driver for routing this inspection to maintenance review before approval.',
    action: 'evidence',
  },
  {
    match: /finding #?1|high severity|classified as high/i,
    text: 'Finding #1 is HIGH because abnormal hydraulic pressure variation can affect equipment reliability if left unreviewed.\n\nThis is a decision-support classification from the analysis, not an approval. An authorized operator should still inspect the control components and pressure regulation system.',
    action: 'evidence',
  },
  {
    match: /evidence|supports the recommendation|view sources/i,
    text: 'The recommendation to route this inspection to maintenance review is supported by:\n\n1. Inspection observation of hydraulic pressure fluctuation\n2. Related vibration and thermal conditions on the same assembly\n3. Maintenance context retrieved for the affected equipment\n\nNo live model inference is connected in this demo. This is simulated local-agent output.',
    action: 'sources',
  },
  {
    match: /reviewed before approval|before approval|human review/i,
    text: 'Before approval, an authorized human operator should review:\n\n• The HIGH hydraulic pressure finding and proposed corrective investigation\n• Vibration and thermal observations on the compressor assembly\n• The missing maintenance documentation gap\n• Whether the AI recommendation to route to Maintenance Review is appropriate\n\nThe agent does not grant approval.',
    action: 'evidence',
  },
]

export const DEFAULT_REPLY = {
  text: 'I can explain this analysis using the loaded inspection context: extracted findings, visual observations, maintenance knowledge, and the draft recommendation.\n\nAsk about a specific finding, the evidence, or what a human reviewer should check before approval. This reply is simulated frontend output only.',
  action: null,
}

export function mockReplyFor(question) {
  const match = MOCK_REPLIES.find((entry) => entry.match.test(question))
  return match ?? DEFAULT_REPLY
}
