export const RUNS = [
  {
    id: 'run-safety',
    title: 'Safety Review',
    document: 'inspection_report.pdf',
    status: 'completed',
    findings: 4,
    time: 'Today, 4:32 PM',
    request: 'Analyze this inspection report for safety hazards.',
    hasDetail: true,
  },
  {
    id: 'run-maintenance',
    title: 'Maintenance Assessment',
    document: 'turbine_report.pdf',
    status: 'processing',
    findings: null,
    time: 'Today, 4:41 PM',
    request: 'Review this report for maintenance risks.',
    hasDetail: true,
  },
  {
    id: 'run-cancelled',
    title: 'Document summary',
    document: 'maintenance_log.pdf',
    status: 'cancelled',
    findings: null,
    time: 'Yesterday, 6:10 PM',
    request: 'Summarize the attached maintenance log.',
    hasDetail: false,
  },
]

export const RUN_WORKFLOW = [
  {
    id: 'received',
    title: 'Document received',
    description: 'The file was attached to the request.',
  },
  {
    id: 'processed',
    title: 'Document processed',
    description: 'The workbench prepared the document for review.',
  },
  {
    id: 'retrieved',
    title: 'Relevant information retrieved',
    description: 'Related material was gathered for the task.',
  },
  {
    id: 'analyzed',
    title: 'Evidence analyzed',
    description: 'The agent reviewed the available observations.',
  },
  {
    id: 'findings',
    title: 'Findings generated',
    description: 'Results were prepared for human review.',
  },
]

export function getRun(runId) {
  return RUNS.find((run) => run.id === runId) ?? RUNS[0]
}

export function runStatusTone(status) {
  if (status === 'completed') return 'online'
  if (status === 'processing') return 'processing'
  if (status === 'failed') return 'failed'
  return 'cancelled'
}

export function runStatusLabel(status) {
  if (status === 'completed') return 'Completed'
  if (status === 'processing') return 'Processing'
  if (status === 'failed') return 'Failed'
  return 'Cancelled'
}

export function workflowForStatus(status) {
  if (status === 'completed') {
    return RUN_WORKFLOW.map((step) => ({ ...step, status: 'completed' }))
  }

  if (status === 'processing') {
    return RUN_WORKFLOW.map((step, index) => ({
      ...step,
      status: index < 2 ? 'completed' : index === 2 ? 'running' : 'pending',
    }))
  }

  if (status === 'failed') {
    return RUN_WORKFLOW.map((step, index) => ({
      ...step,
      status: index === 0 ? 'completed' : 'pending',
    }))
  }

  return RUN_WORKFLOW.map((step) => ({ ...step, status: 'pending' }))
}

export function workflowProgress(status) {
  if (status === 'completed') return 100
  if (status === 'processing') return 50
  if (status === 'failed') return 20
  return 0
}
