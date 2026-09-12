export const SYSTEM_STATUS = [
  {
    id: 'system',
    label: 'Online',
    detail: 'System',
    tone: 'online',
  },
  {
    id: 'models',
    label: '3 Models',
    detail: 'Available',
    tone: 'neutral',
  },
  {
    id: 'jobs',
    label: '0 Running',
    detail: 'Agent Jobs',
    tone: 'neutral',
  },
  {
    id: 'processing',
    label: 'Local',
    detail: 'Processing',
    tone: 'local',
  },
]

export const QUICK_ACTIONS = [
  {
    id: 'new-analysis',
    title: 'New Analysis',
    description: 'Start an AI task',
    icon: 'plus',
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Manage reports',
    icon: 'document',
  },
]

export const RECENT_RUNS = [
  {
    id: 'run-inspection',
    title: 'Inspection Report Analysis',
    subtitle: 'Compressor Unit Inspection',
    status: 'Completed',
    time: '2 min ago',
  },
  {
    id: 'run-safety',
    title: 'Safety Report Review',
    subtitle: 'Refinery Area B',
    status: 'Completed',
    time: '18 min ago',
  },
]

export const INFRASTRUCTURE = [
  { id: 'ollama', name: 'Ollama', status: 'Online' },
  { id: 'vision', name: 'Vision Model', status: 'Ready' },
  { id: 'knowledge', name: 'Knowledge Base', status: 'Ready' },
  { id: 'runtime', name: 'Agent Runtime', status: 'Ready' },
]
