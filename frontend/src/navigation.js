export const NAV_SECTIONS = [
  {
    id: 'main',
    label: 'Main',
    items: [{ id: 'home', label: 'Home' }],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'documents', label: 'Documents' },
      { id: 'knowledge-base', label: 'Knowledge Base' },
      { id: 'runs', label: 'Runs' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'models', label: 'Models' },
      { id: 'sovereignty', label: 'Sovereignty' },
    ],
  },
]

export const PAGE_TITLES = {
  home: 'Home',
  documents: 'Documents',
  'knowledge-base': 'Knowledge Base',
  runs: 'Runs',
  'run-detail': 'Run',
  models: 'Models',
  sovereignty: 'Sovereignty',
  profile: 'Profile',
  'new-analysis': 'New Analysis',
  'coding-agent': 'Coding Agent',
}

export const PRIMARY_PAGE_IDS = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.id),
)
