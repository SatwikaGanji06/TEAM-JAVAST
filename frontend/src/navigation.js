export const NAV_SECTIONS = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'analysis', label: 'Analysis' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'documents', label: 'Documents' },
      { id: 'knowledge-base', label: 'Knowledge Base' },
      { id: 'runs', label: 'Runs' },
      { id: 'generated-documents', label: 'Generated Documents' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'models', label: 'Models' },
      { id: 'sovereignty', label: 'Sovereignty' },
      { id: 'audit', label: 'Audit' },
    ],
  },
]

export const PAGE_TITLES = {
  home: 'Home',
  analysis: 'Analysis',
  documents: 'Documents',
  'knowledge-base': 'Knowledge Base',
  runs: 'Runs',
  'generated-documents': 'Generated Documents',
  models: 'Models',
  sovereignty: 'Sovereignty',
  audit: 'Audit',
  profile: 'Profile',
}

export const PRIMARY_PAGE_IDS = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.id),
)
