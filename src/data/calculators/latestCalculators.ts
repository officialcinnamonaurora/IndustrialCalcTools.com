import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const industrialWasteDisposalCalc: CalculatorDefinition = {
  id: 'industrial-waste-disposal-cost-by-state',
  slug: 'industrial-waste-disposal-cost-by-state',
  categoryId: 'compliance',
  path: '/compliance/industrial-waste-disposal-cost-by-state',
  name: 'Industrial Waste Disposal Cost by State',
  metaTitle: 'Industrial Waste Disposal Cost by State – Hazardous & RCRA Rates',
  metaDescription:
    'Calculate industrial and hazardous waste disposal costs across all 50 states. Model drum fees, bulk vacuum tankers, profiling tests, and RCRA manifest charges.',
  shortDescription:
    'Estimate RCRA hazardous and non-hazardous waste disposal costs by container type, treatment technology, state landfill taxes, and profiling lab fees.',
  targetAudience:
    'EHS directors, environmental coordinators, plant chemical managers, and manufacturing facility operators budgeting waste management programs.',
  featured: true,
  featuredBadge: 'RCRA Compliance',
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'state',
      label: 'Facility State / EPA Region',
      type: 'select',
      defaultValue: 'OH',
      options: STATE_SELECT_OPTIONS,
      description: 'State environmental agency manifest surcharges, hazardous waste fees, and regional TSDF distance.',
    },
    {
      id: 'wasteType',
      label: 'Waste Stream Classification & Hazard Grade',
      type: 'select',
      defaultValue: 'rcra_characteristic',
      options: [
        { label: 'RCRA Characteristic Hazardous (D-List: Flammable/Corrosive/Toxic · $340/drum)', value: 'rcra_characteristic', multiplier: 1.0 },
        { label: 'RCRA Listed Hazardous (F-List Solvents, K-List Industrial · $440/drum)', value: 'rcra_listed', multiplier: 1.3 },
        { label: 'Acutely Hazardous Waste (P-List / Toxic Cyanides · $850/drum)', value: 'acute_toxic', multiplier: 2.5 },
        { label: 'Non-Hazardous Industrial Waste (Oily sludge, coolant, grinding swarf · $140/drum)', value: 'non_hazardous', multiplier: 0.42 },
        { label: 'Universal Waste (Fluorescent bulbs, mercury switches, lithium batteries · $190/drum)', value: 'universal', multiplier: 0.55 },
      ],
      description: 'RCRA code designation dictates required treatment, thermal destruction, or secure landfilling.',
    },
    {
      id: 'containerFormat',
      label: 'Packaging Format & Transport Vessel',
      type: 'select',
      defaultValue: 'drums_55',
      options: [
        { label: '55-Gallon Steel or Poly Drums (Standard discrete units)', value: 'drums_55', multiplier: 1.0 },
        { label: '275 / 330-Gallon Intermediate Bulk Container (IBC / Tote · 4.5× volume)', value: 'tote_330', multiplier: 4.2 },
        { label: 'Bulk Vacuum Tanker Truck (Liquids / Wastewater · 4,000 Gallons)', value: 'vacuum_tanker', multiplier: 22.0 },
        { label: '20-Yard Roll-Off Sludge / Solids Box (Heavy solid cake)', value: 'rolloff_box', multiplier: 18.0 },
      ],
      description: 'Container geometry dictates handling labor, dock staging, and bulk transport freight.',
    },
    {
      id: 'containerCount',
      label: 'Number of Packaging Units per Pickup',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 100,
      step: 1,
      unit: 'units',
      description: 'Quantity of drums, totes, or loads scheduled for disposal pickup.',
    },
    {
      id: 'disposalTechnology',
      label: 'Treatment & Disposal Technology',
      type: 'select',
      defaultValue: 'fuel_blending',
      options: [
        { label: 'Fuel Blending / Energy Recovery in Cement Kiln (0.85× cost factor)', value: 'fuel_blending', multiplier: 0.85 },
        { label: 'High-Temperature Incineration (Destroys toxic organics · 1.35× factor)', value: 'incineration', multiplier: 1.35 },
        { label: 'Chemical Wastewater Treatment & Neutralization (0.75× factor)', value: 'wastewater_treat', multiplier: 0.75 },
        { label: 'Subtitle C Hazardous Waste Secure Landfill (Stabilized cake · 1.10×)', value: 'subtitle_c_landfill', multiplier: 1.1 },
      ],
      description: 'End-destination Treatment, Storage, and Disposal Facility (TSDF) processing method.',
    },
    {
      id: 'labProfiling',
      label: 'Analytical Lab Profiling & Characterization',
      type: 'select',
      defaultValue: 'annual_recert',
      options: [
        { label: 'Annual Profile Re-certification (Existing characterized waste · $150)', value: 'annual_recert', multiplier: 150 },
        { label: 'New Waste Stream: Full TCLP 8-Metal & VOC Analytical Profile (+$750)', value: 'new_tclp_profile', multiplier: 750 },
        { label: 'Unknown Chemistry / Emergency Characterization Fingerprint (+$1,450)', value: 'unknown_fingerprint', multiplier: 1450 },
      ],
      description: 'Mandatory chemical testing verifying flashpoint, pH, halogens, and heavy metal concentrations.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const count = Number(values.containerCount) || 1;

    // State cost factor (transport distance to commercial TSDFs and state landfill taxes)
    const stateMult = stateObj.insuranceRiskMult > 1.15 ? 1.2 : stateObj.insuranceRiskMult < 0.98 ? 0.92 : 1.0;

    const wasteMults: Record<string, number> = {
      rcra_characteristic: 1.0,
      rcra_listed: 1.3,
      acute_toxic: 2.5,
      non_hazardous: 0.42,
      universal: 0.55,
    };
    const wasteMult = wasteMults[values.wasteType] || 1.0;

    const formatMults: Record<string, number> = {
      drums_55: 1.0,
      tote_330: 4.2,
      vacuum_tanker: 22.0,
      rolloff_box: 18.0,
    };
    const formatMult = formatMults[values.containerFormat] || 1.0;

    const techMults: Record<string, number> = {
      fuel_blending: 0.85,
      incineration: 1.35,
      wastewater_treat: 0.75,
      subtitle_c_landfill: 1.1,
    };
    const techMult = techMults[values.disposalTechnology] || 0.85;

    const profileCosts: Record<string, number> = {
      annual_recert: 150,
      new_tclp_profile: 750,
      unknown_fingerprint: 1450,
    };
    const profilingFee = profileCosts[values.labProfiling] || 150;

    // Base unit treatment charge ($340 per 55-gal drum baseline)
    const baseUnitRate = 340 * wasteMult * formatMult * techMult * stateMult;

    // Volume discount for larger pickups
    const volumeDiscount = count >= 20 ? 0.82 : count >= 8 ? 0.9 : 1.0;
    const directDisposalCost = Math.round(baseUnitRate * count * volumeDiscount);

    // Dedicated Hazmat Transportation (Permitted Transporter Freight)
    const hazmatTransportFreight = Math.round((750 + count * 28) * stateMult);

    // EPA e-Manifest filing, state documentation fees, and label fees ($35 per manifest)
    const manifestDocs = Math.round(180 + count * 12);

    const totalCost = directDisposalCost + hazmatTransportFreight + manifestDocs + profilingFee;
    const effectiveCostPerUnit = Math.round(totalCost / count);

    const low = Math.round(totalCost * 0.88);
    const high = Math.round(totalCost * 1.18);

    return {
      primaryLabel: `Total Waste Disposal & Transportation Budget`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalCost,
      frequencyLabel: `${count} units pickup (${stateObj.name})`,
      breakdown: [
        {
          label: 'TSDF Treatment & Destruction Fees',
          amount: directDisposalCost,
          description: `Disposal of ${count} unit(s) via ${values.disposalTechnology.replace('_', ' ')} under EPA standards.`,
        },
        {
          label: 'Licensed Hazmat Freight & Transporter Fee',
          amount: hazmatTransportFreight,
          description: `DOT-certified hazardous materials transport with satellite tracking and spill response insurance.`,
        },
        {
          label: 'EPA e-Manifest, State Fees & Chain of Custody',
          amount: manifestDocs,
          description: `Electronic EPA manifest registry submission, state tracking surcharges, and container DOT labels.`,
        },
        {
          label: 'Analytical Lab Characterization & Profile',
          amount: profilingFee,
          description: `Laboratory profiling analysis (TCLP/pH/flashpoint) verifying TSDF permit acceptance.`,
        },
      ],
      keyDrivers: [
        `State Jurisdiction: ${stateObj.name} (${stateObj.epaRegion}).`,
        `Hazard Classification: ${values.wasteType.toUpperCase().replace('_', ' ')}.`,
        `Effective Unit Cost: $${effectiveCostPerUnit.toLocaleString()} all-in per container pickup.`,
        `Cradle-to-Grave Liability: Generator retains permanent environmental liability under RCRA Section 3008.`,
      ],
      costReductionTips: [
        'Segregate non-hazardous waste (mop water, coolant) from solvent rags to prevent reclassifying entire drums as RCRA hazardous.',
        'Choose Fuel Blending for high-BTU organic solvents to qualify for energy recovery discounts over high-heat incineration.',
        'Schedule batch pickups of 10 or more drums to spread the fixed $750+ hazmat transporter freight minimums.',
      ],
      benchmarks: [
        { label: 'Cost / Container', value: `$${effectiveCostPerUnit.toLocaleString()}` },
        { label: 'Freight Share', value: `${Math.round((hazmatTransportFreight / totalCost) * 100)}% of total` },
        { label: 'RCRA Tracking', value: 'EPA e-Manifest' },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Waste Disposal Costs Are Calculated',
    paragraphs: [
      'Under the Resource Conservation and Recovery Act (RCRA), industrial facilities are governed by strict "cradle-to-grave" environmental liability. An industrial waste generator remains legally and financially responsible for hazardous waste forever—even after a certified treatment facility accepts the shipment and cashes the check.',
      'Pricing is primarily established by chemical characterization and waste classification. Non-hazardous oily water or machine coolant typically costs $120 to $180 per 55-gallon drum to treat chemically. In contrast, RCRA Characteristic wastes (D-Codes for ignitability, corrosivity, reactivity, or toxicity) and Listed wastes (F-List spent solvents like acetone or xylene) cost $300 to $550 per drum due to stringent destruction standards.',
      'Disposal technology plays a pivotal role in the final invoice. High-BTU solvent waste streams can be sent to licensed cement kilns for Fuel Blending, where solvents replace fossil fuels during cement clinker manufacturing, providing significant cost savings. Heavily contaminated solids or toxic chemicals requiring high-temperature thermal incineration at 2,000°F carry premium rates.',
      'Transportation and manifest fees often represent 30% to 45% of total pickup expenses for small generators. Licensed hazmat carriers must maintain specialized DOT permits, hazmat driver endorsements, and million-dollar environmental pollution liability insurance policies. Every shipment requires electronic tracking through the EPA e-Manifest system, incurring federal user fees and state tracking surcharges.',
    ],
    factors: [
      {
        name: 'RCRA Classification (Hazardous vs. Non-Hazardous)',
        impact: 'High (2.5× cost variance)',
        detail: 'Contaminating non-hazardous water with solvents triggers full RCRA hazardous pricing.',
      },
      {
        name: 'Treatment Method (Fuel Blending vs. Incineration)',
        impact: 'High ($250 vs $600/drum)',
        detail: 'Thermal destruction requires extreme temperatures and emission scrubbers compared to fuel recovery.',
      },
      {
        name: 'Pickup Volume Batching (Drums per Load)',
        impact: 'Moderate (15-25% volume savings)',
        detail: 'Hazmat freight carriers charge fixed trip minimums ($650–$900); batching drums minimizes per-drum freight.',
      },
      {
        name: 'Laboratory TCLP Waste Profiling',
        impact: 'Moderate ($150 to $750/stream)',
        detail: 'TSDFs require chemical characterization tests before legally accepting any new waste stream.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing facilities budget $22,000 to $65,000 annually for regular quarterly hazardous waste pickups, waste profiling, and EPA manifest compliance.',
  },
  faqs: [
    {
      question: 'What is the "cradle-to-grave" rule under RCRA?',
      answer:
        'Cradle-to-grave means the facility that generates hazardous waste is legally liable for that waste from the moment it is created, while it is transported, and indefinitely after it is disposed of at a TSDF. If a disposal site ever becomes a Superfund cleanup site, all original generators are liable for remediation costs regardless of contracts.',
    },
    {
      question: 'What is the EPA e-Manifest system and who pays the fee?',
      answer:
        'The EPA e-Manifest system tracks hazardous waste shipments nationwide. While the receiving TSDF submits the electronic manifest to the EPA, the user fees ($20–$40 per manifest) and state administrative surcharges are billed back to the waste generator on the final invoice.',
    },
    {
      question: 'How long can a facility store hazardous waste before pickup?',
      answer:
        'Under RCRA, storage limits depend on generator status: Large Quantity Generators (LQG) must ship waste within 90 days; Small Quantity Generators (SQG) have 180 days (or 270 days if shipping over 200 miles); Very Small Quantity Generators (VSQG) have no time limit provided they do not accumulate over 2,200 lbs on-site.',
    },
    {
      question: 'Can waste minimization save our facility money on disposal?',
      answer:
        'Yes. Implementing solvent recycling stills, coolant coalescers, and sludge dewatering filter presses can reduce hazardous waste volume by 60% to 80%, dropping facilities from LQG to SQG and saving tens of thousands in annual freight and manifest fees.',
    },
  ],
  relatedCalculatorIds: [
    'epa-compliance-cost-calculator',
    'osha-fine-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const industrialNoiseRegulationCalc: CalculatorDefinition = {
  id: 'industrial-noise-regulation-guide-by-state',
  slug: 'industrial-noise-regulation-guide-by-state',
  categoryId: 'compliance',
  path: '/compliance/industrial-noise-regulation-guide-by-state',
  name: 'Industrial Noise Regulation Guide by State',
  metaTitle: 'Industrial Noise Regulation Guide by State – OSHA 1910.95 Costs',
  metaDescription:
    'Calculate OSHA 29 CFR 1910.95 noise compliance costs by state. Estimate mobile audiometric testing, noise dosimetry surveys, and acoustic engineering controls.',
  shortDescription:
    'Estimate Hearing Conservation Program (HCP) compliance costs, annual mobile audiometric testing, noise dosimetry surveys, and acoustic abatement controls.',
  targetAudience:
    'EHS managers, industrial hygienists, plant operations directors, and safety engineers managing high-noise stamping, stamping, machining, or forging operations.',
  featured: false,
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'state',
      label: 'Facility State / OSHA Jurisdiction',
      type: 'select',
      defaultValue: 'MI',
      options: STATE_SELECT_OPTIONS,
      description: 'State OSHA Plans (e.g., Cal/OSHA Title 8, WA DOSH, MIOSHA) enforce strict audiometric baseline standards.',
    },
    {
      id: 'exposedEmployees',
      label: 'Number of Workers Exposed to Noise (≥85 dBA)',
      type: 'number',
      defaultValue: 25,
      min: 1,
      max: 500,
      step: 1,
      unit: 'employees',
      description: 'Employees exposed at or above the 85 dBA 8-hour TWA Action Level requiring hearing conservation.',
    },
    {
      id: 'noiseLevel',
      label: 'Average Plant Sound Level in Production Bays',
      type: 'select',
      defaultValue: 'pel_tier',
      options: [
        { label: '85 to 89 dBA: Action Level (Annual testing, free hearing PPE required · 1.00×)', value: 'action_tier', multiplier: 1.0 },
        { label: '90 to 95 dBA: Permissible Exposure Limit PEL (Mandatory PPE wearing · 1.25×)', value: 'pel_tier', multiplier: 1.25 },
        { label: '96 to 104 dBA: Severe Noise (Dual hearing protection: plugs + muffs · 1.60×)', value: 'severe_tier', multiplier: 1.6 },
        { label: '105+ dBA: Extreme Impulsive / Stamping (Mandatory engineering enclosure · 2.10×)', value: 'extreme_tier', multiplier: 2.1 },
      ],
      description: 'OSHA 1910.95 mandates an active program at 85 dBA and engineering controls at 90 dBA.',
    },
    {
      id: 'audiometricDelivery',
      label: 'Audiometric Testing Delivery Format',
      type: 'select',
      defaultValue: 'mobile_van',
      options: [
        { label: 'Mobile Audiometric Testing Van On-Site (Tests full plant across shifts)', value: 'mobile_van', multiplier: 1.0 },
        { label: 'Local Occupational Health Clinic Appointments (Off-site employee visits)', value: 'clinic_offsite', multiplier: 1.35 },
        { label: 'In-House Sound Booth & Certified CAOHC Technician (Company-owned booth)', value: 'in_house_booth', multiplier: 0.75 },
      ],
      description: 'Mobile testing units minimize production downtime by testing 4 to 8 workers simultaneously.',
    },
    {
      id: 'dosimetrySurvey',
      label: 'Industrial Hygiene Sound Survey & Dosimetry',
      type: 'select',
      defaultValue: 'triennial_survey',
      options: [
        { label: 'Annual Comprehensive Noise Survey & Dosimetry Mapping ($2,400)', value: 'annual_survey', multiplier: 2400 },
        { label: 'Triennial Survey / Verification Check ($1,200/yr amortized)', value: 'triennial_survey', multiplier: 1200 },
        { label: 'Internal Safety Team Spot Checks (Calibrated Type 2 Sound Meter · $400)', value: 'internal_spot', multiplier: 400 },
      ],
      description: 'Full-shift personal noise dosimeters worn by operators to measure true 8-hour TWA exposure.',
    },
  ],
  calculate: (values) => {
    const workers = Number(values.exposedEmployees) || 25;
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    const noiseMults: Record<string, number> = {
      action_tier: 1.0,
      pel_tier: 1.25,
      severe_tier: 1.6,
      extreme_tier: 2.1,
    };
    const noiseMult = noiseMults[values.noiseLevel] || 1.25;

    const deliveryMults: Record<string, number> = {
      mobile_van: 1.0,
      clinic_offsite: 1.35,
      in_house_booth: 0.75,
    };
    const deliveryMult = deliveryMults[values.audiometricDelivery] || 1.0;

    const surveyCosts: Record<string, number> = {
      annual_survey: 2400,
      triennial_survey: 1200,
      internal_spot: 400,
    };
    const surveyFee = surveyCosts[values.dosimetrySurvey] || 1200;

    // Audiometric testing fee per employee ($35 to $55 per audiogram + professional audiologist review)
    const baseTestPerWorker = Math.round(48 * deliveryMult);
    // Mobile van trip mobilization fee (minimum charge typically $650–$950)
    const vanMobilization = values.audiometricDelivery === 'mobile_van' ? Math.max(750, workers * 12) : 0;
    const totalTestingTuition = baseTestPerWorker * workers + vanMobilization;

    // Hearing protection PPE consumables (custom plugs, foam earplugs, ear defenders)
    const ppePerWorker = Math.round((values.noiseLevel === 'severe_tier' || values.noiseLevel === 'extreme_tier' ? 65 : 28) * noiseMult);
    const totalPpeCost = ppePerWorker * workers;

    // Annual training, STS standard threshold shift evaluation, and medical recordkeeping ($15/employee)
    const recordkeepingTraining = Math.round(workers * 22);

    const totalAnnualHcp = totalTestingTuition + totalPpeCost + recordkeepingTraining + surveyFee;
    const costPerEmployee = Math.round(totalAnnualHcp / workers);

    const low = Math.round(totalAnnualHcp * 0.9);
    const high = Math.round(totalAnnualHcp * 1.15);

    return {
      primaryLabel: `Annual Hearing Conservation Compliance Budget`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnualHcp,
      frequencyLabel: `annual recurring program (${workers} employees)`,
      breakdown: [
        {
          label: 'Audiometric Baseline & Annual Testing',
          amount: totalTestingTuition,
          description: `Certified CAOHC pure-tone audiograms (500 to 6000 Hz) with audiologist review for ${workers} workers.`,
        },
        {
          label: 'Industrial Hygiene Dosimetry & Sound Survey',
          amount: surveyFee,
          description: `8-hour personal dosimetry monitoring and plant octave-band noise mapping.`,
        },
        {
          label: 'Hearing Protection Devices (NRR Rated PPE)',
          amount: totalPpeCost,
          description: `Pre-formed and disposable earplugs and earmuffs with Noise Reduction Ratings (NRR 25-33 dB).`,
        },
        {
          label: 'OSHA 1910.95 Training & STS Recordkeeping',
          amount: recordkeepingTraining,
          description: `Annual mandatory worker noise training, baseline comparisons, and OSHA 300 log determination.`,
        },
      ],
      keyDrivers: [
        `State Jurisdiction: ${stateObj.name} (${stateObj.oshaPlanType}).`,
        `Effective Cost per Employee: $${costPerEmployee.toLocaleString()} / worker / year.`,
        `Noise Intensity: ${values.noiseLevel.replace('_', ' ').toUpperCase()} (${noiseMult}× exposure factor).`,
        `OSHA Action Level: Mandatory Hearing Conservation Program triggered at 85 dBA 8-hr TWA.`,
      ],
      costReductionTips: [
        'Contract a mobile testing van to test workers directly during shift changes to eliminate off-site clinic travel wages.',
        'Install pneumatic exhaust mufflers and acoustic curtains on noisy vibratory feeder bowls to drop sound levels below 85 dBA.',
        'Maintain a disciplined earplug fit-testing program to document adequate real-world attenuation and avoid OSHA citations.',
      ],
      benchmarks: [
        { label: 'Cost / Worker / Yr', value: `$${costPerEmployee.toLocaleString()}` },
        { label: 'Action Threshold', value: '85 dBA 8-hr TWA' },
        { label: 'Permissible Limit', value: '90 dBA PEL' },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Noise Regulation & Hearing Conservation Costs Are Calculated',
    paragraphs: [
      'Occupational noise-induced hearing loss is one of the most widespread and permanent work-related injuries in manufacturing. Under OSHA 29 CFR 1910.95, employers must implement an active, continuing Hearing Conservation Program (HCP) whenever employee noise exposure equals or exceeds an 8-hour Time-Weighted Average (TWA) of 85 decibels on the A-scale (dBA)—termed the Action Level.',
      'The decibel scale is logarithmic: every 5 dBA increase in sound level doubles the acoustic energy and cuts allowable exposure time in half under OSHA’s 5 dBA exchange rate. While workers may be exposed to 90 dBA for up to 8 hours, 95 dBA is capped at 4 hours, and 100 dBA is capped at just 2 hours without hearing protection.',
      'The core financial component of an HCP is annual audiometric testing. Employers must establish a baseline audiogram within 6 months of an employee’s first exposure to the action level, followed by annual pure-tone hearing threshold tests across 500, 1000, 2000, 3000, 4000, and 6000 Hertz. If an annual test reveals an average shift of 10 dB or more in hearing threshold relative to the baseline (termed a Standard Threshold Shift, or STS), the employer must retest, provide medical evaluation, and potentially record it on the OSHA 300 injury log.',
      'Mobile audiometric testing vans provide the most cost-effective solution for facilities with 15 or more workers. Sending employees off-site to occupational clinics results in lost shift wages, travel mileage, and clinic scheduling fees that cost 35% more than on-site group testing.',
    ],
    factors: [
      {
        name: 'Noise Exposure Threshold (Action Level vs. PEL)',
        impact: 'High (Triggers mandatory program)',
        detail: 'Exposures above 85 dBA mandate annual testing; above 90 dBA mandates engineering controls.',
      },
      {
        name: 'Testing Delivery (Mobile Van vs. Off-Site Clinic)',
        impact: 'Moderate (25-35% cost difference)',
        detail: 'Mobile testing units test multiple workers simultaneously without pulling operators off the floor for hours.',
      },
      {
        name: 'Dual Hearing Protection Requirements (>100 dBA)',
        impact: 'Moderate (Doubles PPE consumable expense)',
        detail: 'Extreme noise areas mandate wearing both internal earplugs and external earmuffs concurrently.',
      },
      {
        name: 'Industrial Hygiene Sound Surveys & Mapping',
        impact: 'Moderate ($1,200 to $2,500/survey)',
        detail: 'Accredited industrial hygienists utilize calibrated dosimeters to defend against OSHA citations.',
      },
    ],
    industryBenchmarkNote:
      'Manufacturing facilities typically spend between $75 and $130 per exposed worker annually for full Hearing Conservation Program testing, audiologist reviews, and hearing protection supplies.',
  },
  faqs: [
    {
      question: 'What is the exact difference between the OSHA Action Level and the PEL?',
      answer:
        'The Action Level is 85 dBA (8-hour TWA). Hitting this level legally triggers the requirement for an annual Hearing Conservation Program, annual audiograms, and training. The Permissible Exposure Limit (PEL) is 90 dBA (8-hour TWA). Hitting 90 dBA requires employers to implement feasible engineering or administrative controls and mandate that all workers wear hearing protection.',
    },
    {
      question: 'What is a Standard Threshold Shift (STS) and must it be recorded on OSHA 300?',
      answer:
        'An STS is defined as a change in hearing threshold relative to the baseline audiogram of an average of 10 dB or more at 2000, 3000, and 4000 Hz in either ear. If an STS is confirmed and determined to be work-related, and the total hearing level reaches 25 dB from audiometric zero, it must be formally recorded as an occupational illness on OSHA Form 300.',
    },
    {
      question: 'Does OSHA allow employers to use earplugs instead of engineering noise controls?',
      answer:
        'No. Under OSHA’s Hierarchy of Controls, personal protective equipment (PPE) like earplugs is the LAST line of defense. If noise levels exceed the 90 dBA PEL, employers must first investigate and implement feasible engineering controls (such as acoustic enclosures, vibration dampening, and silencers) before relying solely on hearing protection.',
    },
    {
      question: 'How do state plan states like California or Washington differ on noise?',
      answer:
        'State-plan states frequently enforce stricter guidelines. For example, Washington DOSH requires employers to evaluate noise exposure at 82 dBA in certain contexts, and Cal/OSHA enforces stringent fit-testing protocols and stricter requirements for engineering control documentation.',
    },
  ],
  relatedCalculatorIds: [
    'osha-fine-calculator',
    'confined-space-training-cost-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const industrialFallProtectionCalc: CalculatorDefinition = {
  id: 'industrial-fall-protection-compliance-cost-guide',
  slug: 'industrial-fall-protection-compliance-cost-guide',
  categoryId: 'compliance',
  path: '/compliance/industrial-fall-protection-compliance-cost-guide',
  name: 'Industrial Fall Protection Compliance Cost Guide',
  metaTitle: 'Industrial Fall Protection Compliance Cost Guide – OSHA 1910.28',
  metaDescription:
    'Calculate industrial fall protection compliance costs. Estimate modular roof guardrails, engineered horizontal lifelines, personal fall arrest systems, and annual inspections.',
  shortDescription:
    'Calculate capital installation and equipment costs for OSHA 1910.28 / 1926 Subpart M fall protection: roof guardrails, horizontal lifelines, and harness gear.',
  targetAudience:
    'Facility managers, roof safety supervisors, structural maintenance directors, and industrial contractors protecting workers from elevated fall hazards.',
  featured: false,
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'systemType',
      label: 'Fall Protection Architecture & System Type',
      type: 'select',
      defaultValue: 'modular_guardrail',
      options: [
        { label: 'Non-Penetrating Modular Roof Guardrail ($55/linear ft · Passive protection)', value: 'modular_guardrail', multiplier: 55 },
        { label: 'Engineered Horizontal Lifeline Cable System (HLL · $38/linear ft · Active)', value: 'horizontal_lifeline', multiplier: 38 },
        { label: 'Rigid Rail / Overhead Fall Arrest Track for Loading Docks ($95/linear ft)', value: 'rigid_rail', multiplier: 95 },
        { label: 'Single-Point Fall Arrest Anchors ($650 per anchor point)', value: 'single_anchors', multiplier: 650 },
        { label: 'Skylight & Roof Hatch Safety Screens ($450 per opening unit)', value: 'skylight_screens', multiplier: 450 },
      ],
      description: 'Passive guardrails eliminate the need for worker harness training; active systems require certified PPE.',
    },
    {
      id: 'linearFootage',
      label: 'Linear Footage of Unprotected Edge / Hazard Area (Feet)',
      type: 'number',
      defaultValue: 200,
      min: 20,
      max: 3000,
      step: 10,
      unit: 'linear ft',
      description: 'Total length of perimeter roof edge, catwalk, mezzanine, or crane runway requiring protection.',
    },
    {
      id: 'authorizedWorkers',
      label: 'Number of Workers Requiring Harness & PFAS Gear',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 50,
      step: 1,
      unit: 'workers',
      description: 'Workers requiring full-body harnesses, self-retracting lifelines (SRLs), and shock lanyards.',
    },
    {
      id: 'surfaceStructure',
      label: 'Mounting Substrate & Structural Framing',
      type: 'select',
      defaultValue: 'membrane_roof',
      options: [
        { label: 'Membrane / Built-Up Flat Roof (Counterweighted base plates · 1.00×)', value: 'membrane_roof', multiplier: 1.0 },
        { label: 'Standing Seam Metal Roof (Non-penetrating S-5 seam clamps · 1.15×)', value: 'metal_standing_seam', multiplier: 1.15 },
        { label: 'Structural Steel I-Beam Overhead Crane Runways (1.30× rigging labor)', value: 'structural_steel', multiplier: 1.3 },
        { label: 'Reinforced Concrete Parapet / Decking (Expansion anchors · 1.20×)', value: 'concrete_deck', multiplier: 1.2 },
      ],
      description: 'Structural mounting determines whether penetration waterproofing or torque testing is required.',
    },
    {
      id: 'peEngineering',
      label: 'Professional Engineer (PE) Design Stamp & Pull-Testing',
      type: 'select',
      defaultValue: 'standard_pe',
      options: [
        { label: 'Certified PE Stamped Drawings & On-Site Pull-Testing ($2,200)', value: 'standard_pe', multiplier: 2200 },
        { label: 'Pre-Engineered Manufacturer Standard Kit ($800 documentation)', value: 'pre_engineered', multiplier: 800 },
        { label: 'Complex Multi-Building Custom Engineering Stamp ($4,500)', value: 'complex_pe', multiplier: 4500 },
      ],
      description: 'OSHA 1910.140 mandates that anchorages be capable of supporting 5,000 lbs or engineered by a qualified PE.',
    },
  ],
  calculate: (values) => {
    const feet = Number(values.linearFootage) || 200;
    const workers = Number(values.authorizedWorkers) || 4;

    const rateMap: Record<string, number> = {
      modular_guardrail: 55,
      horizontal_lifeline: 38,
      rigid_rail: 95,
      single_anchors: 650,
      skylight_screens: 450,
    };
    const baseRate = rateMap[values.systemType] || 55;

    const surfaceMults: Record<string, number> = {
      membrane_roof: 1.0,
      metal_standing_seam: 1.15,
      structural_steel: 1.3,
      concrete_deck: 1.2,
    };
    const surfaceMult = surfaceMults[values.surfaceStructure] || 1.0;

    const peCosts: Record<string, number> = {
      standard_pe: 2200,
      pre_engineered: 800,
      complex_pe: 4500,
    };
    const peFee = peCosts[values.peEngineering] || 2200;

    // Hardware & installation calculation
    let hardwareLaborCost = 0;
    if (values.systemType === 'single_anchors') {
      const anchorCount = Math.max(2, Math.ceil(feet / 30));
      hardwareLaborCost = Math.round(anchorCount * baseRate * surfaceMult);
    } else if (values.systemType === 'skylight_screens') {
      const screenCount = Math.max(2, Math.ceil(feet / 20));
      hardwareLaborCost = Math.round(screenCount * baseRate * surfaceMult);
    } else {
      hardwareLaborCost = Math.round(feet * baseRate * surfaceMult);
    }

    // Personal Fall Arrest System (PFAS) gear per authorized worker
    // Full-body harness, dual-leg shock absorbing lanyard or Class 2 Self-Retracting Lifeline (SRL), trauma straps
    const pfasPerWorker = values.systemType === 'modular_guardrail' ? 80 : 480;
    const totalPfasGear = Math.round(workers * pfasPerWorker);

    // Annual Competent Person inspection & recertification ($650 base + $15/worker)
    const annualInspectionFee = Math.round(650 + workers * 15);

    const totalSystemInvestment = hardwareLaborCost + totalPfasGear + peFee;
    const costPerLinearFoot = Number((totalSystemInvestment / feet).toFixed(2));

    const low = Math.round(totalSystemInvestment * 0.9);
    const high = Math.round(totalSystemInvestment * 1.18);

    return {
      primaryLabel: `Total Fall Protection Compliance Investment`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalSystemInvestment,
      frequencyLabel: `$${costPerLinearFoot}/linear ft installed (${feet} linear ft)`,
      breakdown: [
        {
          label: 'Guardrail / Lifeline Hardware & Rigging Labor',
          amount: hardwareLaborCost,
          description: `Turnkey installation of ${values.systemType.replace('_', ' ')} across ${feet} linear feet.`,
        },
        {
          label: 'Professional Engineer (PE) Structural Stamped Calculation',
          amount: peFee,
          description: `Certified engineering calculations verifying 5,000-lb anchor strength or 2:1 safety factor.`,
        },
        {
          label: 'Personal Fall Arrest (PFAS) Harnesses & SRL Lifelines',
          amount: totalPfasGear,
          description: `OSHA 1910.140 certified harnesses, Class 2 leading-edge SRLs, and trauma relief straps for ${workers} workers.`,
        },
        {
          label: 'Annual Competent Person Re-Certification (First Year)',
          amount: annualInspectionFee,
          description: `Mandatory annual documented inspection of all lifelines, stitching, and anchor load pins.`,
        },
      ],
      keyDrivers: [
        `Architecture: ${values.systemType.toUpperCase().replace('_', ' ')} ($${costPerLinearFoot}/linear ft).`,
        `Substrate: ${values.surfaceStructure.replace('_', ' ')} (${surfaceMult}× rigging factor).`,
        `OSHA Citation Elimination: Fall Protection is OSHA's #1 most cited violation year after year ($16,131+ per serious citation).`,
        `Passive Safety Advantage: Guardrails eliminate daily harness inspections and rescue retrieval plans.`,
      ],
      costReductionTips: [
        'Select non-penetrating counterweighted guardrails to eliminate roof membrane punctures that can void manufacturer roof warranties.',
        'Use horizontal lifelines for maintenance paths accessed less than once a month where full perimeter guardrail costs are prohibitive.',
        'Ensure all self-retracting lifelines are ANSI Z359.14 Class 2 rated if workers could encounter leading edge fall exposures.',
      ],
      benchmarks: [
        { label: 'Unit Cost / Linear Ft', value: `$${costPerLinearFoot}/ft` },
        { label: 'OSHA Standard', value: '29 CFR 1910.28' },
        { label: 'Annual Re-inspection', value: `$${annualInspectionFee.toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Fall Protection Compliance Costs Are Calculated',
    paragraphs: [
      'Falls consistently rank as the leading cause of fatal industrial and construction workplace injuries. Under OSHA 29 CFR 1910.28 (Walking-Working Surfaces) for general industry, employers must provide fall protection whenever a worker is exposed to a fall of 4 feet or more to a lower level (or 6 feet under construction standard 1926 Subpart M), as well as over dangerous equipment regardless of height.',
      'Fall protection architectures are divided into two fundamental engineering categories: Passive Fall Protection and Active Fall Arrest. Passive systems—most notably modular, counterweighted safety guardrails—physically prevent workers from reaching the hazard zone. Because guardrails require zero worker tie-off, zero specialized training, and zero rescue retrieval equipment, they are the preferred solution for rooftop HVAC units and plant catwalks.',
      'Active Fall Arrest Systems—such as Engineered Horizontal Lifelines (HLL), rigid rail tracks, and single-point tie-off anchors—allow workers to access the edge while wearing a full-body harness tethered to an anchor. OSHA standard 1910.140 mandates that anchorages for personal fall arrest systems must be capable of supporting at least 5,000 pounds per attached worker, or designed and installed under the supervision of a qualified Professional Engineer (PE) with a safety factor of at least two.',
      'Budgeting an active fall arrest system requires factoring in personal gear (PFAS), including full-body harnesses, ANSI Z359 Class 2 leading-edge self-retracting lifelines (SRLs), and suspension trauma relief straps. Furthermore, OSHA mandates that all fall protection hardware and harnesses undergo a documented annual inspection by a certified Competent Person.',
    ],
    factors: [
      {
        name: 'Passive Guardrail vs. Active Lifeline',
        impact: 'High ($55/ft guardrail vs $38/ft lifeline)',
        detail: 'Guardrails have higher upfront material costs but eliminate ongoing harness purchases and rescue training.',
      },
      {
        name: 'Mounting Substrate & Penetration Limits',
        impact: 'Moderate (15-30% labor difference)',
        detail: 'Counterweighted baseplates on flat membrane roofs avoid drilling into roof decks, preserving warranties.',
      },
      {
        name: 'Professional Engineering (PE) Certification',
        impact: 'Moderate ($800 to $4,500)',
        detail: 'Certified PE calculation packages verify structural building steel can withstand dynamic arrest shock loads.',
      },
      {
        name: 'Number of Authorized Workers (PFAS Gear)',
        impact: 'Moderate ($450 per worker for harness + SRL)',
        detail: 'Harnesses, shock absorbers, and lanyard hardware require individual employee sizing and fit-testing.',
      },
    ],
    industryBenchmarkNote:
      'Industrial facilities spend an average of $8,000 to $25,000 for perimeter rooftop and high-bay fall protection upgrades, avoiding OSHA willful violations that carry fines up to $161,323.',
  },
  faqs: [
    {
      question: 'What is the fall protection height trigger for industrial general industry?',
      answer:
        'Under OSHA 29 CFR 1910.28(b)(1)(i), the general industry trigger height is 4 feet. Any unprotected walking-working surface 4 feet or higher above a lower level must have a standard guardrail, safety net, or personal fall arrest system. (In construction, the standard trigger height is 6 feet under 1926.501).',
    },
    {
      question: 'Can we install fall protection anchors without a Professional Engineer (PE)?',
      answer:
        'OSHA allows two paths for fall arrest anchors: 1) Anchorages must be capable of supporting at least 5,000 pounds per person attached, OR 2) Anchorages must be designed, installed, and used as part of a complete fall arrest system that maintains a safety factor of at least two under the supervision of a qualified person / PE.',
    },
    {
      question: 'What is suspension trauma and why are relief straps necessary?',
      answer:
        'When a worker is suspended in a harness after a fall, the leg straps compress the femoral veins, pooling blood in the lower extremities and cutting off circulation to the brain. This can lead to unconsciousness and death within 10 to 15 minutes. Suspension trauma relief straps allow the suspended worker to stand up in stirrups, relieving pressure while awaiting rescue.',
    },
    {
      question: 'Do non-penetrating guardrails meet OSHA roof safety standards?',
      answer:
        'Yes. Non-penetrating modular guardrails use heavy recycled rubber or cast-iron counterweights on the roof surface. They are tested to withstand the OSHA-mandated 200-pound outward and downward force applied to the top rail without drilling holes into the roof membrane.',
    },
  ],
  relatedCalculatorIds: [
    'osha-fine-calculator',
    'confined-space-training-cost-calculator',
    'rigging-certification-cost-guide',
  ],
};

export const manufacturingOverheadCalc: CalculatorDefinition = {
  id: 'manufacturing-overhead-cost-calculator',
  slug: 'manufacturing-overhead-cost-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/manufacturing-overhead-cost-calculator',
  name: 'Manufacturing Overhead Cost Calculator',
  metaTitle: 'Manufacturing Overhead Cost Calculator – Predetermined Rate (POHR)',
  metaDescription:
    'Calculate manufacturing overhead costs and Predetermined Overhead Rates (POHR). Model indirect labor, factory utilities, facility depreciation, and absorption rates.',
  shortDescription:
    'Calculate your factory Predetermined Overhead Rate (POHR) per direct labor hour, machine hour, or labor dollar for accurate job costing.',
  targetAudience:
    'Cost accountants, machine shop owners, manufacturing CFOs, estimators, and plant controllers establishing accurate burden absorption rates.',
  featured: false,
  iconName: 'DollarSign',
  fields: [
    {
      id: 'allocationMethod',
      label: 'Overhead Allocation Cost Driver',
      type: 'select',
      defaultValue: 'labor_hours',
      options: [
        { label: 'Direct Labor Hours (POHR $/Labor Hour · Standard for manual assembly)', value: 'labor_hours' },
        { label: 'Machine Operating Hours (POHR $/Machine Hour · Automated CNC/stamping)', value: 'machine_hours' },
        { label: 'Direct Labor Cost Percentage (% of Direct Labor Payroll)', value: 'labor_cost_pct' },
      ],
      description: 'The operational metric that most accurately drives factory indirect consumption.',
    },
    {
      id: 'annualDriverQuantity',
      label: 'Estimated Annual Cost Driver Volume',
      type: 'number',
      defaultValue: 25000,
      min: 500,
      max: 500000,
      step: 500,
      unit: 'hours or $',
      description: 'Total estimated annual direct labor hours, machine spindle hours, or direct labor payroll.',
    },
    {
      id: 'indirectLabor',
      label: 'Annual Factory Indirect Labor ($/Year)',
      type: 'number',
      defaultValue: 380000,
      min: 10000,
      max: 10000000,
      step: 10000,
      unit: '$ USD',
      description: 'Salaries and payroll burden for plant supervisors, material handlers, QC inspectors, and maintenance techs.',
    },
    {
      id: 'occupancyFacility',
      label: 'Annual Factory Facility & Occupancy Rent/Taxes ($/Year)',
      type: 'number',
      defaultValue: 240000,
      min: 5000,
      max: 5000000,
      step: 5000,
      unit: '$ USD',
      description: 'Manufacturing building lease/depreciation, property taxes, building insurance, and security.',
    },
    {
      id: 'utilitiesConsumables',
      label: 'Annual Plant Power, Gas & Indirect Consumables ($/Year)',
      type: 'number',
      defaultValue: 165000,
      min: 2000,
      max: 5000000,
      step: 5000,
      unit: '$ USD',
      description: 'Factory electricity demand charges, compressed air power, natural gas, cutting fluids, and rags.',
    },
    {
      id: 'machineryDepreciation',
      label: 'Annual Equipment Depreciation & Preventative Repair ($/Year)',
      type: 'number',
      defaultValue: 195000,
      min: 5000,
      max: 10000000,
      step: 5000,
      unit: '$ USD',
      description: 'Production equipment depreciation, spare parts, calibration fees, and technician service contracts.',
    },
  ],
  calculate: (values) => {
    const driverVolume = Number(values.annualDriverQuantity) || 25000;
    const indirectLabor = Number(values.indirectLabor) || 380000;
    const occupancy = Number(values.occupancyFacility) || 240000;
    const utilities = Number(values.utilitiesConsumables) || 165000;
    const equipmentDepr = Number(values.machineryDepreciation) || 195000;

    const totalOverheadPool = indirectLabor + occupancy + utilities + equipmentDepr;

    // Predetermined Overhead Rate (POHR) = Estimated Total Manufacturing Overhead / Estimated Total Cost Driver
    const rawPohr = totalOverheadPool / Math.max(1, driverVolume);

    let pohrDisplay = '';
    let unitLabel = '';
    if (values.allocationMethod === 'labor_cost_pct') {
      const pctValue = Number((rawPohr * 100).toFixed(1));
      pohrDisplay = `${pctValue}% of Direct Labor Cost`;
      unitLabel = '% of direct labor';
    } else if (values.allocationMethod === 'machine_hours') {
      pohrDisplay = `$${rawPohr.toFixed(2)} / Machine Operating Hour`;
      unitLabel = 'per machine hour';
    } else {
      pohrDisplay = `$${rawPohr.toFixed(2)} / Direct Labor Hour`;
      unitLabel = 'per direct labor hour';
    }

    const lowPohr = Number((rawPohr * 0.92).toFixed(2));
    const highPohr = Number((rawPohr * 1.12).toFixed(2));

    return {
      primaryLabel: `Predetermined Overhead Rate (POHR)`,
      estimatedLow: values.allocationMethod === 'labor_cost_pct' ? Math.round(rawPohr * 92) : lowPohr,
      estimatedHigh: values.allocationMethod === 'labor_cost_pct' ? Math.round(rawPohr * 112) : highPohr,
      pointEstimate: Math.round(totalOverheadPool),
      frequencyLabel: pohrDisplay,
      breakdown: [
        {
          label: 'Indirect Factory Labor & Supervision',
          amount: indirectLabor,
          description: `Shop supervisors, material handling forklift drivers, QA inspectors, and maintenance mechanics (${Math.round((indirectLabor / totalOverheadPool) * 100)}% of pool).`,
        },
        {
          label: 'Facility Occupancy, Lease & Plant Insurance',
          amount: occupancy,
          description: `Manufacturing floor lease amortized depreciation, real estate taxes, and property casualty coverage.`,
        },
        {
          label: 'Machinery Depreciation & Tool Maintenance',
          amount: equipmentDepr,
          description: `Capital machine depreciation, CNC spare parts, spindle rebuild reserves, and calibration.`,
        },
        {
          label: 'Plant Utilities, Gas & Fluid Consumables',
          amount: utilities,
          description: `High-voltage industrial electricity, compressor power, water, coolant sumps, and shop supplies.`,
        },
      ],
      keyDrivers: [
        `Predetermined Rate: ${pohrDisplay} across ${driverVolume.toLocaleString()} annual base units.`,
        `Total Overhead Pool: $${totalOverheadPool.toLocaleString()} total annual manufacturing burden.`,
        `Dominant Cost Driver: Indirect Labor represents ${Math.round((indirectLabor / totalOverheadPool) * 100)}% of total plant overhead.`,
        `Job Costing Formula: True Unit Cost = Direct Materials + Direct Labor + Applied Overhead (${pohrDisplay}).`,
      ],
      costReductionTips: [
        'Shift high-power processes to off-peak utility hours to reduce peak electric demand ratchets that bloat utilities overhead.',
        'Adopt cross-training so direct operators handle routine daily machine maintenance, reducing dedicated indirect mechanic headcounts.',
        'Review actual overhead vs. applied overhead quarterly to avoid severe year-end underapplied overhead cost write-offs.',
      ],
      benchmarks: [
        { label: 'Total MOH Pool', value: `$${totalOverheadPool.toLocaleString()}` },
        { label: 'Calculated POHR', value: values.allocationMethod === 'labor_cost_pct' ? `${(rawPohr * 100).toFixed(0)}%` : `$${rawPohr.toFixed(2)}/hr` },
        { label: 'Monthly Burden', value: `$${Math.round(totalOverheadPool / 12).toLocaleString()}/mo` },
      ],
    };
  },
  explainer: {
    title: 'How Manufacturing Overhead & Predetermined Overhead Rates (POHR) Are Calculated',
    paragraphs: [
      'In manufacturing managerial accounting, product costs are divided into three fundamental pillars: Direct Materials, Direct Labor, and Manufacturing Overhead (MOH). While direct materials and direct assembly labor can be traced straight to a specific serial number or work order, manufacturing overhead consists of all indirect factory expenses incurred in running the plant that cannot be directly traced to individual parts.',
      'To quote jobs and value inventory throughout the fiscal year, cost accountants establish a Predetermined Overhead Rate (POHR). The POHR is calculated at the beginning of the year using the standard formula: Estimated Total Manufacturing Overhead Costs divided by Estimated Total Volume of the Allocation Base (such as direct labor hours, machine hours, or direct labor payroll dollars).',
      'The choice of allocation driver must match shop floor reality. In labor-intensive assembly shops, Direct Labor Hours is the traditional standard. However, in modern highly automated CNC machining or stamping facilities, labor represents a tiny fraction of total cost; allocating overhead on Direct Labor would severely distort job profitability. Automated facilities should allocate overhead using Machine Operating Hours.',
      'Throughout the operating year, as jobs are completed, overhead is applied to production by multiplying actual hours by the POHR. If actual factory expenses exceed the overhead absorbed, the business has "underapplied overhead," meaning jobs were undercosted and margins were overstated. Quarterly reconciliation ensures quoting formulas remain razor-sharp.',
    ],
    factors: [
      {
        name: 'Selection of Allocation Base (Labor vs. Machine Hours)',
        impact: 'High (Core costing accuracy driver)',
        detail: 'Automated plants must use machine hours to avoid over-burdening labor-intensive jobs.',
      },
      {
        name: 'Indirect Labor Ratios (Supervision & Maintenance)',
        impact: 'High (35-50% of total MOH pool)',
        detail: 'Toolroom clerks, maintenance techs, and quality inspectors make up the largest overhead line item.',
      },
      {
        name: 'Factory Occupancy & Rent Amortization',
        impact: 'Moderate (20-30% of pool)',
        detail: 'Plant floor square footage lease and building depreciation remain fixed regardless of production volume.',
      },
      {
        name: 'Industrial Electric Peak Demand Tariffs',
        impact: 'Moderate (15-25% of pool)',
        detail: 'Summer peak kilowatt demand charges permanently set utility cost floors for months.',
      },
    ],
    industryBenchmarkNote:
      'Precision manufacturing machine shops typically maintain predetermined overhead rates between $45 and $95 per machine operating hour, or 150% to 275% of direct labor payroll.',
  },
  faqs: [
    {
      question: 'What is the exact formula for calculating Predetermined Overhead Rate (POHR)?',
      answer:
        'The formula is: POHR = Estimated Total Manufacturing Overhead Costs ($) ÷ Estimated Total Units in the Allocation Base (Hours or Labor $). For example, if total factory overhead is $980,000 and the plant estimates 20,000 direct machine hours, the POHR is $49.00 per machine hour.',
    },
    {
      question: 'What expenses are excluded from Manufacturing Overhead?',
      answer:
        'Selling, General, and Administrative (SG&A) expenses—such as executive headquarters salaries, sales commissions, marketing campaigns, and legal fees—are "period costs" and are strictly excluded from Manufacturing Overhead. MOH includes ONLY expenses incurred inside the factory walls.',
    },
    {
      question: 'What happens if overhead is underapplied at the end of the year?',
      answer:
        'Underapplied overhead occurs when actual factory expenses exceed the overhead applied to jobs. Under GAAP rules, this difference is closed to Cost of Goods Sold (COGS), reducing the company’s net income on the year-end financial statement.',
    },
    {
      question: 'What is the advantage of Activity-Based Costing (ABC) over a single plant-wide POHR?',
      answer:
        'A single plant-wide rate assumes all products consume overhead uniformly. Activity-Based Costing (ABC) assigns overhead to multiple distinct cost pools (e.g., machine setups, quality inspection, engineering change orders), preventing simple high-volume parts from subsidizing complex low-volume parts.',
    },
  ],
  relatedCalculatorIds: [
    'cnc-machine-operating-cost-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const industrialEquipmentAppraisalCalc: CalculatorDefinition = {
  id: 'industrial-equipment-appraisal-guide',
  slug: 'industrial-equipment-appraisal-guide',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/industrial-equipment-appraisal-guide',
  name: 'Industrial Equipment Appraisal Guide',
  metaTitle: 'Industrial Equipment Appraisal Guide – USPAP & ASA Certified Fees',
  metaDescription:
    'Calculate certified industrial machinery appraisal costs. Estimate fees for ASA/AMEA appraisals, Orderly Liquidation Value (OLV), and bank refinancing.',
  shortDescription:
    'Estimate certified equipment appraisal fees for bank asset-based lending (ABL), refinancing, tax appeals, and partnership buyouts under USPAP standards.',
  targetAudience:
    'Plant CFOs, corporate controllers, commercial bank lenders, equipment dealers, and manufacturing owners preparing for asset-based financing or sales.',
  featured: false,
  iconName: 'Wrench',
  fields: [
    {
      id: 'equipmentCount',
      label: 'Machinery Fleet Size / Asset Line Items',
      type: 'select',
      defaultValue: 'medium_shop',
      options: [
        { label: 'Small Cell / Fleet (1 to 10 Major Capital Machines · $2,400 base)', value: 'small_cell', multiplier: 2400 },
        { label: 'Mid-Size Machine Shop (11 to 35 Major Assets · $4,600 base)', value: 'medium_shop', multiplier: 4600 },
        { label: 'Full Production Facility (36 to 90 Capital Assets · $8,200 base)', value: 'full_plant', multiplier: 8200 },
        { label: 'Large Multi-Building Complex (90+ Assets · $14,500 base)', value: 'large_complex', multiplier: 14500 },
      ],
      description: 'Total individual machine tools, stamping presses, packaging lines, rolling stock, and overhead cranes.',
    },
    {
      id: 'appraisalScope',
      label: 'Inspection Protocol & Report Format',
      type: 'select',
      defaultValue: 'onsite_inspection',
      options: [
        { label: 'On-Site Physical Inspection (Appraiser inspects serial tags, wear, tooling · 1.00×)', value: 'onsite_inspection', multiplier: 1.0 },
        { label: 'Desktop Appraisal (Customer supplies photos, hour meters, and fixed asset ledger · 0.65×)', value: 'desktop_appraisal', multiplier: 0.65 },
      ],
      description: 'Lenders typically mandate on-site physical inspection; desktop appraisals serve internal planning.',
    },
    {
      id: 'valuationStandard',
      label: 'Primary Valuation Definition / Purpose',
      type: 'select',
      defaultValue: 'olv_forced',
      options: [
        { label: 'Orderly Liquidation Value (OLV) + Forced Liquidation (FLV) · Bank ABL standard', value: 'olv_forced', multiplier: 1.0 },
        { label: 'Fair Market Value (FMV) in Continued Use · M&A / Partnership Buyout (1.15×)', value: 'fmv_continued', multiplier: 1.15 },
        { label: 'Replacement Cost New (RCN) · Insurance Underwriting Total Insured Value (0.95×)', value: 'rcn_insurance', multiplier: 0.95 },
      ],
      description: 'Orderly Liquidation Value (OLV) is the metric commercial banks use to set borrowing base lines of credit.',
    },
    {
      id: 'appraiserAccreditation',
      label: 'Appraiser Certification Body',
      type: 'select',
      defaultValue: 'asa_accredited',
      options: [
        { label: 'ASA Accredited Senior Appraiser (American Society of Appraisers · Highest prestige · 1.00×)', value: 'asa_accredited', multiplier: 1.0 },
        { label: 'AMEA Certified Equipment Appraiser (CEA · Association of Machinery Appraisers · 0.92×)', value: 'amea_accredited', multiplier: 0.92 },
        { label: 'Non-Accredited Dealer Opinion of Value (Informal ballpark trade-in letter · 0.30×)', value: 'dealer_opinion', multiplier: 0.3 },
      ],
      description: 'SBA lenders and commercial banks strictly mandate USPAP compliant ASA or AMEA certified appraisers.',
    },
  ],
  calculate: (values) => {
    const assetBaseRates: Record<string, number> = {
      small_cell: 2400,
      medium_shop: 4600,
      full_plant: 8200,
      large_complex: 14500,
    };
    const baseFee = assetBaseRates[values.equipmentCount] || 4600;

    const scopeMults: Record<string, number> = {
      onsite_inspection: 1.0,
      desktop_appraisal: 0.65,
    };
    const scopeMult = scopeMults[values.appraisalScope] || 1.0;

    const valMults: Record<string, number> = {
      olv_forced: 1.0,
      fmv_continued: 1.15,
      rcn_insurance: 0.95,
    };
    const valMult = valMults[values.valuationStandard] || 1.0;

    const certMults: Record<string, number> = {
      asa_accredited: 1.0,
      amea_accredited: 0.92,
      dealer_opinion: 0.3,
    };
    const certMult = certMults[values.appraiserAccreditation] || 1.0;

    // Field travel expense allowance if on-site
    const travelExpense = values.appraisalScope === 'onsite_inspection' ? 850 : 0;

    const engagementFee = Math.round(baseFee * scopeMult * valMult * certMult + travelExpense);
    const turnaroundWeeks = values.equipmentCount === 'large_complex' ? '3 to 5' : values.equipmentCount === 'full_plant' ? '2 to 3' : '1 to 2';

    const low = Math.round(engagementFee * 0.9);
    const high = Math.round(engagementFee * 1.15);

    return {
      primaryLabel: `Certified Equipment Appraisal Engagement Fee`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: engagementFee,
      frequencyLabel: `turnkey USPAP compliant report (${turnaroundWeeks} weeks delivery)`,
      breakdown: [
        {
          label: 'On-Site Field Audit & Asset Tag Verification',
          amount: Math.round(engagementFee * (values.appraisalScope === 'desktop_appraisal' ? 0.1 : 0.38)),
          description: `Physical verification of machine makes, models, serial numbers, CNC options, and maintenance condition.`,
        },
        {
          label: 'Market Database Comparable Research & Sales Analysis',
          amount: Math.round(engagementFee * 0.42),
          description: `Researching historical dealer auction sales, private treaty transactions, and secondary market listings.`,
        },
        {
          label: 'USPAP Compliant Written Valuation Certificate',
          amount: Math.round(engagementFee * 0.2),
          description: `Formally certified appraisal document signed by an accredited ASA/AMEA appraiser with calculation methodology.`,
        },
      ],
      keyDrivers: [
        `Appraisal Scope: ${values.appraisalScope.replace('_', ' ').toUpperCase()} (${values.equipmentCount.replace('_', ' ')}).`,
        `Valuation Standard: ${values.valuationStandard.replace('_', ' ').toUpperCase()} (Bank borrowing base criteria).`,
        `Accreditation: Complies with Uniform Standards of Professional Appraisal Practice (USPAP).`,
        `Delivery Timeframe: Estimated turnaround is ${turnaroundWeeks} weeks from completed inspection.`,
      ],
      costReductionTips: [
        'Organize an export of your company fixed asset ledger (listing manufacturer, serial number, and acquisition date) in advance to shave up to 15% off research time.',
        'Choose a Desktop Appraisal if the appraisal is solely for internal partner discussions or establishing insurance replacement schedules.',
        'Ensure all machines have clean, legible serial data plates visible before the appraiser arrives to avoid missing asset hold-ups.',
      ],
      benchmarks: [
        { label: 'Turnaround Time', value: `${turnaroundWeeks} Weeks` },
        { label: 'USPAP Standard', value: 'Rule 7 & 8 Compliant' },
        { label: 'Bank Acceptance', value: 'SBA & Commercial ABL' },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Equipment Appraisals & Certified Fees Are Calculated',
    paragraphs: [
      'Whether a manufacturing company is applying for a commercial bank asset-based line of credit, undergoing a partnership buyout, executing a merger, or appealing county personal property taxes, having a certified, defensible machinery appraisal is mandatory. Commercial lenders will not advance capital against self-reported balance sheet book values.',
      'Certified appraisers operate under the strict ethical and procedural rules set by the Uniform Standards of Professional Appraisal Practice (USPAP) and accredited professional bodies, primarily the American Society of Appraisers (ASA) and the Association of Machinery and Equipment Appraisers (AMEA).',
      'The single most critical concept in machinery appraisal is selecting the correct definition of value. Commercial banks and Asset-Based Lenders (ABL) almost exclusively require Orderly Liquidation Value (OLV) and Forced Liquidation Value (FLV). OLV represents the gross dollar amount that could be realized from an orderly negotiated sale over a reasonable timeframe (typically 6 to 9 months). In contrast, Mergers and Acquisitions rely on Fair Market Value in Continued Use, which values equipment as an active, integrated part of an ongoing profitable business.',
      'Pricing scales based on asset count and whether the appraisal is a full On-Site Inspection or a Desktop Appraisal. In a desktop appraisal, the client provides clear photographs, machine serial plates, hour meters, and maintenance logs. Because the appraiser does not travel to the facility, desktop appraisals cost 30% to 40% less while delivering full USPAP compliance, provided the report clearly identifies the desktop limitation scope.',
    ],
    factors: [
      {
        name: 'Asset Count & Line Item Complexity',
        impact: 'High ($2,400 to $14,000+)',
        detail: 'Researching comparable secondary market sales for 80 distinct machines requires significantly more labor than a 5-machine cell.',
      },
      {
        name: 'On-Site Inspection vs. Desktop Appraisal',
        impact: 'High (35-40% savings for desktop)',
        detail: 'Desktop valuations eliminate appraiser field days, hotel travel, and mileage fees.',
      },
      {
        name: 'Valuation Premise (OLV vs. Fair Market Value)',
        impact: 'Moderate (10-15% variance)',
        detail: 'FMV in continued use requires analyzing installation costs, utility drops, and operational integration.',
      },
      {
        name: 'Appraiser Certification Credential (ASA vs. AMEA)',
        impact: 'Moderate (10% fee differential)',
        detail: 'ASA Accredited Senior Appraisers hold the highest institutional prestige with federal courts and SBA lenders.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized precision machine shops (20 to 35 machines) typically budget between $4,200 and $6,500 for a certified on-site USPAP machinery appraisal report.',
  },
  faqs: [
    {
      question: 'What is the difference between Orderly Liquidation Value (OLV) and Fair Market Value (FMV)?',
      answer:
        'Fair Market Value (FMV) assumes a willing buyer and willing seller with neither under compulsion to buy or sell, allowing ample time for marketing. Orderly Liquidation Value (OLV) assumes the seller is compelled to liquidate the assets within a limited marketing timeframe (typically 6 to 9 months). Consequently, OLV is generally 20% to 35% lower than FMV.',
    },
    {
      question: 'Why do commercial banks require an appraisal for asset-based loans?',
      answer:
        'Banks lend money against equipment collateral based on a "borrowing base" percentage—typically advancing 75% to 85% of the appraised Net Orderly Liquidation Value (NOLV). Without an accredited USPAP appraisal, bank credit committees cannot verify collateral recovery value in the event of default.',
    },
    {
      question: 'What is a Desktop Appraisal and will our bank accept it?',
      answer:
        'In a desktop appraisal, the appraiser determines values based on equipment lists, photographs, and records provided by the client without physically visiting the site. Many banks accept desktop appraisals for refinancing existing loans or smaller lines of credit (<$500,000), but large asset-based loans usually require an on-site physical survey.',
    },
    {
      question: 'How long does a machinery appraisal report remain valid?',
      answer:
        'Most commercial lenders and audit firms consider an equipment appraisal valid for 12 months. In volatile secondary markets (such as rapid shifts in chip manufacturing or energy equipment), banks may require an abbreviated 6-month desktop update.',
    },
  ],
  relatedCalculatorIds: [
    'machinery-depreciation-hourly-rate-calculator',
    'heavy-equipment-financing-calculator',
    'heavy-equipment-rental-vs-buy-calculator',
  ],
};
