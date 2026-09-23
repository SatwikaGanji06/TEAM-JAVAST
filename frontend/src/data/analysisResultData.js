export const ANALYSIS_RESULT_META = {
  document: 'Finance_Mids_Inspection_Report.pdf',
  analysisType: 'Inspection Report Analysis',
  status: 'Analysis Complete',
  processing: 'Local LOKAI',
  model: 'Qwen3:4B',
  isDemo: true,
}

export const FINDINGS = [
  {
    id: 'F-01',
    number: '01',
    severity: 'HIGH',
    title: 'Cooling Water Pump — Abnormal Vibration',
    summary:
      'Inspection observations indicate abnormal vibration levels in the cooling water pump, suggesting a potential equipment reliability concern.',
    evidence: [
      'Elevated vibration observation',
      'Inspection note regarding pump condition',
      'Maintenance context indicating increased failure risk',
    ],
    recommendedAction:
      'Schedule detailed mechanical inspection and vibration analysis.',
    evidenceDetail: {
      source: 'Finance_Mids_Inspection_Report.pdf',
      page: '12',
      type: 'Inspection Observation',
      content:
        '"Abnormal vibration observed during equipment inspection of the cooling water pump. Levels exceed expected operating range and warrant further mechanical assessment."',
    },
  },
  {
    id: 'F-02',
    number: '02',
    severity: 'MEDIUM',
    title: 'Heat Exchanger — Surface Fouling',
    summary:
      'Visible fouling was identified on the heat exchanger surface, potentially reducing thermal efficiency.',
    evidence: [
      'Visual inspection observation',
      'Reduced heat-transfer indication',
    ],
    recommendedAction:
      'Evaluate cleaning requirement during the next maintenance window.',
    evidenceDetail: {
      source: 'Finance_Mids_Inspection_Report.pdf',
      page: '8',
      type: 'Visual Inspection',
      content:
        '"Visible surface fouling identified on the heat exchanger. Reduced heat-transfer performance is indicated and should be reviewed during planned maintenance."',
    },
  },
  {
    id: 'F-03',
    number: '03',
    severity: 'MEDIUM',
    title: 'Pipeline Section — Insulation Degradation',
    summary:
      'Localized insulation degradation was observed on an exposed pipeline section.',
    evidence: ['Visual inspection', 'Damaged insulation covering'],
    recommendedAction:
      'Inspect affected section and plan insulation replacement.',
    evidenceDetail: {
      source: 'Finance_Mids_Inspection_Report.pdf',
      page: '15',
      type: 'Visual Inspection',
      content:
        '"Localized insulation degradation observed on an exposed pipeline section. Covering is damaged and should be inspected for replacement planning."',
    },
  },
  {
    id: 'F-04',
    number: '04',
    severity: 'LOW',
    title: 'Instrument Panel — Label Wear',
    summary: 'Several equipment identification labels show visible wear.',
    evidence: ['Visual inspection observation'],
    recommendedAction: 'Replace labels during routine maintenance.',
    evidenceDetail: {
      source: 'Finance_Mids_Inspection_Report.pdf',
      page: '21',
      type: 'Visual Inspection',
      content:
        '"Several equipment identification labels on the instrument panel show visible wear and reduced legibility."',
    },
  },
]

export const FINDING_COUNTS = {
  total: 4,
  high: 1,
  medium: 2,
  low: 1,
}

export const OVERALL_ASSESSMENT =
  'The analysis identified one high-severity equipment concern and two medium-severity maintenance observations. The high-severity finding should receive priority engineering review before routine approval.'

export const AI_RECOMMENDATION = {
  text: 'Prioritize engineering review of the cooling water pump condition and schedule targeted mechanical inspection before proceeding with routine approval.',
  basis: [
    'High-severity equipment finding',
    'Inspection evidence',
    'Maintenance context',
    'Operational reliability considerations',
  ],
}
