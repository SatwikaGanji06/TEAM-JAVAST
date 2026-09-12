export const KNOWLEDGE_BASE_SECTIONS = [
  {
    id: 'safety',
    title: 'Safety',
    description: 'Standing safety procedures planned as later reference material.',
    items: [
      {
        id: 'kb-safety-sop',
        title: 'Plant Safety SOP',
        summary: 'Site-wide safety rules for operations and inspection work.',
      },
      {
        id: 'kb-emergency',
        title: 'Emergency Procedures',
        summary: 'Response steps for incidents, isolation, and escalation.',
      },
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Recurring maintenance guidance, not a one-off work file.',
    items: [
      {
        id: 'kb-turbine',
        title: 'Turbine Maintenance Manual',
        summary: 'Inspection intervals, checks, and servicing notes.',
      },
      {
        id: 'kb-bearing',
        title: 'Bearing Inspection Procedure',
        summary: 'How to assess vibration, wear, and replacement criteria.',
      },
    ],
  },
  {
    id: 'standards',
    title: 'Standards',
    description: 'Internal standards and company guidelines.',
    items: [
      {
        id: 'kb-equipment',
        title: 'Equipment Standards',
        summary: 'Accepted operating limits and equipment condition criteria.',
      },
      {
        id: 'kb-guidelines',
        title: 'Company Guidelines',
        summary: 'Review and approval expectations for industrial documents.',
      },
    ],
  },
]
