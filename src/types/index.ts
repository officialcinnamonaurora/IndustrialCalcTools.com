export type CategoryId = 'insurance' | 'equipment-cost' | 'compliance' | 'certification';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  slug: string;
  path: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  iconName: string;
  primaryMetric: string;
}

export type InputFieldType = 'number' | 'select' | 'slider';

export interface SelectOption {
  label: string;
  value: string;
  multiplier?: number;
  [key: string]: any;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: InputFieldType;
  defaultValue: number | string;
  description?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
}

export interface BreakdownItem {
  label: string;
  amount: number;
  percentage?: number;
  description: string;
}

export interface CalculationResult {
  primaryLabel: string;
  estimatedLow: number;
  estimatedHigh: number;
  pointEstimate: number;
  frequencyLabel: string; // e.g., "per year", "per hour", "total penalty", "3-year cycle"
  breakdown: BreakdownItem[];
  keyDrivers: string[];
  costReductionTips: string[];
  benchmarks?: { label: string; value: string }[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CalculatorDefinition {
  id: string;
  slug: string;
  categoryId: CategoryId;
  path: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  shortDescription: string;
  targetAudience: string;
  featured: boolean;
  featuredBadge?: string;
  iconName: string;
  fields: FormFieldConfig[];
  calculate: (values: Record<string, any>) => CalculationResult;
  explainer: {
    title: string;
    paragraphs: string[];
    factors: { name: string; impact: string; detail: string }[];
    industryBenchmarkNote: string;
  };
  faqs: FAQItem[];
  relatedCalculatorIds: string[];
}
