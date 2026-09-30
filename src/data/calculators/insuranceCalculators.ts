import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const manufacturingPlantInsuranceCalc: CalculatorDefinition = {
  id: 'manufacturing-plant-insurance-calculator',
  slug: 'manufacturing-plant-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/manufacturing-plant-insurance-calculator',
  name: 'Manufacturing Plant Insurance Calculator',
  metaTitle: 'Manufacturing Plant Insurance Calculator – Commercial Facility Rates',
  metaDescription:
    'Calculate manufacturing plant commercial insurance costs. Estimate property, equipment breakdown, general liability, and business interruption premiums by facility size and equipment value.',
  shortDescription:
    'Estimate annual commercial property, general liability, and equipment breakdown premiums for industrial production facilities.',
  targetAudience:
    'Plant managers, CFOs, risk managers, and manufacturing facility owners seeking realistic benchmark budgeting for comprehensive commercial insurance packages.',
  featured: true,
  featuredBadge: 'Most Popular',
  iconName: 'Factory',
  fields: [
    {
      id: 'state',
      label: 'Facility State Location',
      type: 'select',
      defaultValue: 'OH',
      options: STATE_SELECT_OPTIONS,
      description: 'State litigation risk, coastal hurricane exposure, and regional underwriting factors.',
    },
    {
      id: 'facilitySqFt',
      label: 'Facility Footprint (Square Feet)',
      type: 'number',
      defaultValue: 45000,
      min: 2000,
      max: 1000000,
      step: 1000,
      unit: 'sq ft',
      description: 'Total heated and covered plant floor area under roof.',
    },
    {
      id: 'machineryValue',
      label: 'Machinery & Equipment Replacement Value',
      type: 'number',
      defaultValue: 2500000,
      min: 50000,
      max: 50000000,
      step: 50000,
      unit: '$ USD',
      description: 'Total current replacement cost for CNCs, stamping presses, robotics, boilers, and conveyor lines.',
    },
    {
      id: 'annualPayroll',
      label: 'Annual Plant Operating Payroll',
      type: 'number',
      defaultValue: 1800000,
      min: 100000,
      max: 30000000,
      step: 50000,
      unit: '$ USD',
      description: 'Used for General & Product Liability exposure base calculations.',
    },
    {
      id: 'hazardClass',
      label: 'Manufacturing Sub-Sector & Hazard Tier',
      type: 'select',
      defaultValue: 'machining',
      options: [
        { label: 'Light Assembly & Electronics (Low Risk · 0.82×)', value: 'light', multiplier: 0.82 },
        { label: 'Precision Machining & Metal Fabrication (Moderate · 1.00×)', value: 'machining', multiplier: 1.0 },
        { label: 'Food & Beverage Processing (Sanitation/Wet · 1.15×)', value: 'food', multiplier: 1.15 },
        { label: 'Plastics, Rubber & Composites (Thermal/Press · 1.28×)', value: 'plastics', multiplier: 1.28 },
        { label: 'Chemical, Paints & Hazardous Materials (High Hazard · 1.65×)', value: 'chemical', multiplier: 1.65 },
        { label: 'Woodworking & Sawmills (High Combustible Dust · 1.85×)', value: 'wood', multiplier: 1.85 },
      ],
      description: 'Underwriting hazard grade based on ISO fire and operations classifications.',
    },
    {
      id: 'fireSuppression',
      label: 'Fire Suppression & Life Safety System',
      type: 'select',
      defaultValue: 'esfr',
      options: [
        { label: 'Full High-Density ESFR Sprinkler + Central 24/7 Monitoring (0.85×)', value: 'esfr', multiplier: 0.85 },
        { label: 'Standard Wet Pipe Sprinkler System (1.00×)', value: 'standard', multiplier: 1.0 },
        { label: 'Partial Coverage / Dry Standpipes (1.20×)', value: 'partial', multiplier: 1.2 },
        { label: 'No Automatic Sprinkler System (1.55×)', value: 'none', multiplier: 1.55 },
      ],
      description: 'ISO COPE Protection credit or debit based on suppression density.',
    },
    {
      id: 'deductible',
      label: 'Property & Equipment Deductible',
      type: 'select',
      defaultValue: '10000',
      options: [
        { label: '$2,500 Deductible (Lowest retention · 1.08×)', value: '2500', multiplier: 1.08 },
        { label: '$5,000 Deductible (Standard · 1.02×)', value: '5000', multiplier: 1.02 },
        { label: '$10,000 Deductible (Balanced · 0.95×)', value: '10000', multiplier: 0.95 },
        { label: '$25,000 Deductible (Self-insured retention · 0.86×)', value: '25000', multiplier: 0.86 },
        { label: '$50,000 Deductible (Enterprise captive · 0.78×)', value: '50000', multiplier: 0.78 },
      ],
      description: 'Higher deductibles transfer minor claims to cash flow in exchange for lower baseline premiums.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const stateMult = stateObj.insuranceRiskMult;

    const sqFt = Number(values.facilitySqFt) || 45000;
    const machineryVal = Number(values.machineryValue) || 2500000;
    const payroll = Number(values.annualPayroll) || 1800000;

    const hazardMap: Record<string, number> = {
      light: 0.82,
      machining: 1.0,
      food: 1.15,
      plastics: 1.28,
      chemical: 1.65,
      wood: 1.85,
    };
    const hazardMult = hazardMap[values.hazardClass] || 1.0;

    const fireMap: Record<string, number> = {
      esfr: 0.85,
      standard: 1.0,
      partial: 1.2,
      none: 1.55,
    };
    const fireMult = fireMap[values.fireSuppression] || 1.0;

    const deductibleMap: Record<string, number> = {
      '2500': 1.08,
      '5000': 1.02,
      '10000': 0.95,
      '25000': 0.86,
      '50000': 0.78,
    };
    const deductibleMult = deductibleMap[values.deductible] || 0.95;

    // Building replacement cost approximation ($135/sqft baseline)
    const buildingValue = sqFt * 140;
    // Commercial Property Rate: base $0.38 per $100 of total insured value (TIV)
    const tiv = buildingValue + machineryVal * 0.4;
    const propertyBase = (tiv / 100) * 0.0034 * stateMult * hazardMult * fireMult * deductibleMult;

    // Equipment Breakdown & Inland Marine: approx 0.32% of machinery replacement value
    const machineryBreakdown = machineryVal * 0.0032 * hazardMult * deductibleMult;

    // Commercial General & Products Liability: rate per $1,000 payroll ($6.20/k base)
    const liabilityBase = (payroll / 1000) * 7.4 * stateMult * hazardMult;

    // Business Interruption / Extra Expense (scaled from property and machinery)
    const businessInterruption = (propertyBase + machineryBreakdown) * 0.28;

    const totalCalculated = Math.round(propertyBase + machineryBreakdown + liabilityBase + businessInterruption);
    const low = Math.round(totalCalculated * 0.88);
    const high = Math.round(totalCalculated * 1.18);

    return {
      primaryLabel: 'Estimated Annual Plant Insurance Package',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalCalculated,
      frequencyLabel: 'per year',
      breakdown: [
        {
          label: 'Commercial Property & Plant Structure',
          amount: Math.round(propertyBase),
          description: `Coverage for building shell ($${(buildingValue / 1e6).toFixed(1)}M estimated replacement) and permanent fixtures.`,
        },
        {
          label: 'Machinery & Equipment Breakdown',
          amount: Math.round(machineryBreakdown),
          description: `Mechanical failure, boiler explosion, power surge, and CNC production line repair coverage.`,
        },
        {
          label: 'General & Product Liability ($1M/$2M)',
          amount: Math.round(liabilityBase),
          description: `Premises liability, manufacturing defect indemnification, and vendor product recall defense.`,
        },
        {
          label: 'Business Interruption & Extra Expense',
          amount: Math.round(businessInterruption),
          description: `Replaces net operating profits and pays standing payroll while restoring post-loss operations.`,
        },
      ],
      keyDrivers: [
        `Facility State (${stateObj.name}): ${((stateMult - 1) * 100).toFixed(0)}% regional risk adjustment.`,
        `Hazard Tier (${values.hazardClass}): ${(hazardMult * 100).toFixed(0)}% base multiplier.`,
        `Fire Suppression (${values.fireSuppression}): ${fireMult < 1 ? `-${((1 - fireMult) * 100).toFixed(0)}% safety credit` : `+${((fireMult - 1) * 100).toFixed(0)}% surcharge`}.`,
        `Deductible ($${Number(values.deductible).toLocaleString()}): ${((1 - deductibleMult) * 100).toFixed(0)}% retention discount.`,
      ],
      costReductionTips: [
        'Install ESFR high-density sprinklers and central station heat sensors to qualify for up to 20% ISO fire rate credits.',
        'Implement formalized Lockout/Tagout (LOTO) and predictive vibration monitoring to lower equipment breakdown deductibles.',
        'Review Total Insured Values (TIV) annually to avoid over-insuring depreciated non-critical machinery.',
      ],
      benchmarks: [
        { label: 'Avg Cost / Sq Ft', value: `$${(totalCalculated / sqFt).toFixed(2)}/sq ft/yr` },
        { label: 'Avg Rate per $100 TIV', value: `$${((totalCalculated / (buildingValue + machineryVal)) * 100).toFixed(2)}` },
      ],
    };
  },
  explainer: {
    title: 'How Manufacturing Plant Insurance Estimates Are Calculated',
    paragraphs: [
      'Commercial manufacturing insurance packages are underwritten using the ISO COPE model: Construction, Occupancy, Protection, and Exposure. Unlike standard commercial office spaces, industrial production plants carry dense concentrations of capital equipment, volatile chemicals, thermal processes, and high-voltage distribution networks that require tailored commercial multi-peril (CMP) policies.',
      'Our calculation model synthesizes three core rating bases: Total Insured Value (TIV) for real property, Replacement Cost Value (RCV) for machinery floaters, and gross annual payroll for General & Product Liability. Standard underwriting schedules apply a baseline rate of $0.28 to $0.55 per $100 of property value, modified by regional construction indices and ISO Public Protection Classifications (PPC).',
      'The largest premium volatility stem from equipment breakdown endorsements and business interruption limits. When a critical 5-axis mill, stamping press, or industrial chiller suffers sudden mechanical breakdown, repair parts and lost customer fulfillment can exceed building damage. Insurers calculate business interruption based on your 12-month gross operating profit margin.',
      'State-level litigation environments and catastrophe risk play an equally pivotal role. States such as California, Florida, and Louisiana command 20% to 40% surcharges due to seismic, hurricane, and third-party product liability litigation climates, whereas Midwestern manufacturing hubs (Indiana, Ohio, Wisconsin) enjoy more competitive regional underwriting pools.',
    ],
    factors: [
      {
        name: 'COPE Classification & Combustible Dust',
        impact: 'High (±35%)',
        detail: 'Facilities handling wood, aluminum powder, or organic dust require NFPA 652 compliance; absence of certified dust collection can double property rates.',
      },
      {
        name: 'Machinery Equipment Breakdown (Boiler & Machinery)',
        impact: 'Moderate (20-30% of total)',
        detail: 'Covers internal mechanical breakdown, electrical arcing, and casing explosion excluded by standard property perils.',
      },
      {
        name: 'Product Completed Operations Liability',
        impact: 'High (30-50% for high-hazard goods)',
        detail: 'Components shipped to automotive, aerospace, or medical supply chains trigger significant product liability rating loads.',
      },
      {
        name: 'Sprinkler Density (GPM/Sq Ft)',
        impact: 'High (up to 25% credit)',
        detail: 'ESFR (Early Suppression Fast Response) systems rated for high heat release plastics yield the steepest property credits.',
      },
    ],
    industryBenchmarkNote:
      'Industry averages indicate manufacturing plants allocate between 0.35% and 0.85% of total gross revenue toward commercial property, casualty, and equipment breakdown premiums.',
  },
  faqs: [
    {
      question: 'What is the difference between Commercial Property and Equipment Breakdown coverage?',
      answer:
        'Standard Commercial Property insurance only covers external perils like fire, windstorm, lightning, and vandalism. It explicitly excludes internal mechanical failures, electrical short circuits, and motor burnouts. Equipment Breakdown insurance (formerly Boiler & Machinery) covers internal failures, power surges, and the business interruption that results while replacement parts are sourced.',
    },
    {
      question: 'How do insurers calculate Business Interruption limits for a factory?',
      answer:
        'Underwriters use your Business Income Worksheet (CP 15 15), assessing your annual net operating profit plus continuing operating expenses (such as key personnel payroll, debt service, and taxes) over an estimated restoration period (typically 6 to 18 months).',
    },
    {
      question: 'Can having a documented safety program lower my plant insurance?',
      answer:
        'Yes. Documented safety programs, OSHA compliant lockout/tagout (LOTO) procedures, and predictive maintenance logs can qualify your plant for discretionary underwriter schedule credits of 10% to 25% across both General Liability and Property policies.',
    },
    {
      question: 'Does this calculator include Workers’ Compensation?',
      answer:
        'This calculator models Commercial Property, Equipment Breakdown, General & Products Liability, and Business Interruption. Workers’ Compensation is priced separately based on state NCCI class codes (e.g., Code 3632 for machine shops) and your facility’s Experience Modification Rate (EMR).',
    },
  ],
  relatedCalculatorIds: [
    'forklift-insurance-cost-calculator',
    'warehouse-insurance-calculator',
    'machinery-depreciation-hourly-rate-calculator',
  ],
};

export const forkliftInsuranceCalc: CalculatorDefinition = {
  id: 'forklift-insurance-cost-calculator',
  slug: 'forklift-insurance-cost-calculator',
  categoryId: 'insurance',
  path: '/insurance/forklift-insurance-cost-calculator',
  name: 'Forklift Insurance Cost Calculator',
  metaTitle: 'Forklift Insurance Cost Calculator – Fleet & Inland Marine Rates',
  metaDescription:
    'Calculate forklift and powered industrial truck insurance costs. Model mobile equipment physical damage, inland marine floaters, and third-party liability per unit.',
  shortDescription:
    'Calculate mobile equipment physical damage, commercial auto inland marine floaters, and liability premiums across powered industrial truck fleets.',
  targetAudience:
    'Warehouse supervisors, fleet managers, distribution directors, and manufacturing facility operators operating 1 to 100+ powered industrial lift trucks.',
  featured: true,
  featuredBadge: 'Fleet Essential',
  iconName: 'Truck',
  fields: [
    {
      id: 'fleetCount',
      label: 'Number of Forklifts in Fleet',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 100,
      step: 1,
      unit: 'units',
      description: 'Total active powered industrial trucks operated on-site.',
    },
    {
      id: 'forkliftType',
      label: 'Forklift Class & Power Source',
      type: 'select',
      defaultValue: 'electric',
      options: [
        { label: 'Class 1 / 2: Electric Rider / Narrow Aisle Reach ($650/unit base)', value: 'electric', multiplier: 0.9 },
        { label: 'Class 4: Internal Combustion Cushion Tire ($750/unit base)', value: 'ic_cushion', multiplier: 1.0 },
        { label: 'Class 5: IC Pneumatic Tire - Outdoor/Lumber ($880/unit base)', value: 'ic_pneumatic', multiplier: 1.15 },
        { label: 'Class 7: Rough Terrain / Heavy Telehandler ($1,250/unit base)', value: 'telehandler', multiplier: 1.45 },
      ],
      description: 'Heavy pneumatic and telehandler units involve higher collision and tip-over exposures.',
    },
    {
      id: 'unitValue',
      label: 'Average Replacement Value per Forklift',
      type: 'number',
      defaultValue: 38000,
      min: 10000,
      max: 150000,
      step: 1000,
      unit: '$ USD',
      description: 'Market value including battery packs, clamp attachments, or rotators.',
    },
    {
      id: 'state',
      label: 'Operating State / Location',
      type: 'select',
      defaultValue: 'TX',
      options: STATE_SELECT_OPTIONS,
      description: 'Regional litigation climate and commercial auto liability standards.',
    },
    {
      id: 'oshaCertified',
      label: 'Operator Training & Certification Standard',
      type: 'select',
      defaultValue: 'certified_full',
      options: [
        { label: '100% OSHA 1910.178 Compliant & Telematics Monitored (0.85×)', value: 'certified_full', multiplier: 0.85 },
        { label: 'Standard Triennial OSHA Certification (1.00×)', value: 'certified_standard', multiplier: 1.0 },
        { label: 'Incomplete / Informal Training Program (1.35×)', value: 'informal', multiplier: 1.35 },
      ],
      description: 'Underwriters review pre-shift inspection logs and driver training credentials.',
    },
    {
      id: 'coverageScope',
      label: 'Coverage Scope & Endorsement Type',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Comprehensive (Inland Marine + $1M Liability + Hired/Non-Owned)', value: 'full', multiplier: 1.25 },
        { label: 'Physical Damage (Inland Marine Scheduled Floater Only)', value: 'inland_only', multiplier: 0.75 },
        { label: 'General Liability Mobile Equipment Endorsement Only', value: 'gl_only', multiplier: 0.65 },
      ],
      description: 'Whether insuring machine damage, third-party bodily injury, or dual full protection.',
    },
    {
      id: 'deductible',
      label: 'Physical Damage Deductible',
      type: 'select',
      defaultValue: '1000',
      options: [
        { label: '$500 Deductible (1.10×)', value: '500', multiplier: 1.1 },
        { label: '$1,000 Deductible (Standard · 1.00×)', value: '1000', multiplier: 1.0 },
        { label: '$2,500 Deductible (0.90×)', value: '2500', multiplier: 0.9 },
        { label: '$5,000 Deductible (0.80×)', value: '5000', multiplier: 0.8 },
      ],
      description: 'Self-retention per collision, rollover, or fire incident.',
    },
  ],
  calculate: (values) => {
    const fleetCount = Number(values.fleetCount) || 4;
    const unitVal = Number(values.unitValue) || 38000;
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const stateMult = stateObj.insuranceRiskMult;

    const typeMults: Record<string, number> = {
      electric: 0.9,
      ic_cushion: 1.0,
      ic_pneumatic: 1.15,
      telehandler: 1.45,
    };
    const typeMult = typeMults[values.forkliftType] || 1.0;

    const certMults: Record<string, number> = {
      certified_full: 0.85,
      certified_standard: 1.0,
      informal: 1.35,
    };
    const certMult = certMults[values.oshaCertified] || 1.0;

    const covMults: Record<string, number> = {
      full: 1.25,
      inland_only: 0.75,
      gl_only: 0.65,
    };
    const covMult = covMults[values.coverageScope] || 1.25;

    const dedMults: Record<string, number> = {
      '500': 1.1,
      '1000': 1.0,
      '2500': 0.9,
      '5000': 0.8,
    };
    const dedMult = dedMults[values.deductible] || 1.0;

    // Fleet discount scaling factor (more units = slight volume credit)
    const fleetDiscount = fleetCount > 10 ? 0.88 : fleetCount > 4 ? 0.94 : 1.0;

    // Base cost per forklift per year
    // Physical damage: approx 1.1% of replacement value
    const physicalDamagePerUnit = unitVal * 0.011 * typeMult * dedMult;
    // Liability: approx $450/unit baseline for $1M limit
    const liabilityPerUnit = 480 * stateMult * certMult;

    let basePerUnit = 0;
    if (values.coverageScope === 'full') {
      basePerUnit = (physicalDamagePerUnit + liabilityPerUnit) * covMult * 0.8;
    } else if (values.coverageScope === 'inland_only') {
      basePerUnit = physicalDamagePerUnit * covMult * 1.3;
    } else {
      basePerUnit = liabilityPerUnit * covMult * 1.4;
    }

    const totalFleetAnnual = Math.round(basePerUnit * fleetCount * fleetDiscount);
    const low = Math.round(totalFleetAnnual * 0.86);
    const high = Math.round(totalFleetAnnual * 1.16);
    const costPerUnit = Math.round(totalFleetAnnual / fleetCount);

    return {
      primaryLabel: `Total Fleet Insurance (${fleetCount} Forklifts)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalFleetAnnual,
      frequencyLabel: 'per year',
      breakdown: [
        {
          label: 'Mobile Equipment Physical Damage (Inland Marine)',
          amount: Math.round(physicalDamagePerUnit * fleetCount * fleetDiscount * 0.9),
          description: `Covers collision, tip-over, mast damage, fire, and theft across $${(unitVal * fleetCount).toLocaleString()} total equipment value.`,
        },
        {
          label: 'Commercial Liability & Mobile Equipment Rider',
          amount: Math.round(liabilityPerUnit * fleetCount * fleetDiscount * 0.85),
          description: `Third-party pedestrian struck-by accidents, racking collapse, and facility wall impacts.`,
        },
        {
          label: 'Hired & Non-Owned Forklift / Attachment Floater',
          amount: Math.round(totalFleetAnnual * 0.12),
          description: `Covers rental surge forklifts during peak season and specialized attachments (clamps, carpet poles).`,
        },
      ],
      keyDrivers: [
        `Fleet Size: ${fleetCount} units (${fleetDiscount < 1 ? `${Math.round((1 - fleetDiscount) * 100)}% fleet volume credit` : 'standard tier'}).`,
        `OSHA Training Status: ${certMult < 1 ? '15% certified telematics discount' : certMult > 1 ? '+35% uncertified surcharge' : 'baseline rate'}.`,
        `Average Cost per Unit: $${costPerUnit.toLocaleString()} / forklift / year ($${Math.round(costPerUnit / 12)} / month).`,
      ],
      costReductionTips: [
        'Maintain strict, documented OSHA 1910.178 operator training and pre-operation digital checklist records.',
        'Implement fleet telematics (impact sensors, speed governors, and access badges) to unlock up to 15% fleet credits.',
        'Group physical damage coverage under a blanket inland marine floater with higher retention ($2,500).',
      ],
      benchmarks: [
        { label: 'Cost / Unit / Year', value: `$${costPerUnit.toLocaleString()}` },
        { label: 'Cost / Unit / Month', value: `$${Math.round(costPerUnit / 12)}` },
        { label: 'Coverage Rate / Value', value: `${((totalFleetAnnual / (unitVal * fleetCount)) * 100).toFixed(1)}%` },
      ],
    };
  },
  explainer: {
    title: 'How Forklift Insurance Costs Are Calculated',
    paragraphs: [
      'Forklifts, order pickers, and pallet jacks fall under the specialized classification of "Mobile Equipment" defined under standard ISO policy forms (such as CG 00 01 and CA 00 51). Because forklifts routinely cause some of the most expensive industrial facility claims—including racked inventory collapses, pedestrian strikes, and loading dock falls—insuring them requires coordination between two distinct policy parts.',
      'The first component is Mobile Equipment Physical Damage, usually written as an Inland Marine floater. This policy pays to repair or replace the forklift when it tips over, catches fire, drops into a trailer pit, or suffers mast damage. Pricing directly reflects the unit’s replacement cost and operating environment. Class 7 rough-terrain forklifts and outdoor pneumatic trucks carry noticeably higher damage claim frequency than indoor electric narrow-aisle reach trucks.',
      'The second component is Third-Party Liability. Under standard commercial general liability (CGL), mobile equipment operated on your designated premises is generally covered. However, if forklifts traverse public roads between buildings, drive on public ramps, or are rented from third-party equipment providers, dedicated Commercial Auto or Hired & Non-Owned Mobile Equipment endorsements are mandatory.',
      'Underwriters place immense weight on your facility’s OSHA 29 CFR 1910.178 compliance. Every lift truck operator must be trained, evaluated, and re-certified every three years. Facilities with active impact sensors, speed limiters, and clean safety inspection logs routinely receive 15% to 25% preferential pricing from commercial underwriters.',
    ],
    factors: [
      {
        name: 'Forklift Class & Power Source',
        impact: 'Moderate (10-35%)',
        detail: 'Electric indoor trucks have lower claim severities; heavy diesel pneumatic yard trucks face severe ground and collision risks.',
      },
      {
        name: 'Fleet Volume Sizing',
        impact: 'Moderate (6-15% discount)',
        detail: 'Fleets with 5 or more units qualify for fleet blanket schedules rather than individual scheduled vehicle rates.',
      },
      {
        name: 'OSHA 1910.178 & Telematics Tracking',
        impact: 'High (up to 25% credit)',
        detail: 'Electronic driver keycards and impact sensors eliminate unauthorized drivers and lower collision claim incidence.',
      },
      {
        name: 'Physical Damage Deductible Level',
        impact: 'Moderate (10-20%)',
        detail: 'Raising the deductible from $500 to $2,500 lowers the collision and roll-over floater line items significantly.',
      },
    ],
    industryBenchmarkNote:
      'Nationwide, industrial fleet operators pay an average of $750 to $1,400 annually per standard warehouse forklift for comprehensive physical damage and liability protection.',
  },
  faqs: [
    {
      question: 'Is a forklift covered by standard Commercial Auto or General Liability?',
      answer:
        'Forklifts operated strictly on your business premises are classified as "Mobile Equipment" and covered for liability under your Commercial General Liability (CGL) policy. However, physical damage to the forklift itself is NOT covered by CGL—it requires an Inland Marine Equipment Floater. Additionally, driving across public roadways requires a Commercial Auto endorsement.',
    },
    {
      question: 'Are rented or leased forklifts covered by our company insurance?',
      answer:
        'Leasing companies require you to provide proof of insurance before delivery. You need a Hired and Non-Owned Mobile Equipment endorsement on your Inland Marine policy that names the leasing vendor as an "Additional Insured and Loss Payee".',
    },
    {
      question: 'How do OSHA fines impact forklift insurance premiums?',
      answer:
        'If OSHA inspects your facility and issues citations for unlicensed operators, missing seatbelts, or uninspected forklifts, insurance underwriters review these public violation records at renewal and may apply significant risk surcharges or increase deductibles.',
    },
    {
      question: 'Does forklift insurance cover damage to inventory caused by dropped loads?',
      answer:
        'Standard equipment damage covers the forklift itself. Damage to your own inventory is covered under your Commercial Property / Stock Floater. If you are a 3PL handling customer cargo, you need Warehouse Legal Liability (Bailee’s coverage) to cover damaged customer pallets.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'warehouse-insurance-calculator',
    'osha-fine-calculator',
  ],
};

export const warehouseInsuranceCalc: CalculatorDefinition = {
  id: 'warehouse-insurance-calculator',
  slug: 'warehouse-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/warehouse-insurance-calculator',
  name: 'Warehouse Insurance Calculator',
  metaTitle: 'Warehouse Insurance Calculator – Commercial Logistics & 3PL Rates',
  metaDescription:
    'Calculate warehouse commercial insurance premiums. Model building property, warehouse legal liability, stock floaters, and ESFR sprinkler credits by facility square footage.',
  shortDescription:
    'Estimate commercial building, contents, warehouse legal liability (3PL), and inventory stock coverage costs for logistics facilities.',
  targetAudience:
    'Third-party logistics (3PL) providers, e-commerce fulfillment hubs, and private distribution facility managers budgeting property and bailee liability coverage.',
  featured: true,
  featuredBadge: 'High Volume',
  iconName: 'Warehouse',
  fields: [
    {
      id: 'squareFootage',
      label: 'Warehouse Footprint (Square Feet)',
      type: 'number',
      defaultValue: 75000,
      min: 5000,
      max: 1500000,
      step: 5000,
      unit: 'sq ft',
      description: 'Total interior clear-span storage and dock staging area.',
    },
    {
      id: 'inventoryValue',
      label: 'Average Stored Inventory / Goods Value',
      type: 'number',
      defaultValue: 5000000,
      min: 100000,
      max: 100000000,
      step: 100000,
      unit: '$ USD',
      description: 'Average peak or monthly reporting stock value on floor and racks.',
    },
    {
      id: 'businessModel',
      label: 'Facility Operating Model',
      type: 'select',
      defaultValue: 'private_owner',
      options: [
        { label: 'Private Owner-Occupied (Self-Owned Goods · 1.00×)', value: 'private_owner', multiplier: 1.0 },
        { label: 'Public Commercial / 3PL Warehouse (Customer Bailee Goods · 1.28×)', value: 'three_pl', multiplier: 1.28 },
        { label: 'Cold Storage / Refrigerated Warehouse (Temperature Peril · 1.45×)', value: 'cold_storage', multiplier: 1.45 },
        { label: 'High-Throughput E-Commerce Cross-Dock (1.18×)', value: 'cross_dock', multiplier: 1.18 },
      ],
      description: 'Third-party logistics facilities require Warehouse Legal Liability (Bailee coverage).',
    },
    {
      id: 'commodityClass',
      label: 'NFPA Commodity Hazard Classification',
      type: 'select',
      defaultValue: 'class3',
      options: [
        { label: 'Class I / II: Non-combustible goods, metal cans, glass (0.85×)', value: 'class1', multiplier: 0.85 },
        { label: 'Class III: Wood, paper, natural fiber cartons (1.00×)', value: 'class3', multiplier: 1.0 },
        { label: 'Class IV: Group B/C plastics, non-expanded plastics (1.22×)', value: 'class4', multiplier: 1.22 },
        { label: 'High Hazard: Expanded Group A plastics, lithium batteries, aerosols (1.65×)', value: 'high_hazard', multiplier: 1.65 },
      ],
      description: 'NFPA 13 heat release and fire spread classification for stacked goods.',
    },
    {
      id: 'rackingHeight',
      label: 'Clear Ceiling Height & Racking Configuration',
      type: 'select',
      defaultValue: 'standard_high',
      options: [
        { label: 'Low Bay (Under 20 ft clear height · 0.92×)', value: 'low_bay', multiplier: 0.92 },
        { label: 'Standard High Bay (20 ft to 32 ft clear height · 1.00×)', value: 'standard_high', multiplier: 1.0 },
        { label: 'Very High Bay / ASRS Automated System (32+ ft clear height · 1.18×)', value: 'asrs', multiplier: 1.18 },
      ],
      description: 'High vertical rack storage creates intense vertical flue spaces during fire events.',
    },
    {
      id: 'state',
      label: 'Warehouse State Location',
      type: 'select',
      defaultValue: 'IL',
      options: STATE_SELECT_OPTIONS,
      description: 'Regional weather perils, tornado corridors, seismic exposure, and property tax baselines.',
    },
    {
      id: 'sprinklerProtection',
      label: 'Fire Suppression & ESFR Capability',
      type: 'select',
      defaultValue: 'esfr',
      options: [
        { label: 'ESFR (Early Suppression Fast Response) + In-Rack Sprinklers (0.82×)', value: 'esfr', multiplier: 0.82 },
        { label: 'Standard Overhead Wet Pipe System (1.00×)', value: 'standard_wet', multiplier: 1.0 },
        { label: 'Dry Pipe System / Unheated Structure (1.15×)', value: 'dry_pipe', multiplier: 1.15 },
        { label: 'Inadequate / Partial Sprinkler Coverage (1.50×)', value: 'none', multiplier: 1.5 },
      ],
      description: 'Water delivery density at ceiling and rack flue junctions.',
    },
  ],
  calculate: (values) => {
    const sqFt = Number(values.squareFootage) || 75000;
    const inventoryVal = Number(values.inventoryValue) || 5000000;
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const stateMult = stateObj.insuranceRiskMult;

    const modelMults: Record<string, number> = {
      private_owner: 1.0,
      three_pl: 1.28,
      cold_storage: 1.45,
      cross_dock: 1.18,
    };
    const modelMult = modelMults[values.businessModel] || 1.0;

    const commodityMults: Record<string, number> = {
      class1: 0.85,
      class3: 1.0,
      class4: 1.22,
      high_hazard: 1.65,
    };
    const commodityMult = commodityMults[values.commodityClass] || 1.0;

    const rackMults: Record<string, number> = {
      low_bay: 0.92,
      standard_high: 1.0,
      asrs: 1.18,
    };
    const rackMult = rackMults[values.rackingHeight] || 1.0;

    const sprinklerMults: Record<string, number> = {
      esfr: 0.82,
      standard_wet: 1.0,
      dry_pipe: 1.15,
      none: 1.5,
    };
    const sprinklerMult = sprinklerMults[values.sprinklerProtection] || 0.82;

    // Building replacement cost ($115/sqft tilt-up warehouse baseline)
    const buildingValue = sqFt * 120;
    // Commercial property base rate on building
    const propertyBase = (buildingValue / 100) * 0.0022 * stateMult * commodityMult * sprinklerMult;

    // Inventory Stock or Warehouse Legal Liability
    let cargoOrBailee = 0;
    if (values.businessModel === 'three_pl') {
      // Warehouse Legal Liability (Bailee) based on limit and throughput
      cargoOrBailee = (inventoryVal / 100) * 0.0018 * commodityMult * stateMult;
    } else if (values.businessModel === 'cold_storage') {
      // Ammonia refrigeration spoilage rider + property
      cargoOrBailee = (inventoryVal / 100) * 0.0024 * commodityMult * stateMult;
    } else {
      // Direct first-party business personal property (BPP)
      cargoOrBailee = (inventoryVal / 100) * 0.0015 * commodityMult * sprinklerMult;
    }

    // General Liability (dock accidents, slip and fall, loading bay)
    const generalLiability = (sqFt / 1000) * 65 * stateMult * modelMult;

    // Business Interruption (rental income or operational continuity)
    const businessInterruption = propertyBase * 0.22;

    const totalAnnual = Math.round((propertyBase + cargoOrBailee + generalLiability + businessInterruption) * rackMult);
    const low = Math.round(totalAnnual * 0.88);
    const high = Math.round(totalAnnual * 1.18);

    return {
      primaryLabel: 'Estimated Annual Warehouse Insurance Premium',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: 'per year',
      breakdown: [
        {
          label: 'Commercial Building Property Coverage',
          amount: Math.round(propertyBase * rackMult),
          description: `Structure coverage for $${(buildingValue / 1e6).toFixed(1)}M tilt-up/steel shell, loading docks, and roof.`,
        },
        {
          label: values.businessModel === 'three_pl' ? 'Warehouse Legal Liability (Bailee Cargo)' : 'Inventory & Business Personal Property (BPP)',
          amount: Math.round(cargoOrBailee * rackMult),
          description: `Covers $${(inventoryVal / 1e6).toFixed(1)}M in stored merchandise against fire, theft, water, and handling damage.`,
        },
        {
          label: 'Commercial General Liability ($1M / $2M)',
          amount: Math.round(generalLiability),
          description: `Third-party trucking carrier slip-and-falls, dock plate incidents, and premises liability.`,
        },
        {
          label: 'Business Income & Extra Expense',
          amount: Math.round(businessInterruption * rackMult),
          description: `Protects lease revenues or continuing storage overhead during post-catastrophe rebuilding.`,
        },
      ],
      keyDrivers: [
        `Facility Size: ${sqFt.toLocaleString()} sq ft ($${(totalAnnual / sqFt).toFixed(2)}/sq ft/yr).`,
        `Operating Model: ${modelMult > 1 ? `+${Math.round((modelMult - 1) * 100)}% 3PL/Cold Storage risk rating` : 'Private owner standard'}.`,
        `Commodity Tier: NFPA ${values.commodityClass} (${commodityMult}× fire factor).`,
        `Sprinkler System: ${sprinklerMult < 1 ? `-${Math.round((1 - sprinklerMult) * 100)}% ESFR credit` : `+${Math.round((sprinklerMult - 1) * 100)}% unsprinklered surcharge`}.`,
      ],
      costReductionTips: [
        'Upgrade to ESFR ceiling sprinklers to eliminate expensive in-rack piping requirements while cutting property rates.',
        'Use electronic bills of lading and warehouse management system (WMS) inventory cycle-counting to reduce stock floater premiums.',
        'Ensure contracts with customer shippers include enforceable limitation of liability clauses ($0.50/lb or set per-pallet maximums).',
      ],
      benchmarks: [
        { label: 'Insurance / Sq Ft', value: `$${(totalAnnual / sqFt).toFixed(2)}/sq ft` },
        { label: 'Monthly Equivalent', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
      ],
    };
  },
  explainer: {
    title: 'How Warehouse Insurance Costs Are Calculated',
    paragraphs: [
      'Warehouse insurance pricing differs fundamentally depending on whether the building houses your own proprietary merchandise or operates as a public Third-Party Logistics (3PL) facility. For self-owned facilities, inventory is insured under standard Business Personal Property (BPP). For 3PL operations, customer inventory cannot be insured under BPP; instead, operators require Warehouse Legal Liability (Bailee’s coverage) to defend against claims of negligence when client goods are damaged.',
      'The National Fire Protection Association (NFPA) commodity classification is the premier driver of property underwriting. Class I and II commodities (such as canned foodstuffs or non-combustible hardware) present minimal fire load. In contrast, Class IV goods and Group A plastics (such as foam mattresses, synthetic athletic footwear, or aerosols) release explosive BTU levels that can overwhelm standard wet-pipe sprinklers.',
      'Ceiling clear height directly compounds fire risk. Modern distribution logistics centers feature 32-foot to 40-foot clear heights. If a fire starts near the bottom of a high rack, the vertical flue space creates a chimney effect, rapidly accelerating temperatures. Facilities with ESFR (Early Suppression Fast Response) sprinklers discharge large high-momentum water droplets capable of penetrating fire plumes, qualifying for substantial underwriting credits.',
      'Geographic location also affects building rates. Hail and wind deductibles in the Midwest and hurricane coastal zones in Florida and the Gulf Coast can require separate 2% to 5% percentage-based named-storm deductibles, driving up effective annual risk budgets.',
    ],
    factors: [
      {
        name: '3PL Bailee Liability vs. BPP Floater',
        impact: 'High (25-40% difference)',
        detail: '3PL operators must insure customer stock under legal liability terms grounded in Uniform Commercial Code (UCC) Article 7.',
      },
      {
        name: 'NFPA 13 Commodity Fire Class',
        impact: 'High (30-65% variance)',
        detail: 'Storing Class IV or Group A expanded plastics requires higher water gallonage per square foot and drives higher property rates.',
      },
      {
        name: 'Clear Height & ASRS Automation',
        impact: 'Moderate (15-25%)',
        detail: 'Ceilings exceeding 32 feet require in-rack sprinkler barriers or high-capacity ESFR K-factor heads.',
      },
      {
        name: 'Cold Storage & Ammonia Perils',
        impact: 'High (35-50% surcharge)',
        detail: 'Refrigerated warehouses face mechanical breakdown, refrigerant contamination, and food spoilage perils.',
      },
    ],
    industryBenchmarkNote:
      'Logistics facilities typically budget between $0.30 and $0.75 per square foot annually for combined commercial building property and liability insurance.',
  },
  faqs: [
    {
      question: 'What is Warehouse Legal Liability and why is it needed for 3PLs?',
      answer:
        'Warehouse Legal Liability (also known as Bailee’s coverage) protects warehouse operators when customer-owned goods in their care, custody, and control are damaged, lost, or destroyed due to the warehouse’s negligence. Unlike property insurance, it does not pay claims if damage was caused by an "Act of God" beyond the operator’s control, unless contractually assumed.',
    },
    {
      question: 'Can ESFR sprinklers reduce my warehouse insurance rate?',
      answer:
        'Yes. Installing Early Suppression Fast Response (ESFR) sprinkler heads can reduce property insurance rates by 15% to 30%. ESFR delivers higher water volume and larger droplets directly to the seat of the fire, often eliminating the need for expensive in-rack sprinkler pipes.',
    },
    {
      question: 'How do warehouse lease contracts affect insurance requirements?',
      answer:
        'Most triple-net (NNN) commercial warehouse leases require the tenant to pay for property insurance on the building, maintain at least $1,000,000 to $5,000,000 in Commercial General Liability, and provide a Waiver of Subrogation in favor of the landlord.',
    },
    {
      question: 'What happens if customer inventory values fluctuate throughout the year?',
      answer:
        'Warehouse operators can use a Value Reporting Form endorsement. Rather than paying premium on a fixed maximum limit all year, you report monthly stock values to the insurer and pay premium adjusted to your actual seasonal inventory average.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'forklift-insurance-cost-calculator',
    'osha-fine-calculator',
  ],
};
