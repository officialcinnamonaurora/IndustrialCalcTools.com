import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const industrialPropertyInsuranceCalc: CalculatorDefinition = {
  id: 'industrial-property-insurance-calculator',
  slug: 'industrial-property-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/industrial-property-insurance-calculator',
  name: 'Industrial Property Insurance Calculator',
  metaTitle: 'Industrial Property Insurance Calculator – Commercial Building Rates',
  metaDescription:
    'Calculate industrial property insurance costs. Model real property building shells, machinery contents (BPP), ISO COPE construction classes, and business interruption.',
  shortDescription:
    'Estimate commercial building and contents insurance premiums based on Total Insured Value (TIV), ISO construction classes, fire sprinkler density, and geographic risk.',
  targetAudience:
    'Industrial building owners, plant executives, risk directors, and commercial real estate developers budgeting comprehensive property coverage.',
  featured: true,
  featuredBadge: 'Property Core',
  iconName: 'Building2',
  fields: [
    {
      id: 'state',
      label: 'Facility State Location',
      type: 'select',
      defaultValue: 'OH',
      options: STATE_SELECT_OPTIONS,
      description: 'State litigation environment, regional catastrophe risk (wind, hail, seismic), and building code standards.',
    },
    {
      id: 'buildingReplacementValue',
      label: 'Building Structure Replacement Cost (Real Property)',
      type: 'number',
      defaultValue: 7500000,
      min: 250000,
      max: 150000000,
      step: 100000,
      unit: '$ USD',
      description: 'Estimated cost to rebuild the physical industrial plant structure from the foundation up.',
    },
    {
      id: 'bppContentsValue',
      label: 'Machinery, Inventory & Business Personal Property (BPP)',
      type: 'number',
      defaultValue: 4500000,
      min: 100000,
      max: 100000000,
      step: 50000,
      unit: '$ USD',
      description: 'Replacement value of capital equipment, raw stock, work-in-progress, and finished goods.',
    },
    {
      id: 'constructionClass',
      label: 'ISO Building Construction Classification',
      type: 'select',
      defaultValue: 'iso_3_noncombustible',
      options: [
        { label: 'ISO Class 1: Frame / Wood Construction (Highest fire load · 1.65×)', value: 'iso_1_frame', multiplier: 1.65 },
        { label: 'ISO Class 2: Joisted Masonry (Brick exterior, wood roof/floors · 1.25×)', value: 'iso_2_joisted', multiplier: 1.25 },
        { label: 'ISO Class 3: Non-Combustible (Steel frame, metal siding/roof · 1.00×)', value: 'iso_3_noncombustible', multiplier: 1.0 },
        { label: 'ISO Class 4: Masonry Non-Combustible (Concrete tilt-up/block · 0.88×)', value: 'iso_4_masonry', multiplier: 0.88 },
        { label: 'ISO Class 5/6: Modified Fire Resistive / Reinforced Concrete (0.75×)', value: 'iso_5_fire_resistive', multiplier: 0.75 },
      ],
      description: 'ISO COPE Construction rating establishes combustible structural vulnerability.',
    },
    {
      id: 'sprinklerProtection',
      label: 'Fire Sprinkler & Suppression Standard',
      type: 'select',
      defaultValue: 'esfr_sprinkler',
      options: [
        { label: 'ESFR High-Density Sprinklers + 24/7 Central Alarm Monitoring (0.80×)', value: 'esfr_sprinkler', multiplier: 0.8 },
        { label: 'Standard Wet-Pipe Automatic Sprinkler System (1.00× standard)', value: 'standard_wet', multiplier: 1.0 },
        { label: 'Dry Pipe System / Partial Coverage Standpipes (1.25×)', value: 'dry_pipe', multiplier: 1.25 },
        { label: 'Unsprinklered Facility / Manual Fire Extinguishers Only (1.70×)', value: 'none', multiplier: 1.7 },
      ],
      description: 'Early Suppression Fast Response (ESFR) systems yield maximum property underwriting credits.',
    },
    {
      id: 'propertyDeductible',
      label: 'All-Other-Peril (AOP) Property Deductible',
      type: 'select',
      defaultValue: '10000',
      options: [
        { label: '$5,000 Deductible (1.08× premium load)', value: '5000', multiplier: 1.08 },
        { label: '$10,000 Deductible (1.00× standard baseline)', value: '10000', multiplier: 1.0 },
        { label: '$25,000 Deductible (0.90× retention discount)', value: '25000', multiplier: 0.9 },
        { label: '$50,000 Deductible (0.80× retention discount)', value: '50000', multiplier: 0.8 },
        { label: '$100,000 Deductible (0.72× self-insured enterprise tier)', value: '100000', multiplier: 0.72 },
      ],
      description: 'Higher deductibles transfer minor roof and water damage claims to corporate cash flow.',
    },
  ],
  calculate: (values) => {
    const buildingVal = Number(values.buildingReplacementValue) || 7500000;
    const contentsVal = Number(values.bppContentsValue) || 4500000;
    const totalInsuredValue = buildingVal + contentsVal;

    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const stateMult = stateObj.insuranceRiskMult;

    const constrMults: Record<string, number> = {
      iso_1_frame: 1.65,
      iso_2_joisted: 1.25,
      iso_3_noncombustible: 1.0,
      iso_4_masonry: 0.88,
      iso_5_fire_resistive: 0.75,
    };
    const constrMult = constrMults[values.constructionClass] || 1.0;

    const sprinklerMults: Record<string, number> = {
      esfr_sprinkler: 0.8,
      standard_wet: 1.0,
      dry_pipe: 1.25,
      none: 1.7,
    };
    const sprinklerMult = sprinklerMults[values.sprinklerProtection] || 0.8;

    const dedMults: Record<string, number> = {
      '5000': 1.08,
      '10000': 1.0,
      '25000': 0.9,
      '50000': 0.8,
      '100000': 0.72,
    };
    const dedMult = dedMults[values.propertyDeductible] || 1.0;

    // Commercial Property Baseline Rate: ~$0.24 per $100 of building value, ~$0.34 per $100 of contents
    const buildingRate = (0.24 / 100) * stateMult * constrMult * sprinklerMult * dedMult;
    const contentsRate = (0.34 / 100) * stateMult * constrMult * sprinklerMult * dedMult;

    const buildingPremium = Math.round(buildingVal * buildingRate);
    const contentsPremium = Math.round(contentsVal * contentsRate);

    // Business Income & Extra Expense Coverage (~20% of direct property premium)
    const businessIncomePremium = Math.round((buildingPremium + contentsPremium) * 0.22);

    const totalAnnual = buildingPremium + contentsPremium + businessIncomePremium;
    const ratePer100Tiv = Number(((totalAnnual / totalInsuredValue) * 100).toFixed(3));

    const low = Math.round(totalAnnual * 0.88);
    const high = Math.round(totalAnnual * 1.18);

    return {
      primaryLabel: `Total Annual Industrial Property Premium`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: `per year ($${(totalInsuredValue / 1e6).toFixed(1)}M Total Insured Value)`,
      breakdown: [
        {
          label: 'Real Property Building Shell Coverage',
          amount: buildingPremium,
          description: `Covers physical structure ($${(buildingVal / 1e6).toFixed(2)}M RCV) against fire, windstorm, and collapse.`,
        },
        {
          label: 'Business Personal Property (BPP) & Machinery',
          amount: contentsPremium,
          description: `Insures capital equipment, raw stock, tooling, and finished goods ($${(contentsVal / 1e6).toFixed(2)}M RCV).`,
        },
        {
          label: 'Business Income & Extra Expense (12-Month Restoration)',
          amount: businessIncomePremium,
          description: `Replaces continuing net profit and payroll during plant reconstruction.`,
        },
      ],
      keyDrivers: [
        `Total Insured Value (TIV): $${(totalInsuredValue / 1e6).toFixed(2)}M across real property and contents.`,
        `Effective Rate: $${ratePer100Tiv} per $100 of Total Insured Value.`,
        `Construction Class: ${values.constructionClass.toUpperCase().replace('_', ' ')} (${constrMult}× rating multiplier).`,
        `Sprinkler Credit: ${sprinklerMult < 1 ? `-${Math.round((1 - sprinklerMult) * 100)}% ESFR safety credit applied` : `+${Math.round((sprinklerMult - 1) * 100)}% surcharge`}.`,
      ],
      costReductionTips: [
        'Upgrade to ESFR high-density sprinkler heads to qualify for up to 20% ISO fire rate credits on property underwriting.',
        'Increase property deductible from $10,000 to $25,000 or $50,000 to save 10% to 20% on annual premiums.',
        'Obtain a certified third-party replacement cost appraisal to avoid coinsurance penalties without paying for over-insured book value.',
      ],
      benchmarks: [
        { label: 'Rate per $100 TIV', value: `$${ratePer100Tiv}` },
        { label: 'Monthly Equivalent', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
        { label: 'TIV Allocation', value: `${Math.round((buildingVal / totalInsuredValue) * 100)}% Building / ${Math.round((contentsVal / totalInsuredValue) * 100)}% Contents` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Property Insurance Premiums Are Calculated',
    paragraphs: [
      'Industrial property insurance is underwritten using the ISO COPE framework: Construction, Occupancy, Protection, and Exposure. Unlike standard commercial office leases, industrial facilities house dense concentrations of specialized machinery, combustible raw materials, high-voltage substations, and flammable chemical processes, requiring specialized Commercial Multi-Peril (CMP) underwriting.',
      'The foundational rating base is Total Insured Value (TIV), which combines Real Property (the building foundation, walls, and roof) with Business Personal Property (BPP), which includes manufacturing machinery, raw materials, WIP, and finished inventory. Property premiums are expressed as an annual rate per $100 of TIV. Standard industrial rates range from $0.18 to $0.45 per $100 of insured value.',
      'Construction classification directly influences structural fire resistance. ISO Class 1 (Frame) and Class 2 (Joisted Masonry with wooden roof trusses) carry heavy rate penalties because timber sustains fires. In contrast, ISO Class 3 (Non-combustible steel framing) and Class 4 (Masonry / Concrete Tilt-Up) enjoy preferred rates because the structure itself will not fuel fire spread.',
      'To prevent underinsurance, commercial property policies include a mandatory Coinsurance Clause (typically 80%, 90%, or 100%). If your facility is insured for less than the specified percentage of its true replacement cost at the time of a loss, the insurer applies a proportional coinsurance penalty to the claim payout. Maintaining accurate Replacement Cost Valuations (RCV) ensures full claim indemnification.',
    ],
    factors: [
      {
        name: 'ISO COPE Construction Rating Class',
        impact: 'High (Up to 50% premium variance)',
        detail: 'Concrete tilt-up and steel structures resist fire spread far better than wooden joisted masonry.',
      },
      {
        name: 'Fire Suppression & ESFR Sprinklers',
        impact: 'High (20% to 35% rate credit)',
        detail: 'High-density water delivery systems extinguish warehouse and plant fires at the fuel base.',
      },
      {
        name: 'Replacement Cost Value (RCV) vs. ACV',
        impact: 'High (Avoids depreciation deductions)',
        detail: 'RCV pays to replace damaged machinery brand new without deducting for physical depreciation.',
      },
      {
        name: 'Business Income & Extra Expense Limits',
        impact: 'Moderate (20-25% of total premium)',
        detail: 'Replaces net operating profits and standing payroll while sourcing replacement production equipment.',
      },
    ],
    industryBenchmarkNote:
      'Industrial manufacturing plants typically budget between $0.22 and $0.42 per $100 of Total Insured Value annually for combined real property, machinery contents, and business interruption coverage.',
  },
  faqs: [
    {
      question: 'What is the difference between Real Property and Business Personal Property (BPP)?',
      answer:
        'Real Property covers the physical building structure, foundation, permanently attached fixtures, HVAC chillers, and electrical service entrance panels. Business Personal Property (BPP) covers movable items: CNC machines, forklifts, computers, tooling, raw inventory, and finished stock.',
    },
    {
      question: 'How does the coinsurance clause work in a commercial property policy?',
      answer:
        'A coinsurance clause (typically 80% or 90%) requires you to insure your property for at least that percentage of its true replacement cost. If a plant with a true $10M replacement value is insured for only $6M (60%), and suffers a $1M fire loss, the insurer pays only 60/80 (75%) of the loss—leaving the owner with a $250,000 penalty.',
    },
    {
      question: 'Does industrial property insurance cover mechanical equipment breakdown?',
      answer:
        'No. Standard commercial property insurance covers ONLY external perils (fire, windstorm, hail, lightning, vandalism, vehicle impact). It explicitly excludes internal mechanical failures, motor burnout, and electrical arcing, which require Equipment Breakdown coverage.',
    },
    {
      question: 'What is an "Agreed Value" endorsement?',
      answer:
        'An Agreed Value endorsement suspends the coinsurance clause entirely for the policy period. You provide an updated Statement of Values (SOV) approved by the underwriter, ensuring that partial loss claims are paid in full up to policy limits without risk of coinsurance penalties.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'equipment-breakdown-insurance-calculator',
    'warehouse-insurance-calculator',
  ],
};

export const productLiabilityCalc: CalculatorDefinition = {
  id: 'product-liability-insurance-calculator-manufacturers',
  slug: 'product-liability-insurance-calculator-manufacturers',
  categoryId: 'insurance',
  path: '/insurance/product-liability-insurance-calculator-manufacturers',
  name: 'Product Liability Insurance Calculator for Manufacturers',
  metaTitle: 'Product Liability Insurance Calculator for Manufacturers',
  metaDescription:
    'Calculate product liability insurance costs for manufacturers. Model risk tiers, annual gross revenues, batch recall endorsements, and legal defense coverage.',
  shortDescription:
    'Calculate annual product liability and completed operations insurance premiums based on manufacturing hazard tier, annual revenue, and recall endorsements.',
  targetAudience:
    'Component fabricators, OEM finished goods manufacturers, chemical blenders, industrial machinery builders, and medical device suppliers.',
  featured: true,
  featuredBadge: 'Manufacturer Essential',
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'hazardTier',
      label: 'Manufacturing Sub-Sector & Product Hazard Class',
      type: 'select',
      defaultValue: 'moderate_machinery',
      options: [
        { label: 'Low Hazard: Non-critical hardware, packaging, textiles ($2.80 per $1k revenue)', value: 'low_hardware', ratePerK: 2.8 },
        { label: 'Moderate Hazard: Precision machining, industrial valves, food ($5.20 per $1k revenue)', value: 'moderate_machinery', ratePerK: 5.2 },
        { label: 'High Hazard: Industrial machinery, chemicals, power tools ($11.50 per $1k revenue)', value: 'high_chemicals', ratePerK: 11.5 },
        { label: 'Critical / Severe: Aerospace flight hardware, auto brake/steering ($24.00 per $1k revenue)', value: 'critical_aerospace', ratePerK: 24.0 },
      ],
      description: 'Underwriters evaluate the severity of potential bodily injury or property damage caused by product failure.',
    },
    {
      id: 'annualRevenue',
      label: 'Annual Gross Manufacturing Revenue',
      type: 'number',
      defaultValue: 6500000,
      min: 250000,
      max: 100000000,
      step: 100000,
      unit: '$ USD',
      description: 'Total annual gross sales of manufactured goods used as the rating exposure base.',
    },
    {
      id: 'aggregateLimit',
      label: 'Policy Occurrence / Aggregate Limit',
      type: 'select',
      defaultValue: 'limit_2m_4m',
      options: [
        { label: '$1,000,000 Occurrence / $2,000,000 Aggregate (Standard commercial baseline · 1.00×)', value: 'limit_1m_2m', multiplier: 1.0 },
        { label: '$2,000,000 Occurrence / $4,000,000 Aggregate (Preferred OEM supplier tier · 1.35×)', value: 'limit_2m_4m', multiplier: 1.35 },
        { label: '$5,000,000 Occurrence / $5,000,000 Aggregate (Tier 1 supply chain contract · 1.90×)', value: 'limit_5m_5m', multiplier: 1.9 },
      ],
      description: 'Higher limits are frequently mandated by master supply agreements with retail or automotive OEMs.',
    },
    {
      id: 'recallEndorsement',
      label: 'Product Recall Expense Endorsement',
      type: 'select',
      defaultValue: 'recall_250k',
      options: [
        { label: 'No Product Recall Coverage (Standard CGL completed operations only · $0)', value: 'none', fee: 0 },
        { label: '$100,000 Product Recall Expense Endorsement (+$1,450/year)', value: 'recall_100k', fee: 1450 },
        { label: '$250,000 Product Recall Expense Endorsement (+$2,850/year)', value: 'recall_250k', fee: 2850 },
        { label: '$1,000,000 Product Recall & Crisis Management Endorsement (+$7,500/year)', value: 'recall_1m', fee: 7500 },
      ],
      description: 'Standard product liability covers third-party bodily injury, but excludes the cost to pull defective batches from market.',
    },
    {
      id: 'retentionDeductible',
      label: 'Self-Insured Retention (SIR) / Deductible',
      type: 'select',
      defaultValue: '5000',
      options: [
        { label: '$2,500 Deductible (1.08× premium factor)', value: '2500', multiplier: 1.08 },
        { label: '$5,000 Deductible (Standard · 1.00× factor)', value: '5000', multiplier: 1.0 },
        { label: '$10,000 Deductible (0.92× factor)', value: '10000', multiplier: 0.92 },
        { label: '$25,000 Self-Insured Retention (SIR · 0.82× factor)', value: '25000', multiplier: 0.82 },
      ],
      description: 'Retention per claim before carrier indemnification takes effect.',
    },
  ],
  calculate: (values) => {
    const revenue = Number(values.annualRevenue) || 6500000;

    const rateMap: Record<string, number> = {
      low_hardware: 2.8,
      moderate_machinery: 5.2,
      high_chemicals: 11.5,
      critical_aerospace: 24.0,
    };
    const ratePerK = rateMap[values.hazardTier] || 5.2;

    const limitMults: Record<string, number> = {
      limit_1m_2m: 1.0,
      limit_2m_4m: 1.35,
      limit_5m_5m: 1.9,
    };
    const limitMult = limitMults[values.aggregateLimit] || 1.35;

    const dedMults: Record<string, number> = {
      '2500': 1.08,
      '5000': 1.0,
      '10000': 0.92,
      '25000': 0.82,
    };
    const dedMult = dedMults[values.retentionDeductible] || 1.0;

    const recallFees: Record<string, number> = {
      none: 0,
      recall_100k: 1450,
      recall_250k: 2850,
      recall_1m: 7500,
    };
    const recallFee = recallFees[values.recallEndorsement] || 0;

    // Base product liability premium = (Revenue / 1000) * ratePerK * limitMult * dedMult
    // Revenue volume discount for larger operations ($10M+)
    const volumeDiscount = revenue > 25000000 ? 0.78 : revenue > 10000000 ? 0.88 : 1.0;
    const basePremium = Math.round((revenue / 1000) * ratePerK * limitMult * dedMult * volumeDiscount);

    // Legal defense provision (defense outside limits endorsement ≈ 15% allocation)
    const defenseAllocation = Math.round(basePremium * 0.15);

    const totalAnnualPremium = basePremium + recallFee;
    const effectiveRatePerK = Number(((totalAnnualPremium / revenue) * 1000).toFixed(2));

    const low = Math.round(totalAnnualPremium * 0.88);
    const high = Math.round(totalAnnualPremium * 1.18);

    return {
      primaryLabel: `Total Annual Product Liability Premium`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnualPremium,
      frequencyLabel: `per year on $${(revenue / 1e6).toFixed(1)}M gross revenue`,
      breakdown: [
        {
          label: 'Products-Completed Operations Liability',
          amount: basePremium - defenseAllocation,
          description: `Protects against third-party bodily injury and property damage lawsuits caused by product failures.`,
        },
        {
          label: 'Legal Defense Costs (Defense Outside Limits)',
          amount: defenseAllocation,
          description: `Attorneys' fees, expert metallurgical witness testimony, and trial litigation defense.`,
        },
        ...(recallFee > 0
          ? [
              {
                label: 'Product Recall Expense & Crisis Management',
                amount: recallFee,
                description: `Covers customer notification, warehouse return shipping, disposal, and testing of defective batches.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Hazard Tier: ${values.hazardTier.toUpperCase().replace('_', ' ')} ($${ratePerK}/$1k revenue).`,
        `Effective Rate: $${effectiveRatePerK} per $1,000 of gross manufacturing sales.`,
        `Policy Limit: ${values.aggregateLimit.replace('limit_', '').replace('_', ' / ').toUpperCase()} limit.`,
        `Strict Liability Standard: In US courts, manufacturers are strictly liable for product design, manufacturing, and labeling defects.`,
      ],
      costReductionTips: [
        'Maintain strict Quality Management System (ISO 9001/AS9100) records to earn up to 20% underwriter risk credits.',
        'Ensure supplier contracts include mutual indemnification and vendor hold-harmless clauses with certificate of insurance verification.',
        'Review product warning labels and user operation manuals with qualified product safety legal counsel annually.',
      ],
      benchmarks: [
        { label: 'Rate / $1k Sales', value: `$${effectiveRatePerK}` },
        { label: 'Revenue Base', value: `$${(revenue / 1e6).toFixed(1)}M` },
        { label: 'Policy Form', value: 'Occurrence / CGL' },
      ],
    };
  },
  explainer: {
    title: 'How Product Liability Insurance for Manufacturers Is Calculated',
    paragraphs: [
      'Under United States tort law, manufacturers and component fabricators face Strict Product Liability. This legal doctrine means that if a manufactured part or finished assembly causes personal injury or property damage due to a defect, the manufacturer is legally liable regardless of whether the company acted with negligence or exercised all possible care.',
      'Product liability insurance is rated primarily on Gross Annual Manufacturing Revenue and Product Hazard Classification. Underwriters categorize products into risk tiers: low-risk consumer hardware (fasteners, non-structural brackets) carries rates of $2.50 to $3.50 per $1,000 of revenue. In contrast, flight-critical aerospace components, medical implants, automotive braking parts, or volatile chemical formulations command rates of $15.00 to $25.00+ per $1,000 of sales.',
      'A crucial distinction must be made between standard Products-Completed Operations coverage and Product Recall Insurance. Standard Commercial General Liability (CGL) pays for damages your defective product causes to a third party (such as a factory fire caused by a failed hydraulic valve). However, standard CGL strictly excludes the cost to recall, ship, test, and destroy the remaining 5,000 defective valves sitting in customer warehouses. Manufacturers require a dedicated Product Recall Expense Endorsement to cover these logistics expenses.',
      'Legal defense provisions represent another vital cost factor. Because product liability lawsuits frequently involve complex metallurgical engineering failure analysis and protracted jury trials, legal defense costs can easily exceed $500,000 before a settlement is ever reached. Manufacturers should ensure their policy provides "Defense Outside the Limits," meaning legal fees do not erode the available policy aggregate limits.',
    ],
    factors: [
      {
        name: 'Product Hazard Classification Tier',
        impact: 'High (4× to 8× rate multiplier)',
        detail: 'Aerospace, automotive, and medical goods face exponentially higher jury awards than commercial hardware.',
      },
      {
        name: 'Product Recall Expense Endorsements',
        impact: 'Moderate (Adds $1,500 to $7,500)',
        detail: 'Covers physical recovery, warehouse holding, disposal, and customer communications during a recall.',
      },
      {
        name: 'Defense Outside the Limits Rider',
        impact: 'Moderate (Preserves policy indemnity limit)',
        detail: 'Ensures expensive engineering defense attorneys do not drain the cash available for settlements.',
      },
      {
        name: 'Quality Management (ISO 9001 / AS9100)',
        impact: 'Moderate (15-20% underwriting discount)',
        detail: 'Documented inspection logs prove quality diligence and lower underwriter loss expectations.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized precision manufacturers typically budget between 0.45% and 1.25% of gross annual revenue for comprehensive product liability and completed operations insurance.',
  },
  faqs: [
    {
      question: 'What are the three main types of product defects recognized by courts?',
      answer:
        'Courts recognize three defect categories: 1) Manufacturing Defects (errors made during fabrication that deviate from the design), 2) Design Defects (inherent flaws in the blueprint that make the product unreasonably dangerous), and 3) Marketing Defects / Failure to Warn (inadequate warning labels or operating instructions).',
    },
    {
      question: 'Does standard Commercial General Liability (CGL) include Product Liability?',
      answer:
        'Yes. Standard CGL forms include "Products-Completed Operations Hazard" coverage. However, standard policy limits ($1M occurrence) are often insufficient for high-hazard goods, and standard policies explicitly exclude product recall costs and failure-to-perform contractual guarantees.',
    },
    {
      question: 'What is the difference between an Occurrence and Claims-Made policy form?',
      answer:
        'An Occurrence policy covers claims resulting from injury that occurred during the policy period, regardless of when the lawsuit is filed years later. A Claims-Made policy pays only if both the injury AND the formal lawsuit filing occur while the policy (or retroactive date) is active.',
    },
    {
      question: 'Can component manufacturers be sued if the finished product assembler created the flaw?',
      answer:
        'Yes. Plaintiffs’ attorneys routinely name every company in the supply chain in a lawsuit—from the raw material mill to the CNC machinist to the final distributor. Even if your component conformed 100% to customer blueprints, you will incur hundreds of thousands in legal fees to defend and dismiss the case.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'industrial-umbrella-insurance-calculator',
    'equipment-breakdown-insurance-calculator',
  ],
};

export const equipmentBreakdownCalc: CalculatorDefinition = {
  id: 'equipment-breakdown-insurance-calculator',
  slug: 'equipment-breakdown-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/equipment-breakdown-insurance-calculator',
  name: 'Equipment Breakdown Insurance Calculator',
  metaTitle: 'Equipment Breakdown Insurance Calculator – Boiler & Machinery Rates',
  metaDescription:
    'Calculate equipment breakdown insurance costs for manufacturing plants. Estimate premiums for CNC machines, transformers, chillers, and business interruption downtime.',
  shortDescription:
    'Estimate equipment breakdown insurance premiums (Boiler & Machinery) covering electrical arcing, mechanical motor burnout, and business interruption losses.',
  targetAudience:
    'Plant maintenance supervisors, manufacturing CFOs, facility operations directors, and data center engineers insuring high-value capital machinery.',
  featured: false,
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'industrySector',
      label: 'Manufacturing & Processing Industry Sector',
      type: 'select',
      defaultValue: 'machining_metal',
      options: [
        { label: 'Precision Machining & Fabrication (CNCs, presses, laser cutters · 1.00×)', value: 'machining_metal', multiplier: 1.0 },
        { label: 'Food, Dairy & Beverage Processing (Ammonia chillers, pasteurizers · 1.35×)', value: 'food_beverage', multiplier: 1.35 },
        { label: 'Plastics Molding & Chemical Extrusion (Hydraulics, thermal oil · 1.25×)', value: 'plastics_chemical', multiplier: 1.25 },
        { label: 'Commercial Printing & Corrugated Packaging (High-speed web presses · 1.15×)', value: 'printing_packaging', multiplier: 1.15 },
        { label: 'Cleanroom Semiconductor & Electronics (Chillers, UPS, vacuum · 1.30×)', value: 'electronics_cleanroom', multiplier: 1.3 },
      ],
      description: 'Sector processes dictate mechanical stress, electrical harmonic loads, and refrigeration hazards.',
    },
    {
      id: 'machineryReplacementValue',
      label: 'Total Insured Machinery Replacement Value',
      type: 'number',
      defaultValue: 4500000,
      min: 100000,
      max: 100000000,
      step: 100000,
      unit: '$ USD',
      description: 'Total replacement cost of all production equipment, chillers, boilers, transformers, and compressors.',
    },
    {
      id: 'downtimeVulnerability',
      label: 'Single-Point-of-Failure & Spare Parts Lead Time',
      type: 'select',
      defaultValue: 'moderate_lead_time',
      options: [
        { label: 'Low: Redundant N+1 backup machines & domestic spare parts (0.80× business income)', value: 'low_lead_time', multiplier: 0.8 },
        { label: 'Moderate: Critical production machinery with 4 to 8-week repair lead time (1.00×)', value: 'moderate_lead_time', multiplier: 1.0 },
        { label: 'Severe: Custom foreign machinery with 4 to 6-month overseas replacement delays (1.45×)', value: 'severe_lead_time', multiplier: 1.45 },
      ],
      description: 'Extended restoration periods significantly inflate Business Income and Extra Expense exposures.',
    },
    {
      id: 'spoilageOption',
      label: 'Spoilage & Refrigeration Contamination Rider',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'No Spoilage Exposure (Dry manufacturing / Non-perishable · $0)', value: 'none', fee: 0 },
        { label: '$100,000 Spoilage & Ammonia Contamination Coverage (+$850/year)', value: 'spoilage_100k', fee: 850 },
        { label: '$250,000 Spoilage & Ammonia Contamination Coverage (+$1,650/year)', value: 'spoilage_250k', fee: 1650 },
        { label: '$500,000 Spoilage & Temperature Change Coverage (+$3,100/year)', value: 'spoilage_500k', fee: 3100 },
      ],
      description: 'Critical for food, beverage, and pharmaceutical facilities vulnerable to cooling failures.',
    },
    {
      id: 'deductible',
      label: 'Breakdown Direct Damage Deductible',
      type: 'select',
      defaultValue: '5000',
      options: [
        { label: '$2,500 Deductible (1.10× premium factor)', value: '2500', multiplier: 1.1 },
        { label: '$5,000 Deductible (Standard industrial · 1.00× factor)', value: '5000', multiplier: 1.0 },
        { label: '$10,000 Deductible (0.90× factor)', value: '10000', multiplier: 0.9 },
        { label: '$25,000 Deductible (0.78× factor)', value: '25000', multiplier: 0.78 },
      ],
      description: 'Direct repair retention per mechanical failure or electrical surge incident.',
    },
  ],
  calculate: (values) => {
    const machineryVal = Number(values.machineryReplacementValue) || 4500000;

    const sectorMults: Record<string, number> = {
      machining_metal: 1.0,
      food_beverage: 1.35,
      plastics_chemical: 1.25,
      printing_packaging: 1.15,
      electronics_cleanroom: 1.3,
    };
    const sectorMult = sectorMults[values.industrySector] || 1.0;

    const leadMults: Record<string, number> = {
      low_lead_time: 0.8,
      moderate_lead_time: 1.0,
      severe_lead_time: 1.45,
    };
    const leadMult = leadMults[values.downtimeVulnerability] || 1.0;

    const dedMults: Record<string, number> = {
      '2500': 1.1,
      '5000': 1.0,
      '10000': 0.9,
      '25000': 0.78,
    };
    const dedMult = dedMults[values.deductible] || 1.0;

    const spoilageFees: Record<string, number> = {
      none: 0,
      spoilage_100k: 850,
      spoilage_250k: 1650,
      spoilage_500k: 3100,
    };
    const spoilageFee = spoilageFees[values.spoilageOption] || 0;

    // Baseline Equipment Breakdown Rate: approx $0.18 to $0.26 per $100 of machinery value
    const baseBreakdownRate = (0.21 / 100) * sectorMult * dedMult;
    const directDamagePremium = Math.round(machineryVal * baseBreakdownRate);

    // Business Income and Extra Expense (emergency motor rewinding, chartering air freight for spare parts)
    const businessIncomePremium = Math.round(directDamagePremium * 0.45 * leadMult);

    const totalAnnual = directDamagePremium + businessIncomePremium + spoilageFee;
    const ratePer100 = Number(((totalAnnual / machineryVal) * 100).toFixed(3));

    const low = Math.round(totalAnnual * 0.88);
    const high = Math.round(totalAnnual * 1.18);

    return {
      primaryLabel: `Total Annual Equipment Breakdown Premium`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: `per year on $${(machineryVal / 1e6).toFixed(1)}M capital equipment`,
      breakdown: [
        {
          label: 'Direct Machinery Repair & Component Replacement',
          amount: directDamagePremium,
          description: `Covers electrical arcing, motor burnout, hydraulic cylinder explosion, and gearbox failure.`,
        },
        {
          label: 'Business Income & Expediting Repair Expenses',
          amount: businessIncomePremium,
          description: `Replaces lost net profit and pays overtime labor and air freight to source rush replacement parts.`,
        },
        ...(spoilageFee > 0
          ? [
              {
                label: 'Spoilage & Temperature Contamination Rider',
                amount: spoilageFee,
                description: `Protects perishable food, pharmaceutical, and chemical stock damaged during chilling loss.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Machinery Insured Value: $${(machineryVal / 1e6).toFixed(2)}M replacement basis.`,
        `Effective Rate: $${ratePer100} per $100 of equipment value.`,
        `Downtime Vulnerability: ${values.downtimeVulnerability.toUpperCase().replace('_', ' ')} (${leadMult}× business income factor).`,
        `Peril Distinction: Covers internal forces (short circuits, mechanical breakdown) excluded by standard fire policies.`,
      ],
      costReductionTips: [
        'Implement annual infrared thermographic scanning on main switchboards and motor control centers to detect loose electrical connections.',
        'Establish dual-sourced vendor arrangements for mission-critical custom components to cut restoration lead times in half.',
        'Raise the deductible from $5,000 to $10,000 or $25,000 to save 10% to 22% on annual breakdown premiums.',
      ],
      benchmarks: [
        { label: 'Rate / $100 Value', value: `$${ratePer100}` },
        { label: 'Monthly Equivalent', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
        { label: 'Equipment Class', value: values.industrySector.replace('_', ' ') },
      ],
    };
  },
  explainer: {
    title: 'How Equipment Breakdown (Boiler & Machinery) Insurance Is Calculated',
    paragraphs: [
      'Industrial machinery is the revenue engine of any manufacturing or processing facility. However, standard Commercial Property insurance policies contain explicit exclusions for damage caused by internal forces—including mechanical breakdown, centrifugal force rupture, electrical arcing, power surges, and steam boiler cracking.',
      'Equipment Breakdown coverage (historically called Boiler & Machinery or B&M insurance) fills this critical coverage void. While property insurance pays if a fire burns down your CNC mill, Equipment Breakdown pays if an internal power surge fries the CNC drive motherboard, if a spindle bearing seizes at 15,000 RPM, or if an air compressor motor burns out.',
      'Underwriting pricing is driven by machinery replacement cost, process operating conditions, and business interruption exposure. The greatest financial risk in equipment breakdown is rarely the physical repair part itself; it is the Business Interruption caused while waiting for specialized parts. If a plant relies on a custom German or Japanese 5-axis machining center with a 16-week delivery time for a replacement casting, lost operating profits can easily exceed $500,000.',
      'To address downtime, equipment breakdown policies include an Expediting Expenses provision. This pays for temporary rental equipment (such as trailer-mounted emergency chillers or air compressors), technician overtime labor, and priority air-freight transport to rush critical replacement parts from overseas factories.',
    ],
    factors: [
      {
        name: 'Single-Point-of-Failure & Spare Parts Lead Time',
        impact: 'High (30-45% business income variance)',
        detail: 'Facilities lacking backup redundancy face catastrophic prolonged downtime while waiting for foreign parts.',
      },
      {
        name: 'Process Hazard & Thermal Demands',
        impact: 'Moderate (20-35% rate difference)',
        detail: 'Continuous ammonia refrigeration and chemical reactors face higher thermal breakdown stress than dry machine shops.',
      },
      {
        name: 'Spoilage & Contamination Endorsements',
        impact: 'Moderate ($850 to $3,500/year)',
        detail: 'Mandatory for food, beverage, and dairy processors to protect raw stock during chiller outages.',
      },
      {
        name: 'Infrared Thermography Maintenance Logs',
        impact: 'Moderate (10-15% underwriting credit)',
        detail: 'Annual electrical thermal imaging proves loose breaker connections are caught before catastrophic arcing.',
      },
    ],
    industryBenchmarkNote:
      'Manufacturing facilities typically spend between $0.16 and $0.32 per $100 of machinery replacement value annually for comprehensive Equipment Breakdown and Business Interruption insurance.',
  },
  faqs: [
    {
      question: 'Why doesn’t our standard commercial property insurance cover motor burnout?',
      answer:
        'Standard commercial property policies are designed to cover external perils like fire, wind, hail, and vandalism. They contain a specific "mechanical breakdown and electrical injury exclusion" because internal wear-and-tear and electrical arcing are considered operating risks that require specialized Boiler & Machinery underwriting.',
    },
    {
      question: 'Does Equipment Breakdown insurance cover power surges from the electric utility?',
      answer:
        'Yes. Utility power surges caused by grid switching, lightning strikes on nearby transmission lines, or transformer blowouts that send voltage spikes into your facility electrical panels are covered under Equipment Breakdown, including replacing damaged electronic controllers.',
    },
    {
      question: 'What is an "Expediting Expense" provision?',
      answer:
        'Expediting expense coverage pays for reasonable extra costs to rush equipment repairs. This includes paying technicians double-time overtime, chartering specialized air freight for emergency parts, and temporary equipment rental to get the plant operational as fast as possible.',
    },
    {
      question: 'How do underwriters evaluate business interruption for equipment breakdown?',
      answer:
        'Underwriters assess whether your facility has N+1 redundancy (such as two 50% capacity boilers instead of one single boiler) and evaluate the global availability of critical replacement parts (such as whether spare spindles or motor windings are stocked domestically).',
    },
  ],
  relatedCalculatorIds: [
    'industrial-property-insurance-calculator',
    'boiler-insurance-calculator',
    'machinery-depreciation-hourly-rate-calculator',
  ],
};

export const industrialUmbrellaCalc: CalculatorDefinition = {
  id: 'industrial-umbrella-insurance-calculator',
  slug: 'industrial-umbrella-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/industrial-umbrella-insurance-calculator',
  name: 'Industrial Umbrella Insurance Calculator',
  metaTitle: 'Industrial Umbrella Insurance Calculator – Commercial Excess Limits',
  metaDescription:
    'Calculate commercial umbrella and excess liability insurance costs for industrial facilities. Estimate premiums for $1M to $50M+ excess policy limits.',
  shortDescription:
    'Estimate commercial umbrella and excess liability insurance premiums across $1M to $25M+ policy limits to protect against nuclear tort verdicts.',
  targetAudience:
    'Corporate risk managers, CFOs, industrial contractors, fleet operators, and manufacturing executives securing high-limit liability buffers.',
  featured: false,
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'excessLimit',
      label: 'Desired Commercial Umbrella / Excess Liability Limit',
      type: 'select',
      defaultValue: 'limit_5m',
      options: [
        { label: '$1,000,000 Excess Umbrella Limit ($1,850 baseline)', value: 'limit_1m', baseCost: 1850 },
        { label: '$2,000,000 Excess Umbrella Limit ($3,100 baseline)', value: 'limit_2m', baseCost: 3100 },
        { label: '$5,000,000 Excess Umbrella Limit ($6,500 baseline)', value: 'limit_5m', baseCost: 6500 },
        { label: '$10,000,000 Excess Umbrella Limit ($11,800 baseline)', value: 'limit_10m', baseCost: 11800 },
        { label: '$25,000,000 Excess Umbrella Limit ($24,500 baseline)', value: 'limit_25m', baseCost: 24500 },
      ],
      description: 'Provides secondary layer of catastrophic protection once underlying policy limits are fully exhausted.',
    },
    {
      id: 'industryRiskTier',
      label: 'Operational Hazard Class & Industrial Severity',
      type: 'select',
      defaultValue: 'moderate_fabrication',
      options: [
        { label: 'Low Risk: Light electronic assembly, dry warehousing, packaging (0.80×)', value: 'low_assembly', multiplier: 0.8 },
        { label: 'Moderate Risk: Machine shops, precision metal fabrication, plastics (1.00×)', value: 'moderate_fabrication', multiplier: 1.0 },
        { label: 'High Risk: Heavy structural steel, industrial machinery, chemicals (1.45×)', value: 'high_chemicals', multiplier: 1.45 },
        { label: 'Critical Risk: High-hazard chemicals, explosive dust, structural erection (2.10×)', value: 'critical_hazard', multiplier: 2.1 },
      ],
      description: 'Underwriters price excess liability based on catastrophic third-party injury and property damage exposure.',
    },
    {
      id: 'commercialAutoVehicles',
      label: 'Commercial Fleet Size (Vans, Box Trucks, Semi-Tractors)',
      type: 'select',
      defaultValue: 'fleet_1_5',
      options: [
        { label: 'No Commercial Fleet / Hired & Non-Owned Auto Only (0.85× factor)', value: 'no_fleet', multiplier: 0.85 },
        { label: '1 to 5 Commercial Vehicles / Delivery Trucks (1.00× standard factor)', value: 'fleet_1_5', multiplier: 1.0 },
        { label: '6 to 15 Commercial Vehicles (1.25× fleet factor)', value: 'fleet_6_15', multiplier: 1.25 },
        { label: '16 to 50 Commercial Vehicles / Heavy Haul Semis (1.65× heavy fleet)', value: 'fleet_16_50', multiplier: 1.65 },
      ],
      description: 'Commercial auto liability is the leading trigger of catastrophic multi-million dollar umbrella claims.',
    },
    {
      id: 'annualPayroll',
      label: 'Annual Plant Operating Payroll',
      type: 'number',
      defaultValue: 3500000,
      min: 250000,
      max: 50000000,
      step: 100000,
      unit: '$ USD',
      description: 'Drives Employer’s Liability (Workers’ Comp Part B) excess exposure.',
    },
    {
      id: 'contractualRequirement',
      label: 'Supply Chain & Master Service Agreement Mandate',
      type: 'select',
      defaultValue: 'standard_supplier',
      options: [
        { label: 'Standard Commercial Tier (Internal balance sheet protection)', value: 'standard_supplier', multiplier: 1.0 },
        { label: 'Contractually Mandated by Major Customer / OEM Vendor Agreement (1.15×)', value: 'oem_mandate', multiplier: 1.15 },
      ],
      description: 'Major automotive, aerospace, and energy contracts often mandate minimum $5M or $10M excess limits.',
    },
  ],
  calculate: (values) => {
    const limitCosts: Record<string, number> = {
      limit_1m: 1850,
      limit_2m: 3100,
      limit_5m: 6500,
      limit_10m: 11800,
      limit_25m: 24500,
    };
    const baseCost = limitCosts[values.excessLimit] || 6500;

    const riskMults: Record<string, number> = {
      low_assembly: 0.8,
      moderate_fabrication: 1.0,
      high_chemicals: 1.45,
      critical_hazard: 2.1,
    };
    const riskMult = riskMults[values.industryRiskTier] || 1.0;

    const fleetMults: Record<string, number> = {
      no_fleet: 0.85,
      fleet_1_5: 1.0,
      fleet_6_15: 1.25,
      fleet_16_50: 1.65,
    };
    const fleetMult = fleetMults[values.commercialAutoVehicles] || 1.0;

    const contractMult = values.contractualRequirement === 'oem_mandate' ? 1.15 : 1.0;

    const totalAnnual = Math.round(baseCost * riskMult * fleetMult * contractMult);

    const limitInMillionsMap: Record<string, number> = {
      limit_1m: 1,
      limit_2m: 2,
      limit_5m: 5,
      limit_10m: 10,
      limit_25m: 25,
    };
    const millions = limitInMillionsMap[values.excessLimit] || 5;
    const costPerMillion = Math.round(totalAnnual / millions);

    const low = Math.round(totalAnnual * 0.88);
    const high = Math.round(totalAnnual * 1.18);

    return {
      primaryLabel: `Total Annual Commercial Umbrella Premium`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: `$${millions} Million excess liability limit ($${costPerMillion.toLocaleString()}/million)`,
      breakdown: [
        {
          label: 'Excess Commercial General Liability Buffer',
          amount: Math.round(totalAnnual * 0.48),
          description: `Extends protection over $1M/$2M CGL for catastrophic third-party bodily injury and property damage.`,
        },
        {
          label: 'Excess Commercial Auto Fleet Liability Buffer',
          amount: Math.round(totalAnnual * 0.34),
          description: `Protects against multi-vehicle highway collisions and catastrophic pedestrian trucking verdicts.`,
        },
        {
          label: 'Excess Employer’s Liability (Workers’ Comp Part B)',
          amount: Math.round(totalAnnual * 0.18),
          description: `Covers dual-capacity lawsuits, third-party indemnification claims, and gross negligence tort actions.`,
        },
      ],
      keyDrivers: [
        `Excess Limit: $${millions},000,000 additional liability layer above underlying policies.`,
        `Average Cost per $1M Limit: ~$${costPerMillion.toLocaleString()} per million in coverage.`,
        `Fleet Impact: Commercial fleet accounts for ${(fleetMult * 100 - 100).toFixed(0)}% surcharge due to social inflation in auto verdicts.`,
        `Underlying Mandate: Requires active underlying policies ($1M CGL, $1M Auto, $500k Employer's Liability).`,
      ],
      costReductionTips: [
        'Higher limit layers get progressively cheaper per million (e.g. $10M costs significantly less than 10 separate $1M policies).',
        'Install commercial vehicle forward-facing dashcams and telematics to qualify for preferred excess auto underwriting pricing.',
        'Ensure the umbrella policy is "True Follow-Form," matching the exact coverage triggers of underlying CGL and auto policies.',
      ],
      benchmarks: [
        { label: 'Limit Level', value: `$${millions} Million` },
        { label: 'Cost / $1M Limit', value: `$${costPerMillion.toLocaleString()}` },
        { label: 'Monthly Equivalent', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Commercial Umbrella & Excess Insurance Is Calculated',
    paragraphs: [
      'In an era marked by nuclear jury verdicts—court awards exceeding $10 million in wrongful death, catastrophic industrial burns, and commercial vehicle collisions—standard primary liability limits of $1,000,000 or $2,000,000 are no longer sufficient to shield a corporate balance sheet from bankruptcy.',
      'Commercial Umbrella and Excess Liability policies provide secondary financial layers that sit directly atop primary underlying policies: Commercial General Liability (CGL), Commercial Auto Liability, and Employer’s Liability (Workers’ Compensation Part B). When a catastrophic loss exhausts the primary $1,000,000 limit, the umbrella policy steps in to pay the remaining judgment up to the excess limit ($5M, $10M, or $25M+).',
      'The single largest catalyst of umbrella premium rate increases across North America is Commercial Auto exposure. Over 60% of all umbrella policy payouts nationwide stem from highway collisions involving commercial delivery vans, flatbeds, and semi-tractors. Underwriters scrutinize fleet maintenance logs, driver MVR driving histories, and whether trucks are equipped with telematics and inward/outward dashcams.',
      'Underwriters require strict minimum underlying insurance limits before an umbrella policy will bind. Typically, an employer must maintain at least $1,000,000 / $2,000,000 on General Liability, $1,000,000 Combined Single Limit (CSL) on Commercial Auto, and $500,000 / $500,000 / $500,000 on Employer’s Liability. If an underlying policy lapses or maintains lower limits, the umbrella carrier will not cover the resulting coverage gap.',
    ],
    factors: [
      {
        name: 'Selected Excess Policy Limit ($1M to $25M+)',
        impact: 'High (Primary cost determinant)',
        detail: 'The first $1M to $5M carries the highest rate; subsequent layers above $10M are discounted per million.',
      },
      {
        name: 'Commercial Vehicle Fleet Sizing',
        impact: 'High (Leading claim severity driver)',
        detail: 'Truck fleets operating on public highways generate the largest catastrophic bodily injury judgments.',
      },
      {
        name: 'Manufacturing Process Severity',
        impact: 'Moderate (25-45% risk load)',
        detail: 'Heavy stamping, volatile chemicals, and structural steel carry higher potential for catastrophic worker injury.',
      },
      {
        name: 'Underlying Policy Limits & Minimums',
        impact: 'Moderate (Mandatory prerequisite)',
        detail: 'Umbrella coverage is conditional upon maintaining active, compliant primary underlying limits.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing companies with modest vehicle fleets typically pay between $1,100 and $1,600 per million of excess coverage for a $5,000,000 commercial umbrella policy.',
  },
  faqs: [
    {
      question: 'What is the difference between an Umbrella Policy and an Excess Liability Policy?',
      answer:
        'While often used interchangeably, an Excess Liability policy strictly follows the exact terms of the underlying policy (Follow-Form). A true Commercial Umbrella policy can sometimes provide broader coverage than underlying policies, potentially dropping down to cover claims excluded by the primary policy, subject to a Self-Insured Retention (SIR).',
    },
    {
      question: 'Why are major customers demanding our company carry a $5M or $10M umbrella limit?',
      answer:
        'Major corporate OEMs, general contractors, and retail chains mandate high umbrella limits in their Master Service Agreements (MSAs) to ensure that if your manufactured part or contractor crew causes a catastrophic failure, your insurance pays the claim rather than the customer’s corporate balance sheet.',
    },
    {
      question: 'What happens if our underlying commercial auto limit is only $500,000 instead of $1,000,000?',
      answer:
        'Umbrella policies contain an Underlying Insurance warranty. If you fail to maintain the required $1,000,000 underlying auto limit, the umbrella policy will only pay for losses exceeding $1,000,000—leaving your company personally liable for the $500,000 gap out of pocket.',
    },
    {
      question: 'Does a commercial umbrella cover Workers’ Compensation claims?',
      answer:
        'An umbrella covers Employer’s Liability (Part B of Workers’ Comp, such as dual-capacity lawsuits or third-party indemnification claims), but it does NOT cover statutory Workers’ Compensation benefits (Part A medical and wage replacement), which have no statutory limit under state law.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'product-liability-insurance-calculator-manufacturers',
    'industrial-property-insurance-calculator',
  ],
};

export const conveyorBeltCostCalc: CalculatorDefinition = {
  id: 'conveyor-belt-cost-calculator',
  slug: 'conveyor-belt-cost-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/conveyor-belt-cost-calculator',
  name: 'Conveyor Belt Cost Calculator',
  metaTitle: 'Conveyor Belt Cost Calculator – Industrial System & Belting Rates',
  metaDescription:
    'Calculate industrial conveyor system installation and belting replacement costs. Estimate roller conveyors, slider beds, motor drives, and turnkey millwright labor.',
  shortDescription:
    'Estimate complete industrial conveyor system capital costs, motor drive packages, belting replacements ($/linear foot), and turnkey millwright installation.',
  targetAudience:
    'Warehouse automation directors, plant logistics managers, packaging plant engineers, and fabrication supervisors designing material handling lines.',
  featured: true,
  featuredBadge: 'Material Handling',
  iconName: 'Wrench',
  fields: [
    {
      id: 'conveyorType',
      label: 'Conveyor System Architecture & Drive Mechanism',
      type: 'select',
      defaultValue: 'powered_roller_bed',
      options: [
        { label: 'Slider Bed Belt Conveyor (Cartons, packaging, parts · $240/linear ft)', value: 'slider_bed', baseRate: 240 },
        { label: 'Roller Bed Belt Conveyor (Longer runs, heavier unit loads · $310/linear ft)', value: 'powered_roller_bed', baseRate: 310 },
        { label: 'Motor Driven Roller (MDR) Zero-Pressure Accumulation ($420/linear ft)', value: 'mdr_accumulation', baseRate: 420 },
        { label: 'Modular Plastic / Stainless Steel Tabletop Chain (Food/washdown · $550/linear ft)', value: 'modular_plastic_chain', baseRate: 550 },
        { label: 'Heavy Bulk Trough Belt Conveyor (Scrap metal, aggregate, chips · $460/linear ft)', value: 'heavy_trough_belt', baseRate: 460 },
      ],
      description: 'System type dictates structural side frames, motor sizing, and friction characteristics.',
    },
    {
      id: 'conveyorLength',
      label: 'Total Conveyor Line Run Length (Linear Feet)',
      type: 'number',
      defaultValue: 120,
      min: 10,
      max: 2500,
      step: 10,
      unit: 'linear ft',
      description: 'Continuous length of the material handling conveyor run.',
    },
    {
      id: 'beltWidth',
      label: 'Conveyor Belt Width (Inches)',
      type: 'select',
      defaultValue: 'width_24',
      options: [
        { label: '12" Width (Small electronics, bottles, small parts · 0.85× factor)', value: 'width_12', multiplier: 0.85 },
        { label: '18" Width (Standard packaging & totes · 0.92× factor)', value: 'width_18', multiplier: 0.92 },
        { label: '24" Width (Standard distribution carton conveyor · 1.00× factor)', value: 'width_24', multiplier: 1.0 },
        { label: '36" Width (Oversize cartons, luggage, scrap · 1.25× factor)', value: 'width_36', multiplier: 1.25 },
        { label: '48" Width (Heavy pallet handling / wide bulk · 1.55× factor)', value: 'width_48', multiplier: 1.55 },
      ],
      description: 'Wider belts require heavier structural cross-members, larger drive shafts, and high-torque gearboxes.',
    },
    {
      id: 'inclineConfig',
      label: 'Elevation Profile & Incline Transitions',
      type: 'select',
      defaultValue: 'horizontal_flat',
      options: [
        { label: 'Horizontal / Flat Floor Run (Standard continuous level · 1.00×)', value: 'horizontal_flat', multiplier: 1.0 },
        { label: 'Inclined / Declined Floor-to-Mezzanine (Rough-top cleated belt + brake motor · 1.28×)', value: 'inclined_cleated', multiplier: 1.28 },
      ],
      description: 'Inclines require rough-top friction belting, internal holding brake motors, and floor support towers.',
    },
    {
      id: 'controlsPackage',
      label: 'Electrical Drive & Automation Controls',
      type: 'select',
      defaultValue: 'vfd_controls',
      options: [
        { label: 'Basic Start/Stop Pushbutton & Fixed Speed AC Motor Drive (1.00×)', value: 'fixed_speed', cost: 0 },
        { label: 'Variable Frequency Drive (VFD) + Photo-Eye Accumulation Sensors (+$2,800)', value: 'vfd_controls', cost: 2800 },
        { label: 'Full PLC Integrated System with Ethernet/IP & Barcode Scanner Routing (+$8,500)', value: 'plc_routing', cost: 8500 },
      ],
      description: 'VFD drives allow soft-starting and synchronizing conveyor speeds with upstream production machines.',
    },
    {
      id: 'installationScope',
      label: 'Mechanical Rigging & Electrical Wiring Installation',
      type: 'select',
      defaultValue: 'turnkey_millwright',
      options: [
        { label: 'Turnkey Millwright Erection & Electrician Drop Wiring (1.35× labor factor)', value: 'turnkey_millwright', multiplier: 1.35 },
        { label: 'Equipment Delivery Only (Customer in-house maintenance installs · 1.00×)', value: 'equipment_only', multiplier: 1.0 },
      ],
      description: 'Turnkey service includes laser alignment, anchor bolting, motor wiring, and pre-commissioning testing.',
    },
  ],
  calculate: (values) => {
    const feet = Number(values.conveyorLength) || 120;

    const baseRates: Record<string, number> = {
      slider_bed: 240,
      powered_roller_bed: 310,
      mdr_accumulation: 420,
      modular_plastic_chain: 550,
      heavy_trough_belt: 460,
    };
    const ratePerFoot = baseRates[values.conveyorType] || 310;

    const widthMults: Record<string, number> = {
      width_12: 0.85,
      width_18: 0.92,
      width_24: 1.0,
      width_36: 1.25,
      width_48: 1.55,
    };
    const widthMult = widthMults[values.beltWidth] || 1.0;

    const inclineMult = values.inclineConfig === 'inclined_cleated' ? 1.28 : 1.0;

    const installMult = values.installationScope === 'turnkey_millwright' ? 1.35 : 1.0;

    const controlCosts: Record<string, number> = {
      fixed_speed: 0,
      vfd_controls: 2800,
      plc_routing: 8500,
    };
    const controlsCost = controlCosts[values.controlsPackage] || 0;

    // Hardware frame, bed sections, pulleys, bearings
    const conveyorSections = Math.round(feet * ratePerFoot * widthMult * inclineMult);

    // Motor gearboxes and drive packages
    const drivePackageCount = Math.max(1, Math.ceil(feet / 80));
    const motorDrivePackage = Math.round(drivePackageCount * 2200 * widthMult);

    // Replacement belting material allocation (2-ply PVC or rubber vulcanized)
    const beltingCost = Math.round(feet * 2.2 * 14 * widthMult);

    // Base equipment total
    const equipmentTotal = conveyorSections + motorDrivePackage + beltingCost + controlsCost;

    // Turnkey installation labor
    const totalInstalledCost = Math.round(equipmentTotal * installMult);
    const costPerFoot = Number((totalInstalledCost / feet).toFixed(2));

    const low = Math.round(totalInstalledCost * 0.9);
    const high = Math.round(totalInstalledCost * 1.15);

    // Annual maintenance & energy budget (approx 6% of capital cost)
    const annualMaintenanceBudget = Math.round(totalInstalledCost * 0.065);

    return {
      primaryLabel: `Total Installed Conveyor System Investment`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInstalledCost,
      frequencyLabel: `$${costPerFoot}/linear ft (${feet} linear ft total run)`,
      breakdown: [
        {
          label: 'Conveyor Framing, Bed Sections & Support Stands',
          amount: Math.round(conveyorSections * (installMult > 1 ? 0.85 : 1.0)),
          description: `Heavy gauge formed steel bed sections, return rollers, and adjustable structural floor stands.`,
        },
        {
          label: 'Electric Motor Drives, Pulleys & Gearboxes',
          amount: motorDrivePackage,
          description: `${drivePackageCount} high-efficiency motor/reducer package(s), crown pulleys, and take-up bearings.`,
        },
        {
          label: 'Industrial Belting & Mechanical Lacing',
          amount: beltingCost,
          description: `Continuous ${values.beltWidth.replace('width_', '')}" industrial belting with stainless steel Clipper/Alligator lacing.`,
        },
        ...(controlsCost > 0
          ? [
              {
                label: 'Variable Frequency Drives (VFD) & Photo-Eyes',
                amount: controlsCost,
                description: `Electrical control panel, emergency stop pull-cords, and optical zone accumulation sensors.`,
              },
            ]
          : []),
        ...(values.installationScope === 'turnkey_millwright'
          ? [
              {
                label: 'Turnkey Millwright Erection & Wiring Labor',
                amount: Math.round(totalInstalledCost - equipmentTotal),
                description: `Laser alignment, floor anchor bolting, conduit wiring, and tracking belt calibration.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Architecture: ${values.conveyorType.toUpperCase().replace('_', ' ')} (${feet} ft at ${values.beltWidth.replace('width_', '')}" width).`,
        `Installed Unit Cost: $${costPerFoot} per linear foot turnkey.`,
        `Drive Package: ${drivePackageCount} independent gearmotor drive zone(s).`,
        `Annual Maintenance Budget: ~$${annualMaintenanceBudget.toLocaleString()} / year for replacement belts, bearings, and lube.`,
      ],
      costReductionTips: [
        'Use Motor Driven Roller (MDR) conveyors for package handling: MDR uses 24V DC motors inside rollers that run only when product is present, saving up to 50% in electricity.',
        'Choose standard belt widths (18" or 24") rather than custom 30" or 36" sizes to avoid custom replacement belt lead times and costs.',
        'Install vulcanized endless belt splices rather than mechanical metal lace on high-speed runs to eliminate splice failure jams.',
      ],
      benchmarks: [
        { label: 'Unit Cost / Linear Ft', value: `$${costPerFoot}/ft` },
        { label: 'Drive Packages', value: `${drivePackageCount} Unit(s)` },
        { label: 'Annual Maintenance', value: `$${annualMaintenanceBudget.toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Conveyor System & Belting Costs Are Calculated',
    paragraphs: [
      'Material handling conveyors are the physical arteries of industrial warehouses, packaging lines, and manufacturing assembly plants. Budgeting a conveyor installation requires evaluating structural framing, motor drive horsepower, belt friction resistance, and electrical automation controls.',
      'Conveyor architecture dictates baseline material costs. Slider Bed conveyors—where the belt slides across a smooth steel deck—are economical ($220 to $300/ft) and ideal for lightweight cartons, packaging, and manual sorting. However, for heavier unit loads or runs exceeding 100 feet, slider bed friction demands massive motors; facilities transition to Roller Bed conveyors (where the belt rides atop free-spinning ball-bearing rollers), cutting friction by 70% and extending motor lifespan.',
      'For modern distribution and e-commerce fulfillment, Motor Driven Roller (MDR) Zero-Pressure Accumulation systems have become the gold standard. Instead of a single central motor running an entire 200-foot line continuously, MDR divides the conveyor into independent 24-volt motorized zones. Rollers run only when a carton approaches and stop before cartons touch, preventing package crushing while reducing electrical consumption by up to 50%.',
      'Installation labor typically represents 25% to 35% of the total capital budget. Professional millwrights must anchor support stands into reinforced concrete, precision laser-align pulleys to prevent belt mistracking, wire 480V three-phase electrical drops, and connect emergency stop cable pull-switches required under OSHA 1910.212 and ASME B20.1 safety standards.',
    ],
    factors: [
      {
        name: 'Conveyor Architecture (Slider vs. Roller vs. MDR)',
        impact: 'High ($240/ft slider vs $420/ft MDR)',
        detail: 'Accumulation and modular plastic chain systems carry higher engineering and component costs.',
      },
      {
        name: 'Belt Width & Pulley Diameters',
        impact: 'Moderate (25-50% cost variance)',
        detail: 'Wider belts (36" to 48") require heavier side channels, larger drive shafts, and high-torque gearboxes.',
      },
      {
        name: 'Incline Profiles & Friction Cleats',
        impact: 'Moderate (Adds 25-30% to run cost)',
        detail: 'Inclines require rough-top friction rubber, holding brake motors, and structural floor support towers.',
      },
      {
        name: 'VFD Drives & Optical Sensors',
        impact: 'Moderate ($2,500 to $8,500 controls package)',
        detail: 'Variable frequency controllers provide soft-starting and interface with plant PLCs.',
      },
    ],
    industryBenchmarkNote:
      'Turnkey commercial conveyor systems average $300 to $550 per linear foot installed, with annual routine maintenance (lube, lacing, belt wear) running approximately 5% to 7% of capital investment.',
  },
  faqs: [
    {
      question: 'What is the difference between a Slider Bed and a Roller Bed conveyor?',
      answer:
        'In a Slider Bed conveyor, the belt slides across a stationary sheet of formed steel. It provides a stable, flat surface for manual sorting and inspecting small parts, but creates high friction. In a Roller Bed conveyor, the belt rides on top of closely spaced ball-bearing rollers, dramatically reducing friction and allowing longer runs with heavier loads.',
    },
    {
      question: 'What is Zero-Pressure Accumulation (ZPA) and why is it used?',
      answer:
        'Zero-Pressure Accumulation allows products to buffer and queue along a conveyor line without touching each other. As leading packages stop at an inspection or palletizing station, optical sensors signal upstream motorized zones to pause, preventing package pile-ups and product damage.',
    },
    {
      question: 'How often does a conveyor belt need to be replaced?',
      answer:
        'Standard 2-ply PVC or polyurethane belts typically last between 2 and 5 years in clean packaging environments. Heavy-duty rubber belts carrying abrasive scrap, metal stampings, or running at high inclines may require replacement every 12 to 24 months.',
    },
    {
      question: 'What safety devices are mandatory on industrial conveyors under OSHA?',
      answer:
        'Under OSHA 1910.212 and ASME B20.1 standards, conveyors must feature emergency stop pull-cords running the full accessible length of the conveyor, nip point guards enclosing all drive pulleys and tail drums, and warning alarms before remote automated startup.',
    },
  ],
  relatedCalculatorIds: [
    'machinery-depreciation-hourly-rate-calculator',
    'manufacturing-overhead-cost-calculator',
    'warehouse-insurance-calculator',
  ],
};
