export const ANALYSIS_TYPES = [
  {
    id: 'inspection',
    title: 'Inspection Report Analysis',
    description:
      'Extract findings, assess severity and prepare an approval recommendation.',
  },
  {
    id: 'safety',
    title: 'Safety Review',
    description: 'Identify safety-related findings and potential risks.',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Assessment',
    description: 'Analyze equipment condition and maintenance requirements.',
  },
]

export const DEFAULT_ANALYSIS_TYPE = 'inspection'

export const DEFAULT_INSTRUCTIONS =
  'Identify critical findings, assess their severity, reference relevant knowledge sources, and prepare a recommendation for human approval.'

export const ACCEPTED_EXTENSIONS = ['.pdf', '.txt']

export const ACCEPTED_MIME_TYPES = ['application/pdf', 'text/plain']
