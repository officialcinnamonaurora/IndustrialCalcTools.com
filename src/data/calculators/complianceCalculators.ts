import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const oshaFineCalc: CalculatorDefinition = {
  id: 'osha-fine-calculator',
  slug: 'osha-fine-calculator',
  categoryId: 'compliance',
  path: '/compliance/osha-fine-calculator',
  name: 'OSHA Fine Calculator',
  metaTitle: 'OSHA Fine Calculator – Statutory Penalty Caps & Settlement Estimator',
  metaDescription:
    'Calculate potential OSHA penalties under current Federal Civil Monetary Penalty inflation adjustments. Model Serious, Willful, and Repeat violations with size and good-faith discounts.',
  shortDescription:
    'Estimate statutory civil penalties and informal conference settlement ranges across Serious, Willful, Repeat, and Failure to Abate violations.',
  targetAudience:
    'EHS managers, safety directors, plant supervisors, and industrial legal counsel preparing for or responding to OSHA inspection citations.',
  featured: true,
  featuredBadge: 'Regulatory Standard',
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'companySize',
      label: 'Company Headcount (Total Enterprise Employees)',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '1 to 25 Employees (60% Statutory Size Reduction)', value: 'tiny', multiplier: 0.4 },
        { label: '26 to 100 Employees (30% Statutory Size Reduction)', value: 'small', multiplier: 0.7 },
        { label: '101 to 250 Employees (10% Statutory Size Reduction)', value: 'medium', multiplier: 0.9 },
        { label: '251+ Employees (0% Size Reduction · Standard Cap)', value: 'large', multiplier: 1.0 },
      ],
      description: 'Per OSHA Field Operations Manual (FOM) Chapter 6 statutory size discount tables.',
    },
    {
      id: 'seriousViolations',
      label: 'Number of Serious Violations',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 50,
      step: 1,
      unit: 'citations',
      description: 'Maximum statutory cap: $16,131 per violation (high gravity baseline $16,131, moderate $11,522).',
    },
    {
      id: 'otherViolations',
      label: 'Other-Than-Serious Violations',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 50,
      step: 1,
      unit: 'citations',
      description: 'Recordkeeping, missing posters, or non-hazardous paperwork items ($1,000 to $4,000 avg).',
    },
    {
      id: 'willfulViolations',
      label: 'Willful Violations (Intentional / Plain Indifference)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 10,
      step: 1,
      unit: 'citations',
      description: 'Statutory minimum $11,524 up to maximum $161,323 per willful citation.',
    },
    {
      id: 'repeatViolations',
      label: 'Repeat Violations (Cited within Prior 5 Years)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 10,
      step: 1,
      unit: 'citations',
      description: 'Substantially similar conditions previously cited; statutory maximum $161,323 per citation.',
    },
    {
      id: 'abatementDays',
      label: 'Failure to Abate (Days Past Mandatory Deadline)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 90,
      step: 1,
      unit: 'days',
      description: 'Accrues daily penalties up to $16,131 per calendar day after correction date.',
    },
    {
      id: 'goodFaith',
      label: 'Safety Program & Good Faith History',
      type: 'select',
      defaultValue: 'average',
      options: [
        { label: 'Strong written safety program & immediate cooperation (25% discount)', value: 'strong', multiplier: 0.75 },
        { label: 'Average safety program & partial documentation (15% discount)', value: 'average', multiplier: 0.85 },
        { label: 'Deficient or non-existent written safety program (0% discount)', value: 'poor', multiplier: 1.0 },
      ],
      description: 'Area Director discretionary credit applied for proactive safety culture.',
    },
    {
      id: 'priorHistory',
      label: '5-Year Prior OSHA Inspection History',
      type: 'select',
      defaultValue: 'clean',
      options: [
        { label: 'Clean record / No serious violations in past 5 years (10% credit)', value: 'clean', multiplier: 0.9 },
        { label: 'Past inspections with minor citations (0% credit)', value: 'minor', multiplier: 1.0 },
        { label: 'Multiple repeat citations / contested history (10% penalty surcharge)', value: 'repeat_history', multiplier: 1.1 },
      ],
      description: 'Compliance history verification across OSHA federal enforcement database.',
    },
    {
      id: 'state',
      label: 'Jurisdiction / State Plan',
      type: 'select',
      defaultValue: 'OH',
      options: STATE_SELECT_OPTIONS,
      description: 'Indicates Federal OSHA vs State Plan (e.g., Cal/OSHA, MIOSHA, TOSHA).',
    },
  ],
  calculate: (values) => {
    const serious = Number(values.seriousViolations) || 0;
    const other = Number(values.otherViolations) || 0;
    const willful = Number(values.willfulViolations) || 0;
    const repeat = Number(values.repeatViolations) || 0;
    const abateDays = Number(values.abatementDays) || 0;

    const sizeMults: Record<string, number> = {
      tiny: 0.4,
      small: 0.7,
      medium: 0.9,
      large: 1.0,
    };
    const sizeMult = sizeMults[values.companySize] || 0.9;

    const goodFaithMults: Record<string, number> = {
      strong: 0.75,
      average: 0.85,
      poor: 1.0,
    };
    const goodFaithMult = goodFaithMults[values.goodFaith] || 0.85;

    const historyMults: Record<string, number> = {
      clean: 0.9,
      minor: 1.0,
      repeat_history: 1.1,
    };
    const historyMult = historyMults[values.priorHistory] || 0.9;

    // 2026 Statutory Caps
    const SERIOUS_MAX = 16131;
    const WILLFUL_MAX = 161323;
    const OTHER_BASE = 2500;
    const ABATE_DAILY = 16131;

    // Gross Statutory Penalties (Pre-adjustment)
    const grossSerious = serious * SERIOUS_MAX;
    const grossOther = other * OTHER_BASE;
    const grossWillful = willful * WILLFUL_MAX;
    const grossRepeat = repeat * WILLFUL_MAX;
    const grossAbate = abateDays * ABATE_DAILY;

    const totalGross = grossSerious + grossOther + grossWillful + grossRepeat + grossAbate;

    // Gravity-based penalty adjustments (Size, Good Faith, History apply primarily to Serious and Other)
    // Note: Willful violations do NOT receive good faith discounts per FOM rules, only size.
    const combinedReductionSerious = sizeMult * goodFaithMult * historyMult;
    const adjustedSerious = Math.round(grossSerious * combinedReductionSerious);
    const adjustedOther = Math.round(grossOther * combinedReductionSerious);
    const adjustedWillful = Math.round(grossWillful * sizeMult); // No good faith discount for willful
    const adjustedRepeat = Math.round(grossRepeat * sizeMult * (historyMult > 1 ? 1.1 : 1.0));
    const adjustedAbate = grossAbate;

    const proposedFine = Math.round(adjustedSerious + adjustedOther + adjustedWillful + adjustedRepeat + adjustedAbate);

    // Informal Settlement Conference Range (Typically 30% to 50% additional reduction for rapid abatement)
    const settlementLow = Math.round(proposedFine * 0.52);
    const settlementHigh = Math.round(proposedFine * 0.78);

    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    return {
      primaryLabel: 'Initial Proposed OSHA Citation Penalty',
      estimatedLow: settlementLow,
      estimatedHigh: proposedFine,
      pointEstimate: proposedFine,
      frequencyLabel: 'total penalty assessment',
      breakdown: [
        {
          label: `Serious Violations (${serious} cited)`,
          amount: adjustedSerious,
          description: `Base cap $16,131 per violation adjusted for employer size and good-faith credits.`,
        },
        {
          label: `Willful Violations (${willful} cited)`,
          amount: adjustedWillful,
          description: `High severity intentional violations (statutory max $161,323 per citation; size credit only).`,
        },
        {
          label: `Repeat Violations (${repeat} cited)`,
          amount: adjustedRepeat,
          description: `Substantially similar conditions previously cited within 5 years.`,
        },
        {
          label: `Other-Than-Serious (${other} cited)`,
          amount: adjustedOther,
          description: `Recordkeeping, missing OSHA 300 logs, and minor technical infractions.`,
        },
        ...(abateDays > 0
          ? [
              {
                label: `Failure to Abate (${abateDays} days)`,
                amount: adjustedAbate,
                description: `Daily accrued fines at $16,131/day past mandated compliance date.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Statutory Gross Assessment: $${totalGross.toLocaleString()} before statutory credits.`,
        `Company Size Credit: ${Math.round((1 - sizeMult) * 100)}% discount under FOM Chapter 6 table.`,
        `Safety Program & Good Faith: ${Math.round((1 - goodFaithMult) * 100)}% credit.`,
        `Estimated Settlement at Informal Conference: $${settlementLow.toLocaleString()} – $${settlementHigh.toLocaleString()} with rapid corrective action.`,
      ],
      costReductionTips: [
        'Request an Informal Conference with the OSHA Area Director within 15 working days of citation receipt.',
        'Present written proof of immediate hazard abatement and an enhanced safety audit protocol to seek 30-50% penalty reductions.',
        'Negotiate reclassification of "Serious" citations down to "Other-Than-Serious" to avoid future repeat violation risk and protect insurance ratings.',
      ],
      benchmarks: [
        { label: 'Unadjusted Gross Cap', value: `$${totalGross.toLocaleString()}` },
        { label: 'Settlement Target', value: `$${settlementLow.toLocaleString()}` },
        { label: 'Jurisdiction', value: `${stateObj.oshaPlanType} (${stateObj.name})` },
      ],
    };
  },
  explainer: {
    title: 'How OSHA Penalties and Settlement Reductions Are Calculated',
    paragraphs: [
      'Under the Federal Civil Penalties Inflation Adjustment Act, the Department of Labor adjusts OSHA maximum penalty levels annually for inflation. For 2026, the statutory maximum for Serious and Other-Than-Serious violations is $16,131 per violation, while Willful and Repeat violations carry a maximum statutory penalty of $161,323 per occurrence.',
      'OSHA Compliance Safety and Health Officers (CSHOs) and Area Directors do not simply assess maximum fines automatically. They follow the rigid calculation matrix outlined in Chapter 6 of the OSHA Field Operations Manual (FOM). Penalties begin with the Gravity-Based Penalty (GBP), which evaluates the Severity of the potential injury (High, Medium, or Low) multiplied by the Probability of an incident occurring (Greater or Lesser).',
      'Once the gravity base is established, statutory adjustment factors are systematically subtracted. Employers with 1 to 25 employees receive a 60% reduction; employers with 26 to 100 employees receive 30%; and those with 101 to 250 receive 10%. Employers with over 250 employees receive no size reduction. Furthermore, employers with documented safety programs and active employee training can earn up to 25% Good Faith reductions, plus an additional 10% for a clean 5-year inspection history.',
      'Upon receiving a citation, employers have 15 working days to either pay, contest the citation before the Occupational Safety and Health Review Commission (OSHRC), or schedule an Informal Conference with the OSHA Area Director. At an informal conference, Area Directors routinely exercise discretionary authority to reduce penalties by 30% to 50% in exchange for fast abatement, employee safety training, and formal settlement agreements.',
    ],
    factors: [
      {
        name: 'Gravity of Violation (Severity × Probability)',
        impact: 'High ($4,610 to $16,131/violation)',
        detail: 'Assesses whether death or irreversible disability could result, combined with employee frequency of exposure.',
      },
      {
        name: 'Employer Size Reduction Table',
        impact: 'High (0% to 60% discount)',
        detail: 'Small facilities under 25 workers receive the maximum 60% statutory reduction on serious penalties.',
      },
      {
        name: 'Willful vs. Serious Classification',
        impact: 'Extreme (10× penalty multiplier)',
        detail: 'Willful violations require evidence of intentional disregard or plain indifference and cannot receive good faith reductions.',
      },
      {
        name: '15-Day Informal Conference Settlement',
        impact: 'High (30% to 50% discount)',
        detail: 'Prompt abatement and constructive dialogue with the Area Director almost always reduces net payable fines.',
      },
    ],
    industryBenchmarkNote:
      'According to OSHA enforcement statistics, over 70% of contested or informally negotiated citations result in fine reductions averaging 35% to 45% below initial proposed amounts.',
  },
  faqs: [
    {
      question: 'What is the strict 15-day deadline after receiving an OSHA citation?',
      answer:
        'Employers have exactly 15 working days (excluding federal holidays and weekends) from the date of certified citation receipt to either: 1) submit a written Notice of Intent to Contest, or 2) schedule and hold an Informal Settlement Conference with the Area Director. Missing this deadline makes the citation a final, legally binding order that cannot be appealed.',
    },
    {
      question: 'Can an OSHA citation be downgraded from Serious to Other-Than-Serious?',
      answer:
        'Yes. Reclassifying citations is one of the most critical goals of an informal conference. Area Directors may agree to amend a citation from Serious to Other-Than-Serious if you demonstrate prompt abatement and good faith. This eliminates the "Serious" designation from your public OSHA profile and prevents future "Repeat" citations.',
    },
    {
      question: 'Do State Plan states (like Cal/OSHA or MIOSHA) have different fines?',
      answer:
        'State-plan states must maintain penalty structures at least as effective as Federal OSHA. Some state plans (such as California’s Cal/OSHA) impose even higher maximums for specialized categories, such as Enterprise-Wide Serious violations, or stricter indoor heat illness and ergonomics standards.',
    },
    {
      question: 'Are OSHA fines tax-deductible as ordinary business expenses?',
      answer:
        'No. Under Internal Revenue Code Section 162(f), fines and penalties paid to a government agency for the violation of any law—including OSHA civil penalties—are strictly non-deductible for federal corporate income tax purposes.',
    },
  ],
  relatedCalculatorIds: [
    'epa-compliance-cost-calculator',
    'manufacturing-plant-insurance-calculator',
    'forklift-insurance-cost-calculator',
  ],
};

export const epaComplianceCostCalc: CalculatorDefinition = {
  id: 'epa-compliance-cost-calculator',
  slug: 'epa-compliance-cost-calculator',
  categoryId: 'compliance',
  path: '/compliance/epa-compliance-cost-calculator',
  name: 'EPA Compliance Cost Calculator',
  metaTitle: 'EPA Compliance Cost Calculator – Industrial Environmental Budgets',
  metaDescription:
    'Calculate annual EPA environmental compliance costs for industrial facilities. Model Clean Air Act Title V, NPDES wastewater, RCRA hazardous waste, and SPCC compliance.',
  shortDescription:
    'Estimate annual ongoing compliance budgets and initial engineering capital expenditures across Clean Air Act, Clean Water Act, and RCRA regulations.',
  targetAudience:
    'Environmental health and safety (EHS) directors, plant engineers, sustainability managers, and manufacturing executives budgeting environmental permitting and monitoring.',
  featured: true,
  featuredBadge: 'Environmental EHS',
  iconName: 'FileCheck',
  fields: [
    {
      id: 'industrySector',
      label: 'Manufacturing / Industrial Sector',
      type: 'select',
      defaultValue: 'machining',
      options: [
        { label: 'Precision Metal Machining & Fabrication (1.00×)', value: 'machining', multiplier: 1.0 },
        { label: 'Electroplating, Coating & Surface Finishing (1.45×)', value: 'plating', multiplier: 1.45 },
        { label: 'Chemical, Resin & Solvent Manufacturing (1.80×)', value: 'chemical', multiplier: 1.8 },
        { label: 'Food, Dairy & Beverage Processing (1.20×)', value: 'food', multiplier: 1.2 },
        { label: 'Pulp, Paper & Wood Preservation (1.35×)', value: 'paper', multiplier: 1.35 },
        { label: 'Electronics & Semiconductor Cleanrooms (1.30×)', value: 'electronics', multiplier: 1.3 },
      ],
      description: 'Sector categorization dictates applicable National Emission Standards for Hazardous Air Pollutants (NESHAP) and effluent guidelines.',
    },
    {
      id: 'airEmissionsTier',
      label: 'Clean Air Act (CAA) Source Classification',
      type: 'select',
      defaultValue: 'minor',
      options: [
        { label: 'Area / Minor Source (Emissions under 10/25 tpy HAP threshold)', value: 'minor', multiplier: 0.8 },
        { label: 'Synthetic Minor / FESOP (Federally Enforceable State Operating Permit)', value: 'synthetic_minor', multiplier: 1.25 },
        { label: 'Title V Major Source (>100 tpy criteria pollutant or 10/25 tpy HAPs)', value: 'title_v', multiplier: 2.1 },
      ],
      description: 'Title V major sources require annual emission inventories, stack testing, and Title V compliance certifications.',
    },
    {
      id: 'waterDischarge',
      label: 'Clean Water Act (CWA) Discharge Pathway',
      type: 'select',
      defaultValue: 'potw',
      options: [
        { label: 'Industrial Stormwater Only (NPDES Multi-Sector General Permit MSGP)', value: 'stormwater_only', multiplier: 0.7 },
        { label: 'Indirect Discharge to Municipal Sewer (POTW Pretreatment Permit)', value: 'potw', multiplier: 1.0 },
        { label: 'Direct Surface Water Discharge (Individual NPDES Permit)', value: 'direct_npdes', multiplier: 1.9 },
      ],
      description: 'Direct surface discharge requires continuous pH/TSS monitoring and frequent toxic organic sampling.',
    },
    {
      id: 'hazardousWaste',
      label: 'RCRA Hazardous Waste Generator Status',
      type: 'select',
      defaultValue: 'sqg',
      options: [
        { label: 'VSQG: Very Small Quantity (<100 kg/month · <220 lbs)', value: 'vsqg', multiplier: 0.6 },
        { label: 'SQG: Small Quantity Generator (100 to 1,000 kg/month)', value: 'sqg', multiplier: 1.0 },
        { label: 'LQG: Large Quantity Generator (>1,000 kg/month · Biennial reporting)', value: 'lqg', multiplier: 1.75 },
      ],
      description: 'LQGs face stringent 90-day storage limits, full contingency plans, and certified employee RCRA training.',
    },
    {
      id: 'oilStorageSpcc',
      label: 'SPCC Oil Storage Capacity (Aboveground Bulk Tanks)',
      type: 'select',
      defaultValue: 'under_threshold',
      options: [
        { label: 'Under 1,320 Gallons Total Capacity (No SPCC Required)', value: 'under_threshold', multiplier: 1.0 },
        { label: '1,320 to 10,000 Gallons (Tier I/II Self-Certified SPCC Plan)', value: 'tier1_spcc', multiplier: 1.15 },
        { label: 'Exceeding 10,000 Gallons or Field-Constructed (PE-Stamped SPCC Plan)', value: 'pe_spcc', multiplier: 1.35 },
      ],
      description: 'Spill Prevention, Control, and Countermeasure 40 CFR 112 requirements.',
    },
    {
      id: 'facilityAcreage',
      label: 'Facility Footprint & Process Acreage',
      type: 'number',
      defaultValue: 12,
      min: 1,
      max: 200,
      step: 1,
      unit: 'acres',
      description: 'Drives stormwater outfall monitoring locations and Phase I/II environmental surveillance.',
    },
    {
      id: 'state',
      label: 'State Location / EPA Region',
      type: 'select',
      defaultValue: 'TX',
      options: STATE_SELECT_OPTIONS,
      description: 'State environmental agency permitting fees (e.g., TCEQ, CalEPA, Ohio EPA, NYSDEC).',
    },
  ],
  calculate: (values) => {
    const sectorMults: Record<string, number> = {
      machining: 1.0,
      plating: 1.45,
      chemical: 1.8,
      food: 1.2,
      paper: 1.35,
      electronics: 1.3,
    };
    const sectorMult = sectorMults[values.industrySector] || 1.0;

    const airMults: Record<string, number> = {
      minor: 0.8,
      synthetic_minor: 1.25,
      title_v: 2.1,
    };
    const airMult = airMults[values.airEmissionsTier] || 1.0;

    const waterMults: Record<string, number> = {
      stormwater_only: 0.7,
      potw: 1.0,
      direct_npdes: 1.9,
    };
    const waterMult = waterMults[values.waterDischarge] || 1.0;

    const rcraMults: Record<string, number> = {
      vsqg: 0.6,
      sqg: 1.0,
      lqg: 1.75,
    };
    const rcraMult = rcraMults[values.hazardousWaste] || 1.0;

    const spccMults: Record<string, number> = {
      under_threshold: 1.0,
      tier1_spcc: 1.15,
      pe_spcc: 1.35,
    };
    const spccMult = spccMults[values.oilStorageSpcc] || 1.0;

    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const acres = Number(values.facilityAcreage) || 12;

    // Component modeling
    // 1. Clean Air Act (Permit fees, annual stack test or emission inventory, monitoring)
    const airAnnual = Math.round(14000 * sectorMult * airMult);
    // 2. Clean Water Act (NPDES/POTW discharge fees, stormwater sampling, analytical lab test runs)
    const waterAnnual = Math.round((11000 + acres * 250) * waterMult * sectorMult);
    // 3. RCRA Hazardous Waste (Manifest tracking, waste profiling, certified lab disposal manifest, training)
    const rcraAnnual = Math.round(16000 * rcraMult * sectorMult);
    // 4. EPCRA Tier II, SPCC inspection, Toxic Release Inventory (TRI Form R)
    const epcraSpccAnnual = Math.round(7500 * spccMult * (values.airEmissionsTier === 'title_v' ? 1.4 : 1.0));

    const totalAnnual = Math.round(airAnnual + waterAnnual + rcraAnnual + epcraSpccAnnual);
    const low = Math.round(totalAnnual * 0.85);
    const high = Math.round(totalAnnual * 1.2);

    // Initial Capital / Engineering Upgrades (PE plan stamp, containment berm, scrubber tuning)
    const initialCapEx = Math.round(totalAnnual * 1.35);

    return {
      primaryLabel: 'Estimated Annual Ongoing EPA Compliance Budget',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: 'per year (recurring)',
      breakdown: [
        {
          label: 'Clean Air Act (CAA) Permitting & Emissions Testing',
          amount: airAnnual,
          description: `Operating permit fees, emission factor calculations, opacity logs, and required stack testing.`,
        },
        {
          label: 'Clean Water Act (CWA) & Stormwater Monitoring',
          amount: waterAnnual,
          description: `Pretreatment municipal sewer fees, quarterly stormwater outfall runoff lab analytical testing.`,
        },
        {
          label: 'RCRA Hazardous Waste Management & Profiling',
          amount: rcraAnnual,
          description: `Waste stream characterization, EPA ID renewals, hazardous manifest fees, and certified employee training.`,
        },
        {
          label: 'EPCRA Tier II, TRI Form R & SPCC Plan Maintenance',
          amount: epcraSpccAnnual,
          description: `Chemical inventory reporting to SERC/LEPC, annual TRI toxic release reports, and containment audits.`,
        },
      ],
      keyDrivers: [
        `CAA Source Level: ${values.airEmissionsTier === 'title_v' ? 'Title V Major Source (2.1× air cost multiplier)' : 'Minor Source Standard'}.`,
        `RCRA Waste Status: ${values.hazardousWaste.toUpperCase()} tier (${rcraMult}× waste management load).`,
        `Water Discharge Pathway: ${values.waterDischarge === 'direct_npdes' ? 'Direct NPDES Surface Discharge (1.9× monitoring overhead)' : 'POTW Pretreatment / Stormwater'}.`,
        `Initial Engineering & PE Capital Reserve: ~$${initialCapEx.toLocaleString()} for secondary containment and baseline certification.`,
      ],
      costReductionTips: [
        'Evaluate raw material substitution to stay beneath the 10/25-ton HAP threshold, avoiding costly Title V Major Source requirements.',
        'Implement waste segregation to prevent mixing non-hazardous washwater with solvent streams, reducing total RCRA hazardous tonnage.',
        'Adopt automated stormwater composite samplers to reduce consulting technician field hours during rain events.',
      ],
      benchmarks: [
        { label: 'Est. Monthly Budget', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
        { label: 'One-Time Setup Reserve', value: `$${initialCapEx.toLocaleString()}` },
        { label: 'EPA Regional Office', value: stateObj.epaRegion },
      ],
    };
  },
  explainer: {
    title: 'How EPA Industrial Compliance Budgets Are Calculated',
    paragraphs: [
      'Industrial environmental compliance is governed by four foundational federal statutory frameworks enforced in partnership with delegated state environmental protection departments: the Clean Air Act (CAA), the Clean Water Act (CWA), the Resource Conservation and Recovery Act (RCRA), and the Emergency Planning and Community Right-to-Know Act (EPCRA).',
      'The largest recurring variance occurs under the Clean Air Act. Facilities classified as "Title V Major Sources"—those emitting more than 100 tons per year of criteria pollutants (such as VOCs, NOx, or PM10) or 10 tons per year of any single Hazardous Air Pollutant (HAP)—face stringent compliance certification burdens. Major sources must submit semi-annual monitoring reports, conduct certified source testing (stack testing costing $15,000 to $40,000 per stack), and pay annual per-ton emissions fees.',
      'Under the Clean Water Act, operations discharging industrial process wastewater directly into waterways face individual NPDES permits requiring monthly certified lab sampling for heavy metals, BOD, and suspended solids. Even facilities discharging to local municipal sewers (POTWs) must maintain industrial pretreatment permits and install continuous pH neutralization and grease/oil interceptors.',
      'For hazardous waste under RCRA, generator status dictates inspection intervals and personnel training frequency. Large Quantity Generators (generating over 1,000 kg/month) must prepare extensive biennial reports, file e-manifests, maintain rigid 90-day drum accumulation areas, and conduct documented annual hazardous waste employee training under 40 CFR 265.16.',
    ],
    factors: [
      {
        name: 'Clean Air Act Classification (Title V vs. Synthetic Minor)',
        impact: 'High ($25,000 to $60,000 difference)',
        detail: 'Title V permits require extensive stack testing, continuous compliance certification, and costly permit engineering.',
      },
      {
        name: 'RCRA Generator Status (VSQG vs. LQG)',
        impact: 'High ($12,000 to $35,000/year)',
        detail: 'LQGs require biennial reporting, full written contingency plans, and certified recurring hazardous materials training.',
      },
      {
        name: 'Wastewater Pretreatment & Direct Discharge',
        impact: 'Moderate (15-30% of total)',
        detail: 'Pretreatment surcharges by local municipal authorities depend on biochemical oxygen demand (BOD) and total suspended solids (TSS).',
      },
      {
        name: 'SPCC Oil Storage Contingency Plans',
        impact: 'Moderate ($4,000 to $12,000)',
        detail: 'Facilities with >1,320 gallons of bulk oils or fuel require a written SPCC plan; >10,000 gallons requires a licensed Professional Engineer (PE) stamp.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing facilities typically budget between $35,000 and $115,000 annually for environmental permitting, analytical lab testing, and EHS compliance management.',
  },
  faqs: [
    {
      question: 'What is the difference between a Title V Major Source and a Synthetic Minor?',
      answer:
        'A Title V Major Source has the potential to emit pollutants above federal thresholds (e.g., 100 tons/yr criteria pollutants or 10/25 tons/yr HAPs). A Synthetic Minor facility takes legally enforceable operational limits (such as capping operating hours or installing thermal oxidizers) to keep actual emissions below major source levels, avoiding Title V permitting.',
    },
    {
      question: 'Does every manufacturing plant need an SPCC plan?',
      answer:
        'No. An SPCC (Spill Prevention, Control, and Countermeasure) plan is only mandatory if your facility has aggregate aboveground oil storage capacity exceeding 1,320 US gallons (including drums, lube oil totes, hydraulic tanks, and transformers) and a reasonable expectation of a discharge reaching navigable waters.',
    },
    {
      question: 'What is EPCRA Tier II reporting and who must submit it?',
      answer:
        'Under EPCRA Section 312, any facility storing hazardous chemicals in quantities equal to or exceeding 10,000 pounds (or as low as 500 pounds for Extremely Hazardous Substances like sulfuric acid or ammonia) must submit an annual Tier II inventory report to state and local emergency responders by March 1st.',
    },
    {
      question: 'Can chemical substitution help avoid costly EPA regulations?',
      answer:
        'Yes. Substituting solvent-based paints with waterborne coatings or eliminating halogenated degreasers can drop a facility from a Title V major source to a minor source and reclassify waste generation from LQG down to VSQG, saving tens of thousands annually in testing and paperwork.',
    },
  ],
  relatedCalculatorIds: [
    'osha-fine-calculator',
    'manufacturing-plant-insurance-calculator',
    'iso-14001-certification-cost-calculator',
  ],
};
