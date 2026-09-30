export interface StateOption {
  code: string;
  name: string;
  insuranceRiskMult: number; // base 1.0
  epaRegion: string;
  oshaPlanType: 'Federal' | 'State Plan';
}

export const US_STATES: StateOption[] = [
  { code: 'AL', name: 'Alabama', insuranceRiskMult: 1.05, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'Federal' },
  { code: 'AK', name: 'Alaska', insuranceRiskMult: 1.20, epaRegion: 'Region 10 (Seattle)', oshaPlanType: 'State Plan' },
  { code: 'AZ', name: 'Arizona', insuranceRiskMult: 0.98, epaRegion: 'Region 9 (San Francisco)', oshaPlanType: 'State Plan' },
  { code: 'AR', name: 'Arkansas', insuranceRiskMult: 1.02, epaRegion: 'Region 6 (Dallas)', oshaPlanType: 'Federal' },
  { code: 'CA', name: 'California', insuranceRiskMult: 1.35, epaRegion: 'Region 9 (San Francisco)', oshaPlanType: 'State Plan' },
  { code: 'CO', name: 'Colorado', insuranceRiskMult: 1.08, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'Federal' },
  { code: 'CT', name: 'Connecticut', insuranceRiskMult: 1.15, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'Federal' },
  { code: 'DE', name: 'Delaware', insuranceRiskMult: 1.04, epaRegion: 'Region 3 (Philadelphia)', oshaPlanType: 'Federal' },
  { code: 'FL', name: 'Florida', insuranceRiskMult: 1.40, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'Federal' },
  { code: 'GA', name: 'Georgia', insuranceRiskMult: 1.06, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'Federal' },
  { code: 'HI', name: 'Hawaii', insuranceRiskMult: 1.25, epaRegion: 'Region 9 (San Francisco)', oshaPlanType: 'State Plan' },
  { code: 'ID', name: 'Idaho', insuranceRiskMult: 0.95, epaRegion: 'Region 10 (Seattle)', oshaPlanType: 'Federal' },
  { code: 'IL', name: 'Illinois', insuranceRiskMult: 1.18, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'Federal' },
  { code: 'IN', name: 'Indiana', insuranceRiskMult: 0.94, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'State Plan' },
  { code: 'IA', name: 'Iowa', insuranceRiskMult: 0.97, epaRegion: 'Region 7 (Kansas City)', oshaPlanType: 'State Plan' },
  { code: 'KS', name: 'Kansas', insuranceRiskMult: 1.04, epaRegion: 'Region 7 (Kansas City)', oshaPlanType: 'Federal' },
  { code: 'KY', name: 'Kentucky', insuranceRiskMult: 1.03, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'State Plan' },
  { code: 'LA', name: 'Louisiana', insuranceRiskMult: 1.32, epaRegion: 'Region 6 (Dallas)', oshaPlanType: 'Federal' },
  { code: 'ME', name: 'Maine', insuranceRiskMult: 0.98, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'Federal' },
  { code: 'MD', name: 'Maryland', insuranceRiskMult: 1.10, epaRegion: 'Region 3 (Philadelphia)', oshaPlanType: 'State Plan' },
  { code: 'MA', name: 'Massachusetts', insuranceRiskMult: 1.16, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'Federal' },
  { code: 'MI', name: 'Michigan', insuranceRiskMult: 1.12, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'State Plan' },
  { code: 'MN', name: 'Minnesota', insuranceRiskMult: 1.02, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'State Plan' },
  { code: 'MS', name: 'Mississippi', insuranceRiskMult: 1.14, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'Federal' },
  { code: 'MO', name: 'Missouri', insuranceRiskMult: 1.05, epaRegion: 'Region 7 (Kansas City)', oshaPlanType: 'Federal' },
  { code: 'MT', name: 'Montana', insuranceRiskMult: 0.96, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'Federal' },
  { code: 'NE', name: 'Nebraska', insuranceRiskMult: 1.01, epaRegion: 'Region 7 (Kansas City)', oshaPlanType: 'Federal' },
  { code: 'NV', name: 'Nevada', insuranceRiskMult: 1.10, epaRegion: 'Region 9 (San Francisco)', oshaPlanType: 'State Plan' },
  { code: 'NH', name: 'New Hampshire', insuranceRiskMult: 0.99, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'Federal' },
  { code: 'NJ', name: 'New Jersey', insuranceRiskMult: 1.28, epaRegion: 'Region 2 (New York)', oshaPlanType: 'Federal' },
  { code: 'NM', name: 'New Mexico', insuranceRiskMult: 1.02, epaRegion: 'Region 6 (Dallas)', oshaPlanType: 'State Plan' },
  { code: 'NY', name: 'New York', insuranceRiskMult: 1.34, epaRegion: 'Region 2 (New York)', oshaPlanType: 'Federal' },
  { code: 'NC', name: 'North Carolina', insuranceRiskMult: 1.07, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'State Plan' },
  { code: 'ND', name: 'North Dakota', insuranceRiskMult: 0.95, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'Federal' },
  { code: 'OH', name: 'Ohio', insuranceRiskMult: 1.02, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'Federal' },
  { code: 'OK', name: 'Oklahoma', insuranceRiskMult: 1.12, epaRegion: 'Region 6 (Dallas)', oshaPlanType: 'Federal' },
  { code: 'OR', name: 'Oregon', insuranceRiskMult: 1.08, epaRegion: 'Region 10 (Seattle)', oshaPlanType: 'State Plan' },
  { code: 'PA', name: 'Pennsylvania', insuranceRiskMult: 1.09, epaRegion: 'Region 3 (Philadelphia)', oshaPlanType: 'Federal' },
  { code: 'RI', name: 'Rhode Island', insuranceRiskMult: 1.12, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'Federal' },
  { code: 'SC', name: 'South Carolina', insuranceRiskMult: 1.11, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'State Plan' },
  { code: 'SD', name: 'South Dakota', insuranceRiskMult: 0.94, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'Federal' },
  { code: 'TN', name: 'Tennessee', insuranceRiskMult: 1.04, epaRegion: 'Region 4 (Atlanta)', oshaPlanType: 'State Plan' },
  { code: 'TX', name: 'Texas', insuranceRiskMult: 1.22, epaRegion: 'Region 6 (Dallas)', oshaPlanType: 'Federal' },
  { code: 'UT', name: 'Utah', insuranceRiskMult: 0.96, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'State Plan' },
  { code: 'VT', name: 'Vermont', insuranceRiskMult: 0.98, epaRegion: 'Region 1 (Boston)', oshaPlanType: 'State Plan' },
  { code: 'VA', name: 'Virginia', insuranceRiskMult: 1.03, epaRegion: 'Region 3 (Philadelphia)', oshaPlanType: 'State Plan' },
  { code: 'WA', name: 'Washington', insuranceRiskMult: 1.15, epaRegion: 'Region 10 (Seattle)', oshaPlanType: 'State Plan' },
  { code: 'WV', name: 'West Virginia', insuranceRiskMult: 1.06, epaRegion: 'Region 3 (Philadelphia)', oshaPlanType: 'Federal' },
  { code: 'WI', name: 'Wisconsin', insuranceRiskMult: 0.99, epaRegion: 'Region 5 (Chicago)', oshaPlanType: 'Federal' },
  { code: 'WY', name: 'Wyoming', insuranceRiskMult: 0.97, epaRegion: 'Region 8 (Denver)', oshaPlanType: 'State Plan' },
];

export const STATE_SELECT_OPTIONS = US_STATES.map((s) => ({
  label: `${s.name} (${s.code})`,
  value: s.code,
  multiplier: s.insuranceRiskMult,
}));
