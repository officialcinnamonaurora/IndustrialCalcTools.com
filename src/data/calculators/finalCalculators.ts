import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const scaffoldingRentalCalc: CalculatorDefinition = {
  id: 'scaffolding-rental-cost-estimator',
  slug: 'scaffolding-rental-cost-estimator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/scaffolding-rental-cost-estimator',
  name: 'Scaffolding Rental Cost Estimator',
  metaTitle: 'Scaffolding Rental Cost Estimator – System & Frame Scaffold Rates',
  metaDescription:
    'Calculate commercial and industrial scaffolding rental costs. Estimate ringlock system scaffold, frame staging, erection and dismantle labor, and PE engineering stamps.',
  shortDescription:
    'Estimate scaffolding equipment rental, erection and dismantle (E&D) certified labor, debris netting enclosures, and PE engineering stamps.',
  targetAudience:
    'General contractors, plant turnaround managers, industrial painters, masonry contractors, and safety engineers budgeting exterior staging.',
  featured: true,
  featuredBadge: 'Site Staging',
  iconName: 'Wrench',
  fields: [
    {
      id: 'scaffoldType',
      label: 'Scaffolding System Architecture',
      type: 'select',
      defaultValue: 'system_ringlock',
      options: [
        { label: 'Frame & Brace Scaffolding (Standard facade masonry/maintenance · $22/lin ft/mo)', value: 'frame_brace', multiplier: 0.75 },
        { label: 'Modular Ringlock System Scaffolding (Refineries, boilers, heavy industrial · $34/lin ft/mo)', value: 'system_ringlock', multiplier: 1.0 },
        { label: 'Cuplock System Scaffolding (Heavy civil & industrial structural · $31/lin ft/mo)', value: 'cuplock', multiplier: 0.92 },
        { label: 'Suspended Powered Swing Stage (Motorized 20-30 ft platform · $1,850/mo/stage)', value: 'swing_stage', multiplier: 1.4 },
        { label: 'Mobile Rolling Aluminum Tower (Indoor maintenance / 20 ft · $350/week)', value: 'rolling_tower', multiplier: 0.4 },
      ],
      description: 'System ringlock scaffolding handles complex industrial geometries, circular storage tanks, and high loads.',
    },
    {
      id: 'facadeLength',
      label: 'Scaffold Run Length (Linear Feet)',
      type: 'number',
      defaultValue: 60,
      min: 10,
      max: 1000,
      step: 5,
      unit: 'linear ft',
      description: 'Total horizontal perimeter length of the scaffolding structure.',
    },
    {
      id: 'scaffoldHeight',
      label: 'Scaffold Elevation / Working Height (Feet)',
      type: 'number',
      defaultValue: 30,
      min: 10,
      max: 200,
      step: 5,
      unit: 'feet high',
      description: 'Vertical height to top working deck. Heights over 125 ft require mandatory certified PE design.',
    },
    {
      id: 'rentalDurationWeeks',
      label: 'Rental Duration (Weeks)',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 52,
      step: 1,
      unit: 'weeks',
      description: 'Project rental duration (standard 4 weeks per billing month).',
    },
    {
      id: 'laborScope',
      label: 'Erection & Dismantling (E&D) Labor Service',
      type: 'select',
      defaultValue: 'turnkey_labor',
      options: [
        { label: 'Turnkey Erect & Dismantle by Certified Scaffold Crew (OSHA Competent Person included)', value: 'turnkey_labor', multiplier: 1.0 },
        { label: 'Materials Rental Only (Customer erects with own qualified crew · Hardware only)', value: 'materials_only', multiplier: 0.42 },
      ],
      description: 'E&D labor typically represents 55% to 65% of the total scaffolding invoice on commercial jobs.',
    },
    {
      id: 'accessoriesEnclosure',
      label: 'Safety Netting & Weather Enclosures',
      type: 'select',
      defaultValue: 'debris_netting',
      options: [
        { label: 'Standard Planking, Toe Boards & Guardrails Only', value: 'standard_plank', multiplier: 1.0 },
        { label: 'Fine Debris Netting & Pedestrian Protection Screens (+15% hardware)', value: 'debris_netting', multiplier: 1.15 },
        { label: 'Heavy Weather Enclosure / Flame-Retardant Shrink Wrap Containment (+35%)', value: 'weather_wrap', multiplier: 1.35 },
      ],
      description: 'Environmental containment for sandblasting, industrial painting, or winter heating.',
    },
  ],
  calculate: (values) => {
    const length = Number(values.facadeLength) || 60;
    const height = Number(values.scaffoldHeight) || 30;
    const weeks = Number(values.rentalDurationWeeks) || 4;
    const months = Math.max(1, Math.ceil(weeks / 4));

    const totalFacadeArea = length * height;

    const typeMults: Record<string, number> = {
      frame_brace: 0.75,
      system_ringlock: 1.0,
      cuplock: 0.92,
      swing_stage: 1.4,
      rolling_tower: 0.4,
    };
    const typeMult = typeMults[values.scaffoldType] || 1.0;

    const accessMults: Record<string, number> = {
      standard_plank: 1.0,
      debris_netting: 1.15,
      weather_wrap: 1.35,
    };
    const accessMult = accessMults[values.accessoriesEnclosure] || 1.15;

    // Monthly equipment lease base ($1.10 per sq ft of wall area per month for ringlock baseline)
    const baseEquipmentPerMonth = Math.round(totalFacadeArea * 1.15 * typeMult * accessMult);
    const totalEquipmentRental = baseEquipmentPerMonth * months;

    // Erection & Dismantling (E&D) Labor calculation
    // Certified scaffold crew averages $1.85 to $2.60 per sq ft of facade area for erection and dismantling
    let edLabor = 0;
    if (values.laborScope === 'turnkey_labor') {
      edLabor = Math.round(totalFacadeArea * 2.25 * (height > 60 ? 1.3 : 1.0));
    }

    // Mobilization, freight delivery, and pickup (flatbed transport trailers)
    const freightMob = Math.round(1200 + (totalFacadeArea / 1000) * 180);

    // Engineering calculations & PE stamp (Mandatory if height > 125 ft, or standard review)
    const peStampFee = height >= 100 ? 3200 : height >= 50 ? 1800 : 750;

    const totalProjectCost = totalEquipmentRental + edLabor + freightMob + peStampFee;
    const costPerSqFt = Number((totalProjectCost / totalFacadeArea).toFixed(2));

    const low = Math.round(totalProjectCost * 0.9);
    const high = Math.round(totalProjectCost * 1.15);

    return {
      primaryLabel: `Total Estimated Scaffolding Project Investment`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalProjectCost,
      frequencyLabel: `${weeks} weeks (${totalFacadeArea.toLocaleString()} sq ft facade area)`,
      breakdown: [
        {
          label: `Scaffolding Hardware Lease (${months} Month${months > 1 ? 's' : ''})`,
          amount: totalEquipmentRental,
          description: `Ringlock ledgers, standards, steel planks, screw jacks, and guardrails for ${totalFacadeArea.toLocaleString()} sq ft wall.`,
        },
        ...(edLabor > 0
          ? [
              {
                label: 'Certified Erection & Dismantling (E&D) Labor',
                amount: edLabor,
                description: `Turnkey union/certified crew assembly, initial tagging, and post-project dismantling.`,
              },
            ]
          : []),
        {
          label: 'Flatbed Freight, Delivery & Return Pickup',
          amount: freightMob,
          description: `Transport of heavy scaffold frames, aluminum decks, and outriggers to jobsite.`,
        },
        {
          label: 'PE Structural Engineering Calculation & Plan Review',
          amount: peStampFee,
          description: `Tie-back calculations, baseplate soil bearing verification, and wind-load analysis.`,
        },
      ],
      keyDrivers: [
        `Facade Coverage: ${totalFacadeArea.toLocaleString()} sq ft (${length} ft long × ${height} ft high).`,
        `Installed Cost per Sq Ft: $${costPerSqFt}/sq ft complete project budget.`,
        `Labor Structure: ${values.laborScope === 'turnkey_labor' ? 'Turnkey E&D Labor Included (60% of cost)' : 'Hardware Rental Only'}.`,
        `OSHA 1926 Subpart L: Requires daily inspection by a designated Competent Person before every shift.`,
      ],
      costReductionTips: [
        'Coordinate trades (glazing, insulation, painting, masonry) so all work is completed in a single continuous scaffold deployment.',
        'Ensure base ground is graded, compacted, and free of mud before scaffold drop to avoid costly mud-sill leveling delays.',
        'Select modular ringlock scaffolding for industrial plants with pipes and tanks to avoid expensive custom lumber shoring.',
      ],
      benchmarks: [
        { label: 'Unit Cost / Sq Ft', value: `$${costPerSqFt}/sq ft` },
        { label: 'Monthly Lease', value: `$${baseEquipmentPerMonth.toLocaleString()}/mo` },
        { label: 'OSHA Standard', value: '29 CFR 1926.451' },
      ],
    };
  },
  explainer: {
    title: 'How Scaffolding Rental and Erection Costs Are Calculated',
    paragraphs: [
      'Budgeting commercial and industrial scaffolding requires understanding that the monthly hardware lease is often the smallest part of the total bill. On most industrial turnaround and building maintenance jobs, Erection and Dismantling (E&D) labor accounts for 50% to 65% of the total project invoice.',
      'Scaffolding systems fall into distinct architectural categories. Traditional Frame & Brace scaffolding is cost-effective for straight, flat masonry walls up to 40 or 50 feet. However, for industrial facilities, chemical refineries, boilers, and power plants, modular Ringlock System Scaffolding is mandatory. Ringlock standards have rosettes every 19 inches, allowing ledgers and diagonal braces to connect at any angle to wrap around process piping, storage tanks, and structural steel columns.',
      'Under OSHA 29 CFR 1926 Subpart L, scaffolding must be designed by a qualified person and erected under the direct supervision of an OSHA Competent Person. Supported scaffolds must be capable of supporting their own weight plus at least four times the maximum intended load (a 4:1 safety factor). For scaffolds exceeding 125 feet in height, local building codes mandate certified Professional Engineer (PE) stamped structural calculations verifying tie-back wall anchor pull strengths and wind loads.',
      'Enclosures such as debris netting and weather shrink-wrap significantly alter the engineering math. Solid shrink-wrap transforms the scaffolding into a giant sail during high-wind storms, requiring heavy-duty structural tie-backs to the building frame every 15 to 20 vertical feet to prevent catastrophic scaffold collapse.',
    ],
    factors: [
      {
        name: 'Hardware Lease vs. E&D Labor',
        impact: 'High (Labor represents 55-65% of total)',
        detail: 'Certified union/safety erectors assemble and dismantle the structure under strict OSHA guidelines.',
      },
      {
        name: 'System Architecture (Ringlock vs. Frame)',
        impact: 'High (30-40% hardware variance)',
        detail: 'Ringlock modular systems accommodate complex pipes and tanks that frame scaffolding cannot navigate.',
      },
      {
        name: 'Elevation & Fall Protection Tie-Ins',
        impact: 'Moderate (Heights >60 ft increase labor 30%)',
        detail: 'Elevations require manual hoisting of steel planks and structural wall anchors.',
      },
      {
        name: 'Debris Netting & Shrink-Wrap Sail Loads',
        impact: 'Moderate (Requires heavy structural ties)',
        detail: 'Containment netting catches wind, requiring engineered tie-backs into building structural columns.',
      },
    ],
    industryBenchmarkNote:
      'Turnkey commercial scaffolding typically costs between $3.50 and $6.50 per square foot of wall facade area for an initial 4-week rental cycle, with hardware extensions averaging $1.00 to $1.50/sq ft per month thereafter.',
  },
  faqs: [
    {
      question: 'What is an OSHA "Competent Person" in scaffolding?',
      answer:
        'Under OSHA 1926.450(b), a Competent Person is someone capable of identifying existing and predictable hazards in the surroundings or working conditions, and who has authorization to take prompt corrective measures. A Competent Person must inspect all scaffolding and components for visible defects prior to each work shift.',
    },
    {
      question: 'When is a Professional Engineer (PE) stamp required for scaffolding?',
      answer:
        'OSHA standard 1926.452(a)(10) requires that supported scaffolds over 125 feet in height above their base plates must be designed by a registered Professional Engineer (PE). Furthermore, municipal building departments (such as NYC DOB or Chicago) often require PE drawings for any public sidewalk bridge or scaffold over 40 feet.',
    },
    {
      question: 'What is the standard weight capacity of industrial scaffolding planks?',
      answer:
        'Scaffolding load ratings follow OSHA categories: Light Duty (25 lbs/sq ft for painting/cleaning), Medium Duty (50 lbs/sq ft for general construction/plastering), and Heavy Duty (75 lbs/sq ft for stone masonry and heavy mechanical equipment storage). Planks must never be overloaded.',
    },
    {
      question: 'Can we save money by erecting the scaffold ourselves?',
      answer:
        'While "materials-only" rental saves on upfront contractor labor, the employer assumes full legal OSHA liability. If your internal crew lacks verified scaffold training credentials, insurance underwriters may reject coverage for elevated fall claims, and OSHA citations for improper bracing start at $16,131 per violation.',
    },
  ],
  relatedCalculatorIds: [
    'crane-rental-cost-estimator',
    'industrial-fall-protection-compliance-cost-guide',
    'heavy-equipment-rental-vs-buy-calculator',
  ],
};

export const boilerInspectionCalc: CalculatorDefinition = {
  id: 'boiler-inspection-cost-calculator',
  slug: 'boiler-inspection-cost-calculator',
  categoryId: 'compliance',
  path: '/compliance/boiler-inspection-cost-calculator',
  name: 'Boiler Inspection Cost Calculator',
  metaTitle: 'Boiler Inspection Cost Calculator – National Board & State Fees',
  metaDescription:
    'Calculate statutory boiler inspection costs and National Board audit fees. Estimate internal open vessel exams, ultrasonic thickness testing, and state operating permits.',
  shortDescription:
    'Estimate state statutory boiler operating certificate inspections, internal open-vessel examinations, ultrasonic thickness testing, and National Board compliance fees.',
  targetAudience:
    'Plant maintenance supervisors, certified boiler operators, EHS managers, and institutional facility directors scheduling mandatory statutory inspections.',
  featured: false,
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'inspectionType',
      label: 'Mandatory Inspection Scope & Access',
      type: 'select',
      defaultValue: 'internal_open',
      options: [
        { label: 'External Operating Inspection Only (Burner firing, low-water cutoff test · $350)', value: 'external_only', multiplier: 0.5 },
        { label: 'Internal Confined Space Open Inspection (Drained, manways opened, washed · $850)', value: 'internal_open', multiplier: 1.0 },
        { label: 'Complete Biennial Internal + External State Package ($1,250)', value: 'complete_package', multiplier: 1.45 },
        { label: 'National Board "R" Stamp Repair / Alteration Inspection ($1,850)', value: 'r_stamp_repair', multiplier: 2.15 },
      ],
      description: 'National Board Inspection Code (NBIC) mandates internal inspections for high-pressure steam boilers.',
    },
    {
      id: 'boilerVesselsCount',
      label: 'Number of Boilers & Pressure Vessels to Inspect',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 20,
      step: 1,
      unit: 'vessels',
      description: 'Total steam boilers, deaerator tanks, blowdown separators, and air receiver tanks.',
    },
    {
      id: 'boilerSizeClass',
      label: 'Boiler Rating & Heating Surface Capacity',
      type: 'select',
      defaultValue: 'medium_firetube',
      options: [
        { label: 'Small Commercial / Miniature (<100 sq ft heating surface / <16 HP · 0.80×)', value: 'small_commercial', multiplier: 0.8 },
        { label: 'Medium Industrial Firetube (100 to 1,000 sq ft / 50 to 300 HP · 1.00×)', value: 'medium_firetube', multiplier: 1.0 },
        { label: 'Large High-Pressure Watertube (>1,000 sq ft / >350 HP process steam · 1.40×)', value: 'large_watertube', multiplier: 1.4 },
        { label: 'Utility / Power Generation Supercritical Boiler (Multi-pass · 2.50×)', value: 'utility_power', multiplier: 2.5 },
      ],
      description: 'Larger vessels have expansive waterside tube sheets, internal baffles, and mud drum access.',
    },
    {
      id: 'ndeTesting',
      label: 'Non-Destructive Examination (NDE / NDT)',
      type: 'select',
      defaultValue: 'ultrasonic_thickness',
      options: [
        { label: 'Standard Visual Examination (VT) by Inspector Only ($0 additional)', value: 'visual_only', multiplier: 0 },
        { label: 'Ultrasonic Thickness (UT) Shell & Tube Sheet Gauging (+$450/vessel)', value: 'ultrasonic_thickness', multiplier: 450 },
        { label: 'Magnetic Particle (MT) / Liquid Penetrant (PT) of Welds (+$750/vessel)', value: 'dye_penetrant', multiplier: 750 },
        { label: 'Complete Metallurgical Remaining Life Assessment (+$1,800/vessel)', value: 'metallurgical_life', multiplier: 1800 },
      ],
      description: 'Ultrasonic thickness testing detects internal waterside pitting and firetube wall thinning.',
    },
    {
      id: 'inspectorChannel',
      label: 'Authorized Inspection Agency (AIA) Channel',
      type: 'select',
      defaultValue: 'insurance_inspector',
      options: [
        { label: 'Insurance Company Commissioned Inspector (Included in boiler policy · $150 state filing only)', value: 'insurance_inspector', multiplier: 0.35 },
        { label: 'State Department of Labor / Municipal Deputy Inspector ($650 statutory fee)', value: 'state_deputy', multiplier: 1.0 },
        { label: 'Independent Authorized Inspection Agency (AIA) Third-Party ($1,100/day)', value: 'independent_aia', multiplier: 1.45 },
      ],
      description: 'Commissioned insurance inspectors file state certificates at significant cost savings.',
    },
  ],
  calculate: (values) => {
    const vessels = Number(values.boilerVesselsCount) || 2;

    const inspRates: Record<string, number> = {
      external_only: 350,
      internal_open: 850,
      complete_package: 1250,
      r_stamp_repair: 1850,
    };
    const baseRate = inspRates[values.inspectionType] || 850;

    const sizeMults: Record<string, number> = {
      small_commercial: 0.8,
      medium_firetube: 1.0,
      large_watertube: 1.4,
      utility_power: 2.5,
    };
    const sizeMult = sizeMults[values.boilerSizeClass] || 1.0;

    const channelMults: Record<string, number> = {
      insurance_inspector: 0.35,
      state_deputy: 1.0,
      independent_aia: 1.45,
    };
    const channelMult = channelMults[values.inspectorChannel] || 1.0;

    const ndeCosts: Record<string, number> = {
      visual_only: 0,
      ultrasonic_thickness: 450,
      dye_penetrant: 750,
      metallurgical_life: 1800,
    };
    const ndePerVessel = ndeCosts[values.ndeTesting] || 0;

    // Direct inspection labor
    const inspectorFee = Math.round(baseRate * sizeMult * channelMult * vessels);

    // NDE examination fee
    const totalNdeFee = ndePerVessel * vessels;

    // Pre-inspection mechanical prep: gasket kits, replacement handhole dogs, lockout/tagout labor
    const prepMaterialsPerVessel = values.inspectionType === 'external_only' ? 50 : 280;
    const totalPrepCost = prepMaterialsPerVessel * vessels;

    // State Department of Labor certificate issuance fee ($45 – $95 per boiler statutory fee)
    const stateCertFees = vessels * 75;

    const totalCost = inspectorFee + totalNdeFee + totalPrepCost + stateCertFees;
    const costPerVessel = Math.round(totalCost / vessels);

    const low = Math.round(totalCost * 0.88);
    const high = Math.round(totalCost * 1.16);

    return {
      primaryLabel: `Total Boiler Statutory Inspection Budget`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalCost,
      frequencyLabel: `${vessels} boiler vessel(s) statutory compliance`,
      breakdown: [
        {
          label: 'Authorized National Board Inspector Fee',
          amount: inspectorFee,
          description: `Certified inspection by ${values.inspectorChannel.replace('_', ' ')} under NBIC / ASME code.`,
        },
        ...(totalNdeFee > 0
          ? [
              {
                label: 'Non-Destructive Testing (UT / MT Gauging)',
                amount: totalNdeFee,
                description: `Ultrasonic shell thickness readings and tube sheet ligament crack testing.`,
              },
            ]
          : []),
        {
          label: 'Pre-Inspection Gasket Kits & Mechanical Prep',
          amount: totalPrepCost,
          description: `Replacement spiral-wound manway gaskets, handhole gaskets, and waterside flush prep.`,
        },
        {
          label: 'State Boiler Safety Certificate Issuance Fees',
          amount: stateCertFees,
          description: `Mandatory statutory state operating certificate fees ($75/vessel) filed with Dept of Labor.`,
        },
      ],
      keyDrivers: [
        `Inspection Scope: ${values.inspectionType.toUpperCase().replace('_', ' ')} (${vessels} vessels).`,
        `Effective Cost per Vessel: $${costPerVessel.toLocaleString()} per certified boiler.`,
        `Inspection Agency Channel: ${values.inspectorChannel === 'insurance_inspector' ? 'Insurance Commissioned Inspector (Saves up to 65% on auditor fees)' : 'State / Independent Inspector'}.`,
        `Mandatory Compliance: Operating without an active state certificate carries statutory shutdown orders and fines.`,
      ],
      costReductionTips: [
        'Utilize your commercial boiler insurance carrier’s commissioned inspectors: they perform the inspection for free as part of your policy underwriting.',
        'Order replacement manhole and handhole gaskets 3 weeks prior to annual open inspection to avoid expedited rush shipping.',
        'Schedule internal washouts during planned plant shutdowns so the boiler has cooled sufficiently for inspector confined space entry.',
      ],
      benchmarks: [
        { label: 'Cost / Boiler', value: `$${costPerVessel.toLocaleString()}` },
        { label: 'NBIC Standard', value: 'NB-23 Parts 1-3' },
        { label: 'Certificate Validity', value: '1 Year (High Pressure)' },
      ],
    };
  },
  explainer: {
    title: 'How Statutory Boiler Inspection Costs Are Calculated',
    paragraphs: [
      'In all 50 US states, industrial boilers and unfired pressure vessels are strictly regulated under state administrative boiler safety codes enforced by the National Board of Boiler and Pressure Vessel Inspectors (NBIC). Operating a high-pressure steam boiler without a valid, state-issued Certificate of Operation is illegal and subjects the facility to immediate red-tag shutdown orders and severe municipal fines.',
      'Statutory inspections alternate between External Operating Inspections and Internal Open Inspections. External inspections are performed while the boiler is under steam pressure. The National Board commissioned inspector tests critical safety controls, including the Low-Water Fuel Cutoff (LWCO), flame safeguard interlocks, and verifies that safety relief valves lift and reseat properly without leaking.',
      'Internal inspections require shutting the boiler down, allowing it to cool, draining the water, opening all manways and handholes, and washing out accumulated mud and scale. The inspector physically enters the vessel to examine firetubes, refractory brickwork, staybolts, and internal shell surfaces for oxygen pitting, caustic embrittlement, and thermal stress cracking.',
      'The most economical approach for industrial plant owners is utilizing their commercial property/boiler insurance carrier’s Authorized Inspection Agency (AIA) services. Almost all major equipment breakdown insurance carriers employ commissioned National Board inspectors who conduct state-mandated inspections for free as part of the policy, requiring the facility to pay only the nominal state certificate fee ($45 to $95).',
    ],
    factors: [
      {
        name: 'Internal Open vs. External Operating Exam',
        impact: 'High (Internal requires drain/gaskets)',
        detail: 'Internal exams require confined space entry, scale removal, and new high-temperature gaskets.',
      },
      {
        name: 'Inspector Channel (Insurance vs. State Deputy)',
        impact: 'High (Up to 65% cost savings)',
        detail: 'Boiler insurance carriers provide commissioned inspectors without billing full day-rates.',
      },
      {
        name: 'Ultrasonic Thickness (UT) Testing',
        impact: 'Moderate (Adds $450/vessel)',
        detail: 'UT testing determines remaining shell thickness to ensure minimum allowable working pressure (MAWP).',
      },
      {
        name: 'National Board "R" Stamp Repair Audits',
        impact: 'High ($1,500 to $3,000 for weld repairs)',
        detail: 'Any welding on the pressure retaining boundary requires an authorized R-stamp repair organization.',
      },
    ],
    industryBenchmarkNote:
      'Industrial plants budget between $1,200 and $2,800 annually per boiler for combined mechanical gasket prep, state certificate fees, and non-destructive ultrasonic testing.',
  },
  faqs: [
    {
      question: 'How often must an industrial steam boiler be inspected by law?',
      answer:
        'In nearly all US states, high-pressure steam boilers (operating above 15 PSI) must undergo a certified inspection every 12 months—typically alternating between an internal open inspection and an external operating inspection. Low-pressure heating boilers (under 15 PSI) and unfired pressure vessels are typically inspected every 2 to 3 years.',
    },
    {
      question: 'What happens if a boiler fails its state statutory inspection?',
      answer:
        'If the inspector identifies hazardous conditions—such as a seized safety relief valve, severe tube corrosion, or an inoperable low-water fuel cutoff—they will issue a "Notice of Violation" with a mandatory abatement deadline (usually 30 days) or immediately "Red Tag" the boiler, making it illegal to fire until repairs are verified.',
    },
    {
      question: 'Why do we have to replace handhole and manway gaskets every time the boiler is opened?',
      answer:
        'Boiler gaskets are compressed under immense heat and pressure. Reusing old, hardened gaskets creates severe risk of steam leaks, bolt erosion, and catastrophic gasket blowout under pressure. ASME code mandates replacing all gaskets upon vessel reclosure.',
    },
    {
      question: 'Can any licensed plumber perform a state boiler inspection?',
      answer:
        'No. State law strictly mandates that statutory boiler inspections must be performed by a commissioned inspector holding a valid Certificate of Competency from the National Board of Boiler and Pressure Vessel Inspectors and a commission from the state department of labor.',
    },
  ],
  relatedCalculatorIds: [
    'boiler-insurance-calculator',
    'manufacturing-plant-insurance-calculator',
    'osha-fine-calculator',
  ],
};

export const forkliftInsuranceByStateCalc: CalculatorDefinition = {
  id: 'forklift-insurance-cost-by-state',
  slug: 'forklift-insurance-cost-by-state',
  categoryId: 'insurance',
  path: '/insurance/forklift-insurance-cost-by-state',
  name: 'Forklift Insurance Cost by State',
  metaTitle: 'Forklift Insurance Cost by State – 50-State Fleet Rate Comparison',
  metaDescription:
    'Compare forklift fleet insurance costs across all 50 US states. Benchmark commercial auto mobile equipment liability, inland marine rates, and regional litigation factors.',
  shortDescription:
    'Compare annual forklift fleet insurance costs side-by-side across two states, analyzing regional tort litigation climate, fleet size, and mobile equipment endorsements.',
  targetAudience:
    'Multi-state logistics operators, 3PL distribution networks, regional warehouse directors, and fleet risk managers optimizing multi-location equipment coverage.',
  featured: true,
  featuredBadge: 'State Comparison',
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'primaryState',
      label: 'Primary Operating State',
      type: 'select',
      defaultValue: 'CA',
      options: STATE_SELECT_OPTIONS,
      description: 'Your baseline facility location for fleet insurance rating.',
    },
    {
      id: 'secondaryState',
      label: 'Secondary State for Side-by-Side Comparison',
      type: 'select',
      defaultValue: 'TX',
      options: STATE_SELECT_OPTIONS,
      description: 'Select a second state to evaluate geographic premium disparity and savings.',
    },
    {
      id: 'fleetSize',
      label: 'Total Fleet Sizing (Forklifts & Lift Trucks)',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 150,
      step: 1,
      unit: 'forklifts',
      description: 'Total powered industrial trucks operated across facilities.',
    },
    {
      id: 'fleetComposition',
      label: 'Equipment Fleet Make-Up',
      type: 'select',
      defaultValue: 'mixed_warehouse',
      options: [
        { label: 'Class 1 / 2 Electric Rider & Narrow Aisle Reach (Indoor only · 0.90×)', value: 'electric_indoor', multiplier: 0.9 },
        { label: 'Class 4 / 5 Internal Combustion Cushion/Pneumatic (Standard manufacturing · 1.00×)', value: 'mixed_warehouse', multiplier: 1.0 },
        { label: 'Class 7 Rough Terrain Telehandlers & Yard Forklifts (Outdoor construction · 1.45×)', value: 'heavy_rough_terrain', multiplier: 1.45 },
      ],
      description: 'Equipment mass and outdoor yard travel elevate pedestrian collision and rollover severities.',
    },
    {
      id: 'coveragePackage',
      label: 'Insurance Endorsement Scope',
      type: 'select',
      defaultValue: 'full_package',
      options: [
        { label: 'Comprehensive Package ($1M General Liability + Inland Marine Floater + Hired/Non-Owned)', value: 'full_package', multiplier: 1.0 },
        { label: 'Physical Damage Only (Inland Marine Scheduled Mobile Floater · $1,000 Ded)', value: 'physical_only', multiplier: 0.65 },
        { label: 'Mobile Equipment Liability Endorsement Only ($1M/$2M CGL Rider)', value: 'liability_only', multiplier: 0.55 },
      ],
      description: 'Dual protection covers physical machine rollover damage as well as third-party pedestrian impacts.',
    },
    {
      id: 'publicRoadCrossing',
      label: 'Public Roadway Crossing / Ramp Travel',
      type: 'select',
      defaultValue: 'private_yard_only',
      options: [
        { label: 'Private Facility & Yard Only (Standard CGL mobile equipment coverage)', value: 'private_yard_only', multiplier: 1.0 },
        { label: 'Crosses Public Street Between Plant Buildings (Mandatory Commercial Auto CA 00 51 · +25%)', value: 'crosses_public_street', multiplier: 1.25 },
      ],
      description: 'Driving across public streets removes standard CGL coverage and requires Commercial Auto endorsements.',
    },
  ],
  calculate: (values) => {
    const fleet = Number(values.fleetSize) || 6;
    const stateA = US_STATES.find((s) => s.code === values.primaryState) || US_STATES[0];
    const stateB = US_STATES.find((s) => s.code === values.secondaryState) || US_STATES[1];

    const compMults: Record<string, number> = {
      electric_indoor: 0.9,
      mixed_warehouse: 1.0,
      heavy_rough_terrain: 1.45,
    };
    const compMult = compMults[values.fleetComposition] || 1.0;

    const covMults: Record<string, number> = {
      full_package: 1.0,
      physical_only: 0.65,
      liability_only: 0.55,
    };
    const covMult = covMults[values.coveragePackage] || 1.0;

    const roadMult = values.publicRoadCrossing === 'crosses_public_street' ? 1.25 : 1.0;

    // National baseline cost per forklift per year: ~$1,050 full package
    const nationalBasePerUnit = 1050 * compMult * covMult * roadMult;

    // Fleet discount
    const fleetDiscount = fleet > 20 ? 0.82 : fleet > 5 ? 0.9 : 1.0;

    // State A calculation
    const annualStateA = Math.round(nationalBasePerUnit * stateA.insuranceRiskMult * fleet * fleetDiscount);
    const perUnitA = Math.round(annualStateA / fleet);

    // State B calculation
    const annualStateB = Math.round(nationalBasePerUnit * stateB.insuranceRiskMult * fleet * fleetDiscount);
    const perUnitB = Math.round(annualStateB / fleet);

    // Comparison Metrics
    const deltaAmount = annualStateA - annualStateB;
    const deltaPct = Number((((stateA.insuranceRiskMult - stateB.insuranceRiskMult) / stateB.insuranceRiskMult) * 100).toFixed(1));

    const lowA = Math.round(annualStateA * 0.88);
    const highA = Math.round(annualStateA * 1.16);

    return {
      primaryLabel: `Forklift Fleet Insurance: ${stateA.name} vs ${stateB.name}`,
      estimatedLow: lowA,
      estimatedHigh: highA,
      pointEstimate: annualStateA,
      frequencyLabel: `${fleet} units in ${stateA.name} ($${perUnitA.toLocaleString()}/unit/yr)`,
      breakdown: [
        {
          label: `${stateA.name} Annual Fleet Premium (${stateA.insuranceRiskMult}× Index)`,
          amount: annualStateA,
          description: `Total cost for ${fleet} forklifts in ${stateA.name} ($${perUnitA.toLocaleString()} per unit / year).`,
        },
        {
          label: `${stateB.name} Annual Fleet Premium (${stateB.insuranceRiskMult}× Index)`,
          amount: annualStateB,
          description: `Equivalent cost in ${stateB.name} ($${perUnitB.toLocaleString()} per unit / year).`,
        },
        {
          label: `Geographic Variance Delta (${deltaAmount >= 0 ? '+' : ''}$${Math.abs(deltaAmount).toLocaleString()})`,
          amount: Math.abs(deltaAmount),
          description: `${stateA.name} is ${Math.abs(deltaPct)}% ${deltaAmount >= 0 ? 'more expensive than' : 'cheaper than'} ${stateB.name} due to regional litigation climate.`,
        },
      ],
      keyDrivers: [
        `Primary State: ${stateA.name} ($${perUnitA.toLocaleString()}/unit/yr · ${stateA.oshaPlanType} jurisdiction).`,
        `Comparison State: ${stateB.name} ($${perUnitB.toLocaleString()}/unit/yr · ${stateB.oshaPlanType} jurisdiction).`,
        `Fleet Size: ${fleet} units (${fleetDiscount < 1 ? `${Math.round((1 - fleetDiscount) * 100)}% fleet volume credit` : 'single unit tier'}).`,
        `Public Roadway Endorsement: ${roadMult > 1 ? 'Commercial Auto CA 00 51 rider included (+25%)' : 'Private premises only'}.`,
      ],
      costReductionTips: [
        'Centralize multi-state forklift physical damage under a single blanket Master Inland Marine policy to capture national volume discounts.',
        'Install impact-sensing telematics and speed limiters to qualify for 15% fleet underwriter risk credits.',
        'Avoid public street crossings where possible by using internal plant tunnels or overhead conveyors to eliminate commercial auto surcharges.',
      ],
      benchmarks: [
        { label: `${stateA.code} Cost / Unit`, value: `$${perUnitA.toLocaleString()}/yr` },
        { label: `${stateB.code} Cost / Unit`, value: `$${perUnitB.toLocaleString()}/yr` },
        { label: 'State Delta', value: `${deltaPct >= 0 ? '+' : ''}${deltaPct}%` },
      ],
    };
  },
  explainer: {
    title: 'How Forklift Insurance Costs Vary Across US States',
    paragraphs: [
      'While forklifts may appear identical regardless of where they operate, the cost to insure a fleet varies dramatically from state to state. Forklift insurance underwriting is heavily driven by regional tort litigation climates, frequency of nuclear jury verdicts for pedestrian struck-by accidents, and state-specific mobile equipment endorsement laws.',
      'In high-litigation states such as California, Florida, New York, and Louisiana, commercial general liability rates carry 25% to 40% surcharges above the national baseline. In contrast, Midwestern manufacturing hubs (such as Indiana, Ohio, and Wisconsin) benefit from favorable tort reform statutes, predictable workers’ compensation recovery structures, and lower commercial auto claim severities.',
      'Another critical state-level distinction involves public roadway crossings. Under standard ISO policy language (CG 00 01), forklifts operated strictly within a fenced private warehouse or plant yard are covered for liability under Commercial General Liability (CGL). However, if an operator drives a forklift across a public municipal street or alleyway to reach an annex building, CGL coverage is voided. The business must endorse its policy with ISO Form CA 00 51 (Mobile Equipment Endorsement) under a Commercial Auto policy, which varies heavily by state auto insurance tariffs.',
      'For multi-state logistics and distribution operators, negotiating a single corporate master blanket inland marine floater with an agreed deductible ($2,500 to $5,000) provides significant cost savings compared to purchasing piecemeal local policies at each individual warehouse location.',
    ],
    factors: [
      {
        name: 'State Tort Litigation & Jury Verdict Climate',
        impact: 'High (30-45% cost variance)',
        detail: 'States with high litigation frequency command higher commercial liability underwriting multipliers.',
      },
      {
        name: 'Public Street Crossing Endorsement (CA 00 51)',
        impact: 'Moderate (20-25% surcharge)',
        detail: 'Crossing public roadways triggers commercial auto mobile equipment insurance requirements.',
      },
      {
        name: 'Equipment Power Class (Electric vs. Diesel Telehandler)',
        impact: 'Moderate (Electric indoor units cost 35% less)',
        detail: 'Heavy rough-terrain pneumatic trucks face severe rollover and ground tip-over exposures.',
      },
      {
        name: 'Master Fleet Blanket Policy Sizing',
        impact: 'Moderate (10-18% volume discount)',
        detail: 'Fleets with 10 or more lift trucks qualify for scheduled fleet discounts rather than single-unit rates.',
      },
    ],
    industryBenchmarkNote:
      'Nationwide, industrial operators pay between $750/unit/yr in low-risk Midwestern states up to $1,450/unit/yr in high-litigation coastal states for full physical damage and $1M liability coverage.',
  },
  faqs: [
    {
      question: 'Why is forklift insurance so much more expensive in California and New York than in Ohio?',
      answer:
        'California and New York have significantly higher legal defense costs, higher medical treatment costs for injured pedestrians, and higher jury awards in third-party personal injury lawsuits. Commercial liability underwriters apply regional state factors that reflect these historic loss ratios.',
    },
    {
      question: 'Does standard forklift insurance cover an operator who crosses the street between two warehouses?',
      answer:
        'No. Commercial General Liability specifically excludes motor vehicles operating on public roads. Driving across a public street requires a Commercial Auto policy endorsed with ISO Form CA 00 51 (Mobile Equipment Endorsement) to maintain active liability coverage on public rights-of-way.',
    },
    {
      question: 'Can multi-state logistics companies buy one insurance policy for all locations?',
      answer:
        'Yes. Multi-location logistics providers routinely secure a Blanket Inland Marine Mobile Equipment Floater that covers all lift trucks across all states under a single scheduled limit, capturing volume discounts and eliminating separate localized policies.',
    },
    {
      question: 'How do OSHA forklift citations impact insurance rates across state plans?',
      answer:
        'Insurance underwriters pull public OSHA enforcement records prior to annual policy renewals. Receiving Serious citations under OSHA 1910.178 (or state plans like Cal/OSHA Title 8 § 3668) for uncertified drivers or broken seatbelts routinely triggers 15% to 30% underwriting surcharges or higher deductibles.',
    },
  ],
  relatedCalculatorIds: [
    'forklift-insurance-cost-calculator',
    'forklift-certification-cost-by-state',
    'warehouse-insurance-calculator',
  ],
};

export const cncMachiningCostEstimator: CalculatorDefinition = {
  id: 'cnc-machining-cost-estimator',
  slug: 'cnc-machining-cost-estimator',
  categoryId: 'certification',
  path: '/certification/cnc-machining-cost-estimator',
  name: 'CNC Machining Cost Estimator',
  metaTitle: 'CNC Machining Cost Estimator – AS9100 Precision Part Quoting',
  metaDescription:
    'Estimate precision CNC machining part costs by batch size, material machinability, AS9100 aerospace quality certifications, and CMM First Article Inspection.',
  shortDescription:
    'Calculate precision CNC machined part costs based on raw material machinability, machine hourly rates, AS9100/ISO quality certifications, and CMM inspection.',
  targetAudience:
    'Precision machine shop estimators, aerospace manufacturing engineers, procurement specialists, and job shop owners quoting certified machining contracts.',
  featured: false,
  iconName: 'Cpu',
  fields: [
    {
      id: 'workpieceMaterial',
      label: 'Workpiece Raw Material & Machinability Index',
      type: 'select',
      defaultValue: 'aluminum_6061',
      options: [
        { label: 'Aluminum 6061-T6 (High Machinability · 1.00× tool wear · $6/lb)', value: 'aluminum_6061', multiplier: 1.0 },
        { label: 'Mild Steel / Alloy 4140 (Standard structural · 1.35× tool wear · $3.50/lb)', value: 'alloy_steel', multiplier: 1.35 },
        { label: '304 / 316 Stainless Steel (Work-hardening abrasive · 1.85× tool wear · $7.50/lb)', value: 'stainless_316', multiplier: 1.85 },
        { label: 'Titanium Grade 5 Ti-6Al-4V (Aerospace high-temp · 2.85× tool wear · $28/lb)', value: 'titanium_gr5', multiplier: 2.85 },
        { label: 'Inconel 718 / Nickel Superalloy (Severe cutter wear · 4.20× · $45/lb)', value: 'inconel_718', multiplier: 4.2 },
      ],
      description: 'Material hardness and thermal conductivity dictate maximum cutting feeds, speeds, and tool life.',
    },
    {
      id: 'qualityStandard',
      label: 'Quality Management & Industry Certification',
      type: 'select',
      defaultValue: 'iso_9001',
      options: [
        { label: 'Commercial Standard (ISO 9001:2015 registered shop · 1.00×)', value: 'iso_9001', multiplier: 1.0 },
        { label: 'Aerospace & Defense: AS9100D + ITAR Registered (1.35× QA overhead)', value: 'as9100d_itar', multiplier: 1.35 },
        { label: 'Medical Device: ISO 13485 (Bio-burden tracking & lot genealogy · 1.45×)', value: 'iso_13485', multiplier: 1.45 },
        { label: 'NADCAP Accredited Special Process Tier (Flight critical · 1.65×)', value: 'nadcap_flight', multiplier: 1.65 },
      ],
      description: 'Aerospace and medical standards mandate traceable mill certs, digital lot travelers, and calibration.',
    },
    {
      id: 'machineType',
      label: 'Machining Kinematics & Hourly Spindle Rate',
      type: 'select',
      defaultValue: 'mill_3axis',
      options: [
        { label: '3-Axis Vertical Machining Center ($68/spindle hour)', value: 'mill_3axis', hourlyRate: 68 },
        { label: '4-Axis Horizontal Machining Center ($98/spindle hour)', value: 'hmc_4axis', hourlyRate: 98 },
        { label: '5-Axis Simultaneous Trunnion Mill ($145/spindle hour)', value: 'mill_5axis', hourlyRate: 145 },
        { label: 'Multi-Axis Mill-Turn Lathe with Live Tooling ($125/spindle hour)', value: 'mill_turn', hourlyRate: 125 },
      ],
      description: 'Multi-axis machines reduce human handling setups but carry higher capital depreciation.',
    },
    {
      id: 'cycleTimeMinutes',
      label: 'Cutting Cycle Time per Part (Minutes)',
      type: 'number',
      defaultValue: 25,
      min: 2,
      max: 300,
      step: 1,
      unit: 'minutes',
      description: 'Active spindle cycle time per finished component.',
    },
    {
      id: 'batchQuantity',
      label: 'Batch Production Quantity (Units)',
      type: 'number',
      defaultValue: 50,
      min: 1,
      max: 5000,
      step: 5,
      unit: 'parts',
      description: 'Setup fixtures and CAM programming are amortized across the total batch count.',
    },
    {
      id: 'inspectionScope',
      label: 'Quality Inspection & First Article Reporting',
      type: 'select',
      defaultValue: 'cmm_sample',
      options: [
        { label: 'Standard Vernier / Micrometer Shop Floor Sampling ($0 add-on)', value: 'standard_sampling', cost: 0 },
        { label: 'Automated CMM Touch-Probe Inspection (10% sampling · +$180)', value: 'cmm_sample', cost: 180 },
        { label: 'Full AS9102 First Article Inspection (FAI) Report + CMM Bubble Map (+$450)', value: 'as9102_fai', cost: 450 },
      ],
      description: 'AS9102 FAI packages provide comprehensive 100% feature balloon verification.',
    },
  ],
  calculate: (values) => {
    const cycleMins = Number(values.cycleTimeMinutes) || 25;
    const batchQty = Number(values.batchQuantity) || 50;

    const matMults: Record<string, { wearMult: number; billetCost: number }> = {
      aluminum_6061: { wearMult: 1.0, billetCost: 12 },
      alloy_steel: { wearMult: 1.35, billetCost: 16 },
      stainless_316: { wearMult: 1.85, billetCost: 26 },
      titanium_gr5: { wearMult: 2.85, billetCost: 65 },
      inconel_718: { wearMult: 4.2, billetCost: 110 },
    };
    const matInfo = matMults[values.workpieceMaterial] || matMults.aluminum_6061;

    const qaMults: Record<string, number> = {
      iso_9001: 1.0,
      as9100d_itar: 1.35,
      iso_13485: 1.45,
      nadcap_flight: 1.65,
    };
    const qaMult = qaMults[values.qualityStandard] || 1.0;

    const machineRates: Record<string, number> = {
      mill_3axis: 68,
      hmc_4axis: 98,
      mill_5axis: 145,
      mill_turn: 125,
    };
    const spindleHourlyRate = machineRates[values.machineType] || 68;

    const inspCosts: Record<string, number> = {
      standard_sampling: 0,
      cmm_sample: 180,
      as9102_fai: 450,
    };
    const inspectionFee = inspCosts[values.inspectionScope] || 0;

    // 1. One-time Setup & CAM Programming Amortization
    // CAM programming, tool touch-off, jaw boring: ~$350 baseline setup
    const oneTimeSetupCost = Math.round((280 + (values.machineType === 'mill_5axis' ? 250 : 80)) * qaMult);
    const setupPerPart = oneTimeSetupCost / batchQty;

    // 2. Direct Spindle Machine Time per Part
    const spindleHoursPerPart = cycleMins / 60;
    const machineTimeCostPerPart = spindleHoursPerPart * spindleHourlyRate * qaMult;

    // 3. Tooling Wear & Insert Consumption per Part
    const toolingWearPerHour = 8.5 * matInfo.wearMult;
    const toolingCostPerPart = spindleHoursPerPart * toolingWearPerHour;

    // 4. Raw Material Billet Stock per Part
    const rawMaterialPerPart = matInfo.billetCost;

    // Total direct cost per finished part
    const directCostPerPart = setupPerPart + machineTimeCostPerPart + toolingCostPerPart + rawMaterialPerPart;
    const totalBatchDirectCost = Math.round(directCostPerPart * batchQty);

    const totalBatchInvoice = totalBatchDirectCost + inspectionFee;
    const finalUnitPartPrice = Number((totalBatchInvoice / batchQty).toFixed(2));

    const low = Math.round(totalBatchInvoice * 0.9);
    const high = Math.round(totalBatchInvoice * 1.15);

    return {
      primaryLabel: `Total Batch Quoted Production Cost (${batchQty} Parts)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalBatchInvoice,
      frequencyLabel: `$${finalUnitPartPrice}/part (${values.qualityStandard.toUpperCase().replace('_', ' ')})`,
      breakdown: [
        {
          label: 'Direct CNC Machine Spindle Time',
          amount: Math.round(machineTimeCostPerPart * batchQty),
          description: `${(spindleHoursPerPart * batchQty).toFixed(1)} total cutting hours at $${spindleHourlyRate}/hr (${values.machineType.replace('_', ' ')}).`,
        },
        {
          label: 'Raw Billet Material Stock',
          amount: Math.round(rawMaterialPerPart * batchQty),
          description: `Certified mill test report (MTR) raw stock for ${batchQty} parts (${values.workpieceMaterial.replace('_', ' ')}).`,
        },
        {
          label: 'CAM Programming & Setup Amortization',
          amount: oneTimeSetupCost,
          description: `Mastercam/Fusion CAM programming, soft jaw boring, and tool offset probing ($${setupPerPart.toFixed(2)}/part).`,
        },
        {
          label: 'Cutting Tool Wear & Insert Consumption',
          amount: Math.round(toolingCostPerPart * batchQty),
          description: `Indexable carbide inserts, endmill wear, and coolant consumption (${matInfo.wearMult}× material factor).`,
        },
        ...(inspectionFee > 0
          ? [
              {
                label: 'CMM Inspection & AS9102 First Article Report',
                amount: inspectionFee,
                description: `Automated CMM touch-probe quality verification and certified AS9102 balloon drawings.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Unit Price: $${finalUnitPartPrice} / part in a batch of ${batchQty} units.`,
        `Material Hardness: ${values.workpieceMaterial.toUpperCase().replace('_', ' ')} (${matInfo.wearMult}× tool wear load).`,
        `Quality Rigor: ${values.qualityStandard.toUpperCase().replace('_', ' ')} (${qaMult}× documentation factor).`,
        `Setup Amortization: In a batch of 5 units, setup is $${(oneTimeSetupCost / 5).toFixed(2)}/part; in 100 units, it drops to $${(oneTimeSetupCost / 100).toFixed(2)}/part.`,
      ],
      costReductionTips: [
        'Increase batch sizes from prototype quantities (5–10) to production runs (50+) to reduce setup amortization by over 80%.',
        'Standardize corner radii to match common standard endmill diameters, eliminating specialized custom form tools.',
        'Choose 6061-T6 aluminum instead of stainless or titanium where structural design allowables permit to triple machining speeds.',
      ],
      benchmarks: [
        { label: 'Unit Price', value: `$${finalUnitPartPrice}/part` },
        { label: 'Cycle Time', value: `${cycleMins} mins/part` },
        { label: 'Quality Standard', value: values.qualityStandard.toUpperCase().replace('_', ' ') },
      ],
    };
  },
  explainer: {
    title: 'How Precision CNC Machining & Certification Costs Are Calculated',
    paragraphs: [
      'Quoting precision CNC machined components requires balancing spindle hourly rates, raw material machinability, setup amortization, and quality management system (QMS) certification overhead. While consumer commercial parts require basic dimensional verification, aerospace and medical defense components carry stringent compliance layers that can double the final part price.',
      'The largest technical driver of cycle time and tool wear is workpiece machinability. Aluminum 6061-T6 cuts effortlessly at high surface feet per minute (SFM), generating minimal cutter wear. In contrast, aerospace titanium (Ti-6Al-4V) and nickel-chromium superalloys (Inconel 718) exhibit extreme work-hardening and abrasive heat retention at the cutting edge, forcing machinists to cut at a third of the speed while consuming solid carbide endmills four times faster.',
      'Under aerospace AS9100 Rev D and ISO 13485 standards, machine shops must maintain 100% material lot traceability (Mill Test Reports), documented calibration schedules for every micrometer and gauge pin, and formal risk management logs. For flight-critical contracts, buyers mandate an AS9102 First Article Inspection (FAI) Report, where a quality engineer programs a Coordinate Measuring Machine (CMM) to measure and record every single blueprint dimension and geometric tolerance (GD&T) balloon.',
      'Batch size directly governs unit pricing. Every CNC setup requires CAM programming, material loading, soft jaw machining, and tool touch-off probing—an upfront investment of $300 to $600. When spread across a prototype run of 5 parts, setup adds $80 per part; when amortized across a 100-part production batch, setup drops to just $4 per component.',
    ],
    factors: [
      {
        name: 'Workpiece Machinability (Aluminum vs. Inconel)',
        impact: 'High (3× to 4× cutting time variance)',
        detail: 'Superalloys require low surface speeds and destroy cutting tool inserts at an accelerated pace.',
      },
      {
        name: 'AS9100 & Medical ISO 13485 Quality Overhead',
        impact: 'High (35-50% pricing markup)',
        detail: 'Captures full material traceability, calibration archives, and certified FAIR documentation.',
      },
      {
        name: 'Batch Quantity Amortization',
        impact: 'High (Prototypes cost 3×-5× more per unit)',
        detail: 'Setup and CAM programming costs remain fixed regardless of whether 1 part or 500 parts are cut.',
      },
      {
        name: 'Automated CMM Quality Inspection',
        impact: 'Moderate ($180 to $450 one-time)',
        detail: 'Touch-probe coordinate measurement verifies tight geometric true position tolerances.',
      },
    ],
    industryBenchmarkNote:
      'Precision AS9100 aerospace machine shops bill spindle rates between $95 and $165 per hour, while standard commercial ISO 9001 machine shops range from $65 to $95 per hour.',
  },
  faqs: [
    {
      question: 'What is an AS9102 First Article Inspection (FAI) report?',
      answer:
        'An AS9102 FAI is the universal aerospace standard for verifying that a newly manufactured component conforms to 100% of engineering drawing requirements. It involves numbering ("ballooning") every dimension, note, and tolerance on the blueprint and creating a verified CMM inspection record of the initial production part.',
    },
    {
      question: 'Why do prototype CNC parts cost so much more per unit than production runs?',
      answer:
        'Every machining job incurs fixed upfront costs: writing the CAM toolpath code, setting up fixtures, boring soft jaws, and setting tool height offsets (typically 2 to 4 hours of setup). In a 2-piece prototype order, this $300+ setup cost is divided between only two parts.',
    },
    {
      question: 'What is the difference between 3-axis and 5-axis machining?',
      answer:
        'A 3-axis mill moves linearly along X, Y, and Z axes, requiring parts with features on multiple sides to be manually unclamped and repositioned. A 5-axis mill rotates the part simultaneously along two additional rotary axes (A and B/C), machining complex aerospace impellers and contours in a single high-precision setup.',
    },
    {
      question: 'How do material test reports (MTRs) impact part costs?',
      answer:
        'In aerospace (AS9100) and medical manufacturing, every raw bar of metal must be accompanied by a certified Mill Test Report (MTR) verifying chemical composition and mechanical tensile strength. Procuring certified domestic or DFARS-compliant metal adds 15% to 30% to raw material stock costs.',
    },
  ],
  relatedCalculatorIds: [
    'cnc-machine-operating-cost-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'welding-certification-cost-guide',
  ],
};

export const industrialElectricianSalaryCalc: CalculatorDefinition = {
  id: 'industrial-electrician-salary-by-state',
  slug: 'industrial-electrician-salary-by-state',
  categoryId: 'certification',
  path: '/certification/industrial-electrician-salary-by-state',
  name: 'Industrial Electrician Salary by State',
  metaTitle: 'Industrial Electrician Salary by State – Wages & Fully Burdened Costs',
  metaDescription:
    'Calculate industrial electrician salaries and fully burdened employer costs across all 50 states. Model Journeyman licensing, IBEW union rates, and payroll benefits.',
  shortDescription:
    'Calculate industrial electrician base salaries, certified licensing tiers, union prevailing wage packages, and fully burdened employer labor costs by state.',
  targetAudience:
    'Plant managers, maintenance directors, corporate recruiters, electrical contractors, and EHS supervisors budgeting industrial electrical labor.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'state',
      label: 'Employment State Jurisdiction',
      type: 'select',
      defaultValue: 'TX',
      options: STATE_SELECT_OPTIONS,
      description: 'Regional labor market wage indices, union density, and state electrical licensing board standards.',
    },
    {
      id: 'experienceLevel',
      label: 'Certification Credential & Technical Specialty',
      type: 'select',
      defaultValue: 'journeyman',
      options: [
        { label: 'Industrial Electrical Apprentice (2nd to 4th year · 65% of Journeyman rate)', value: 'apprentice', multiplier: 0.65 },
        { label: 'Licensed Journeyman Industrial Electrician (480V 3-Phase certified · 1.00×)', value: 'journeyman', multiplier: 1.0 },
        { label: 'Master Electrician / Electrical Administrator (Plant license holder · 1.25×)', value: 'master', multiplier: 1.25 },
        { label: 'PLC Automation & Industrial Controls Technician (Allen-Bradley/Siemens · 1.35×)', value: 'plc_controls', multiplier: 1.35 },
        { label: 'High-Voltage Substation & Relay Specialist (Medium/High Voltage · 1.45×)', value: 'high_voltage', multiplier: 1.45 },
      ],
      description: 'Industrial electricians require specialized knowledge of motor control centers (MCCs) and VFDs.',
    },
    {
      id: 'compensationStructure',
      label: 'Labor Framework & Collective Bargaining',
      type: 'select',
      defaultValue: 'open_shop',
      options: [
        { label: 'Open Shop / Non-Union Private Industrial Facility (Market wage + commercial benefits)', value: 'open_shop', multiplier: 1.0 },
        { label: 'Union Prevailing Wage / IBEW Industrial Agreement (1.30× wage + high fringe package)', value: 'union_ibew', multiplier: 1.3 },
      ],
      description: 'IBEW industrial agreements mandate contractual wage scales and National Electrical Benefit Fund contributions.',
    },
    {
      id: 'scheduledHours',
      label: 'Annual Scheduled Hours & Overtime Load',
      type: 'select',
      defaultValue: 'standard_2080',
      options: [
        { label: 'Standard 40-Hour Week (2,080 Hours / Year · Single shift · No overtime)', value: 'standard_2080', hours: 2080, otMult: 1.0 },
        { label: 'Plant Maintenance Schedule (2,300 Hours / Year · Approx 4 hrs/wk overtime · 1.15×)', value: 'moderate_ot', hours: 2300, otMult: 1.15 },
        { label: 'Heavy Turnaround / Outage Schedule (2,600 Hours / Year · 10 hrs/wk overtime · 1.35×)', value: 'heavy_ot', hours: 2600, otMult: 1.35 },
      ],
      description: '24/7 industrial plant maintenance often involves scheduled weekend overtime and emergency call-outs.',
    },
    {
      id: 'employerBurden',
      label: 'Employer Payroll Burden & Benefits Package',
      type: 'select',
      defaultValue: 'standard_benefits',
      options: [
        { label: 'Standard Statutory Burden Only (FICA, FUTA, SUTA, Workers Comp Class 3724 · +26%)', value: 'statutory_only', burdenPct: 0.26 },
        { label: 'Full Corporate Benefits Package (Statutory + Healthcare, 401k match, PTO · +38%)', value: 'standard_benefits', burdenPct: 0.38 },
        { label: 'High-Tier / Union Fringe Package (Health & Welfare, NEBF pension, annuity · +55%)', value: 'union_fringe', burdenPct: 0.55 },
      ],
      description: 'Workers compensation class code 3724 (Electrical Wiring) carries specific industrial risk surcharges.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    // State geographic wage index (BLS median industrial electrician wage factor)
    // High-cost states (CA, NY, WA, IL, AK, MA) index higher; Southern states index slightly lower
    const stateWageFactor =
      stateObj.insuranceRiskMult > 1.25
        ? 1.28
        : stateObj.insuranceRiskMult > 1.1
        ? 1.14
        : stateObj.insuranceRiskMult < 0.98
        ? 0.92
        : 1.0;

    const expMults: Record<string, number> = {
      apprentice: 0.65,
      journeyman: 1.0,
      master: 1.25,
      plc_controls: 1.35,
      high_voltage: 1.45,
    };
    const expMult = expMults[values.experienceLevel] || 1.0;

    const compMults: Record<string, number> = {
      open_shop: 1.0,
      union_ibew: 1.3,
    };
    const compMult = compMults[values.compensationStructure] || 1.0;

    const hourProfiles: Record<string, { hours: number; otMult: number }> = {
      standard_2080: { hours: 2080, otMult: 1.0 },
      moderate_ot: { hours: 2300, otMult: 1.15 },
      heavy_ot: { hours: 2600, otMult: 1.35 },
    };
    const hoursInfo = hourProfiles[values.scheduledHours] || hourProfiles.standard_2080;

    const burdenPcts: Record<string, number> = {
      statutory_only: 0.26,
      standard_benefits: 0.38,
      union_fringe: 0.55,
    };
    const burdenPct = burdenPcts[values.employerBurden] || 0.38;

    // National baseline median hourly rate for licensed industrial journeyman: ~$36.50/hr
    const baseHourlyWage = Number((36.5 * stateWageFactor * expMult * compMult).toFixed(2));
    const annualBaseSalary = Math.round(baseHourlyWage * 2080);

    // Total gross earnings including scheduled overtime
    const totalGrossEarnings = Math.round(baseHourlyWage * 2080 + (hoursInfo.hours - 2080) * baseHourlyWage * 1.5);

    // Employer payroll taxes & benefits burden
    const employerBenefitsTaxes = Math.round(totalGrossEarnings * burdenPct);

    // Mandatory NFPA 70E Arc Flash PPE, insulated 1000V hand tools, and continuing education allowance
    const safetyToolsAllowance = 2400;

    // Fully burdened employer cost
    const totalEmployerCost = totalGrossEarnings + employerBenefitsTaxes + safetyToolsAllowance;
    const fullyBurdenedHourlyRate = Number((totalEmployerCost / hoursInfo.hours).toFixed(2));

    const low = Math.round(totalEmployerCost * 0.9);
    const high = Math.round(totalEmployerCost * 1.15);

    return {
      primaryLabel: `Total Annual Employer Cost per Electrician`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalEmployerCost,
      frequencyLabel: `$${fullyBurdenedHourlyRate}/hr fully burdened (${stateObj.name})`,
      breakdown: [
        {
          label: `Base Gross Wages (${hoursInfo.hours.toLocaleString()} Hours)`,
          amount: totalGrossEarnings,
          description: `$${baseHourlyWage.toFixed(2)}/hr base wage for ${values.experienceLevel.replace('_', ' ')} in ${stateObj.name}.`,
        },
        {
          label: `Employer Taxes, Health Benefits & Retirement (${Math.round(burdenPct * 100)}%)`,
          amount: employerBenefitsTaxes,
          description: `FICA/Medicare, SUTA, Workers' Comp (Class 3724), health insurance, and 401k/pension match.`,
        },
        {
          label: 'NFPA 70E Arc Flash PPE & Tool Allowance',
          amount: safetyToolsAllowance,
          description: `40 cal/cm² arc flash suit, 1000V VDE insulated tools, calibrated digital multimeters, and annual safety recertification.`,
        },
      ],
      keyDrivers: [
        `Base Wage: $${baseHourlyWage.toFixed(2)} / hour ($${annualBaseSalary.toLocaleString()} annual base).`,
        `Fully Burdened Cost: $${fullyBurdenedHourlyRate} / billable hour to the employer.`,
        `State Wage Factor: ${stateObj.name} indexes at ${(stateWageFactor * 100).toFixed(0)}% of the national median.`,
        `Technical Specialization: ${values.experienceLevel.toUpperCase().replace('_', ' ')} command significant wage premiums over residential wiremen.`,
      ],
      costReductionTips: [
        'Sponsor internal apprentice training programs: apprentices produce billable work at 65% of Journeyman wage rates while earning state credentials.',
        'Implement an NFPA 70E predictive thermal imaging inspection program to reduce electrical arc flash risks and lower workers’ compensation mod rates.',
        'Cross-train industrial electricians in PLC ladder logic to eliminate the need for expensive external $180/hr automation software service contractors.',
      ],
      benchmarks: [
        { label: 'Base Hourly Wage', value: `$${baseHourlyWage.toFixed(2)}/hr` },
        { label: 'Burdened Rate', value: `$${fullyBurdenedHourlyRate}/hr` },
        { label: 'Annual Total', value: `$${totalEmployerCost.toLocaleString()}` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Electrician Salaries and Fully Burdened Costs Are Calculated',
    paragraphs: [
      'Industrial electricians maintain a markedly different skill set and compensation profile than commercial or residential wiremen. Working in high-hazard manufacturing plants, chemical processing facilities, and automated warehouses, industrial electricians troubleshoot 480-volt 3-phase power distribution, motor control centers (MCCs), Variable Frequency Drives (VFDs), and Programmable Logic Controllers (PLCs).',
      'Compensation models must distinguish between Base Wage and Fully Burdened Employer Cost. While an industrial journeyman in Texas or Ohio may earn a competitive base wage of $36 to $42 per hour, the actual cost to employ that technician is between $52 and $68 per hour once statutory employer payroll taxes (FICA, FUTA, SUTA), group health insurance, 401(k) retirement contributions, and workers’ compensation insurance are added.',
      'Workers’ compensation is particularly substantial for industrial electrical work. Under NCCI Class Code 3724 (Electrical Work within Buildings), high-voltage arc flash hazards and elevated substation risks carry baseline rates ranging from 3.5% to 7.0% of gross payroll, modified by the company’s individual Experience Modification Rate (EMR).',
      'Geography and union collective bargaining agreements also create significant variances. In states with high union market share (such as Illinois, New York, Washington, and Michigan), IBEW commercial and industrial agreements establish total compensation packages where health, pension, and annuity benefits alone add $22 to $35 per hour on top of base cash wages.',
    ],
    factors: [
      {
        name: 'Technical Specialization (PLC & Substation)',
        impact: 'High (35-45% wage premium)',
        detail: 'Technicians proficient in PLC programming and medium-voltage relay testing command top market rates.',
      },
      {
        name: 'State Regional Cost-of-Living Index',
        impact: 'High (Up to 35% geographic variance)',
        detail: 'Coastal states and union-dense metros pay higher baseline wages than southeastern open-shop markets.',
      },
      {
        name: 'Employer Payroll Burden & Fringe Benefits',
        impact: 'High (Adds 26% to 55% over base salary)',
        detail: 'Comprehensive healthcare, pension matching, and workers’ comp account for a massive share of total compensation.',
      },
      {
        name: 'NFPA 70E Safety PPE & Calibrated Tools',
        impact: 'Low ($2,000 to $3,500/year)',
        detail: 'Specialized 40 cal arc flash shields, insulated hand tools, and annual safety compliance training.',
      },
    ],
    industryBenchmarkNote:
      'According to the US Bureau of Labor Statistics (BLS), the national median wage for industrial electricians is approximately $61,500 base, with top automation and controls specialists earning over $95,000 base ($135,000+ fully burdened).',
  },
  faqs: [
    {
      question: 'What is the difference between an industrial electrician and a commercial electrician?',
      answer:
        'Commercial electricians typically install conduit, lighting, and power outlets in office buildings, retail spaces, and schools. Industrial electricians work in industrial manufacturing plants maintaining high-voltage power distribution, electric motors, transformers, pneumatic valves, and troubleshooting computerized PLC automation systems.',
    },
    {
      question: 'What is NFPA 70E and why is it mandatory for industrial electricians?',
      answer:
        'NFPA 70E is the national standard for electrical safety in the workplace. It establishes safety requirements to protect workers from electric shock and arc flash explosions, including mandatory Arc Flash Risk Assessments, establishing approach boundaries, and wearing flame-resistant PPE rated for specific incident energy levels (cal/cm²).',
    },
    {
      question: 'What does "fully burdened labor cost" mean?',
      answer:
        'Fully burdened labor cost is the true total expenditure required to employ a worker. It includes gross hourly wages PLUS employer-paid payroll taxes (Social Security, Medicare, unemployment), workers’ compensation insurance premiums, healthcare insurance, retirement plans, paid time off, safety gear, and training.',
    },
    {
      question: 'Do industrial electricians require a state license?',
      answer:
        'In most states, industrial electricians must hold a state-issued Journeyman or Master Electrician license, requiring 8,000 hours of documented on-the-job apprenticeship experience and passing a comprehensive National Electrical Code (NEC) examination. Some states allow an "industrial exemption" for technicians working strictly within plant boundaries under a supervising Master Electrician.',
    },
  ],
  relatedCalculatorIds: [
    'cnc-machine-operating-cost-calculator',
    'manufacturing-overhead-cost-calculator',
    'machinery-depreciation-hourly-rate-calculator',
  ],
};
