export const NAV_SECTIONS = [
  {
    id: 'main',
    label: 'Main',
    items: [{ id: 'dashboard', label: 'Dashboard' }],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'new-analysis', label: 'New Analysis' },
      { id: 'documents', label: 'Documents' },
      { id: 'knowledge-base', label: 'Knowledge Base' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    items: [
      { id: 'agent-runs', label: 'Agent Runs' },
      { id: 'agent-chat', label: 'Ask the Agent' },
      { id: 'coding-agent', label: 'Coding Agent' },
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

export const PAGE_TITLES = NAV_SECTIONS.flatMap((section) => section.items).reduce(
  (titles, item) => {
    titles[item.id] = item.label
    return titles
  },
  {},
)
