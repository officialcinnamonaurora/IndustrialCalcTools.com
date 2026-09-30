import { CalculatorDefinition, CategoryId } from '../../types';
import {
  manufacturingPlantInsuranceCalc,
  forkliftInsuranceCalc,
  warehouseInsuranceCalc,
} from './insuranceCalculators';
import {
  oshaFineCalc,
  epaComplianceCostCalc,
} from './complianceCalculators';
import {
  machineryDepreciationCalc,
  cncMachineOperatingCostCalc,
  heavyEquipmentRentalVsBuyCalc,
  iso9001CertificationCalc,
  iso14001CertificationCalc,
} from './equipmentAndCertCalculators';
import {
  craneRentalCostEstimator,
  heavyEquipmentFinancingCalc,
  boilerInsuranceCalc,
  confinedSpaceTrainingCalc,
  forkliftCertByStateCalc,
} from './additionalCalculators';
import {
  freightBrokerBondCalc,
  industrialGeneratorSizingCalc,
  fireSuppressionSystemCostCalc,
  weldingCertificationCostGuide,
  riggingCertificationCostGuide,
} from './moreCalculators';
import {
  industrialWasteDisposalCalc,
  industrialNoiseRegulationCalc,
  industrialFallProtectionCalc,
  manufacturingOverheadCalc,
  industrialEquipmentAppraisalCalc,
} from './latestCalculators';
import {
  scaffoldingRentalCalc,
  boilerInspectionCalc,
  forkliftInsuranceByStateCalc,
  cncMachiningCostEstimator,
  industrialElectricianSalaryCalc,
} from './finalCalculators';
import {
  craneOperatorCertByStateCalc,
  hazwoperCertificationCalc,
  osha30TrainingCalc,
  masterElectricianLicenseCalc,
  industrialCertRenewalCalc,
} from './certCalculators';
import {
  industrialPropertyInsuranceCalc,
  productLiabilityCalc,
  equipmentBreakdownCalc,
  industrialUmbrellaCalc,
  conveyorBeltCostCalc,
} from './insuranceAndConveyorCalculators';
import {
  industrialPumpCostGuide,
  airCompressorRentalCalc,
  industrialWaterTreatmentCalc,
  epaHazardousWasteCalc,
  industrialAirPermitCalc,
} from './pumpsAndEnvironmentalCalculators';

export const ALL_CALCULATORS: CalculatorDefinition[] = [
  // Required core 5
  manufacturingPlantInsuranceCalc,
  forkliftInsuranceCalc,
  warehouseInsuranceCalc,
  oshaFineCalc,
  epaComplianceCostCalc,

  // Batch 2 (5 tools)
  craneRentalCostEstimator,
  heavyEquipmentFinancingCalc,
  boilerInsuranceCalc,
  confinedSpaceTrainingCalc,
  forkliftCertByStateCalc,

  // Batch 3 (5 tools)
  freightBrokerBondCalc,
  industrialGeneratorSizingCalc,
  fireSuppressionSystemCostCalc,
  weldingCertificationCostGuide,
  riggingCertificationCostGuide,

  // Batch 4 (5 tools)
  industrialWasteDisposalCalc,
  industrialNoiseRegulationCalc,
  industrialFallProtectionCalc,
  manufacturingOverheadCalc,
  industrialEquipmentAppraisalCalc,

  // Batch 5 (5 tools)
  scaffoldingRentalCalc,
  boilerInspectionCalc,
  forkliftInsuranceByStateCalc,
  cncMachiningCostEstimator,
  industrialElectricianSalaryCalc,

  // Batch 6 (5 new certification tools)
  craneOperatorCertByStateCalc,
  hazwoperCertificationCalc,
  osha30TrainingCalc,
  masterElectricianLicenseCalc,
  industrialCertRenewalCalc,

  // Batch 7 (5 new insurance and equipment cost calculators)
  industrialPropertyInsuranceCalc,
  productLiabilityCalc,
  equipmentBreakdownCalc,
  industrialUmbrellaCalc,
  conveyorBeltCostCalc,

  // Batch 8 (5 new equipment and compliance calculators)
  industrialPumpCostGuide,
  airCompressorRentalCalc,
  industrialWaterTreatmentCalc,
  epaHazardousWasteCalc,
  industrialAirPermitCalc,

  // Additional Equipment cost and certification calculators
  machineryDepreciationCalc,
  cncMachineOperatingCostCalc,
  heavyEquipmentRentalVsBuyCalc,
  iso9001CertificationCalc,
  iso14001CertificationCalc,
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  // Normalize slug to remove any leading/trailing slashes
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return ALL_CALCULATORS.find(
    (c) => c.slug === clean || c.path.replace(/^\/+|\/+$/g, '') === clean
  );
}

export function getCalculatorsByCategory(categoryId: CategoryId): CalculatorDefinition[] {
  return ALL_CALCULATORS.filter((c) => c.categoryId === categoryId);
}

export function getFeaturedCalculators(): CalculatorDefinition[] {
  return ALL_CALCULATORS.filter((c) => c.featured);
}

export function getRelatedCalculators(calculator: CalculatorDefinition): CalculatorDefinition[] {
  const related = calculator.relatedCalculatorIds
    .map((id) => ALL_CALCULATORS.find((c) => c.id === id))
    .filter((c): c is CalculatorDefinition => Boolean(c));

  // If fewer than 3, backfill from same category
  if (related.length < 3) {
    const sameCat = ALL_CALCULATORS.filter(
      (c) => c.categoryId === calculator.categoryId && c.id !== calculator.id && !related.includes(c)
    );
    while (related.length < 3 && sameCat.length > 0) {
      related.push(sameCat.shift()!);
    }
  }

  // If still fewer than 3, backfill from other calculators
  if (related.length < 3) {
    const others = ALL_CALCULATORS.filter(
      (c) => c.id !== calculator.id && !related.includes(c)
    );
    while (related.length < 3 && others.length > 0) {
      related.push(others.shift()!);
    }
  }

  return related.slice(0, 3);
}
