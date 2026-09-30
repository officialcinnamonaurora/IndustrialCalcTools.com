import { CategoryInfo } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  insurance: {
    id: 'insurance',
    name: 'Insurance Calculators',
    slug: 'insurance',
    path: '/insurance/',
    tagline: 'Property, fleet, liability, and plant coverage estimators',
    description:
      'Evaluate comprehensive commercial coverage costs for industrial plants, forklift fleets, high-hazard facilities, and distribution centers. Built with ISO rating multipliers and risk classifications.',
    metaTitle: 'Industrial Insurance Calculators – Plant, Forklift & Warehouse Coverage Rates',
    metaDescription:
      'Calculate estimated insurance costs for manufacturing facilities, forklift fleets, and commercial warehouses. Free, fast benchmarks based on square footage, fleet size, and risk tiers.',
    iconName: 'ShieldCheck',
    primaryMetric: 'Annual Premium Range',
  },
  'equipment-cost': {
    id: 'equipment-cost',
    name: 'Equipment Cost Calculators',
    slug: 'equipment-cost',
    path: '/equipment-cost/',
    tagline: 'Depreciation, hourly burden rates, tooling, and rental vs. buy',
    description:
      'Determine true machinery cost per operating hour, MACRS depreciation schedules, CNC tooling overhead, and capital acquisition economics for manufacturing and fabrication shops.',
    metaTitle: 'Industrial Equipment Cost Calculators – Hourly Burden & Depreciation Rates',
    metaDescription:
      'Calculate machinery depreciation, CNC operating costs per hour, and lease vs buy comparisons. Accurate industrial cost accounting models for capital equipment.',
    iconName: 'Wrench',
    primaryMetric: 'Cost per Machine Hour',
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance Calculators',
    slug: 'compliance',
    path: '/compliance/',
    tagline: 'OSHA statutory penalties, EPA environmental programs, and safety audits',
    description:
      'Model potential regulatory exposures, civil monetary penalties under current inflation-adjusted statutory caps, and annualized environmental compliance budgets across state and federal jurisdictions.',
    metaTitle: 'Industrial Compliance Calculators – OSHA Fine & EPA Cost Estimators',
    metaDescription:
      'Calculate potential OSHA violation penalties with FOM reduction credits and annual EPA compliance budgets for air, water, and RCRA hazardous waste management.',
    iconName: 'AlertTriangle',
    primaryMetric: 'Statutory Penalty & Budget',
  },
  certification: {
    id: 'certification',
    name: 'Certification Cost Calculators',
    slug: 'certification',
    path: '/certification/',
    tagline: 'ISO 9001, ISO 14001, registrar audit fees, and implementation budgets',
    description:
      'Budget for quality and environmental management system certifications. Estimate registrar stage 1/2 audit days, gap analysis fees, and ongoing 3-year surveillance costs.',
    metaTitle: 'Industrial Certification Cost Calculators – ISO 9001 & ISO 14001 Audits',
    metaDescription:
      'Estimate ISO certification and surveillance audit costs for industrial manufacturing facilities. Covers registrar mandays, gap consulting, and annual compliance overhead.',
    iconName: 'Award',
    primaryMetric: '3-Year Certification Budget',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
