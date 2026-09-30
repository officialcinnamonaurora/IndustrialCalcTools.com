import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const industrialPumpCostGuide: CalculatorDefinition = {
  id: 'industrial-pump-selection-cost-guide',
  slug: 'industrial-pump-selection-cost-guide',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/industrial-pump-selection-cost-guide',
  name: 'Industrial Pump Selection & Cost Guide',
  metaTitle: 'Industrial Pump Selection & Cost Guide – Sizing, HP & Capital Pricing',
  metaDescription:
    'Calculate industrial pump sizing and equipment costs. Estimate centrifugal, positive displacement, and slurry pumps, motor horsepower, TDH, and turnkey installation.',
  shortDescription:
    'Calculate pump sizing, required brake horsepower (BHP), metallurgy upgrades, mechanical seal packages, and turnkey installation capital expenditure.',
  targetAudience:
    'Plant chemical engineers, municipal utility directors, process maintenance supervisors, and mechanical contractors sizing fluid handling systems.',
  featured: true,
  featuredBadge: 'Fluid Handling',
  iconName: 'Wrench',
  fields: [
    {
      id: 'pumpType',
      label: 'Pump Architecture & Hydraulic Technology',
      type: 'select',
      defaultValue: 'ansi_process',
      options: [
        { label: 'End-Suction Centrifugal (Clean water, coolant, HVAC · $4,200 base)', value: 'end_suction', baseCost: 4200, eff: 0.72 },
        { label: 'ANSI B73.1 Chemical Process Pump (Petrochemical, acid transfer · $8,800 base)', value: 'ansi_process', baseCost: 8800, eff: 0.70 },
        { label: 'Progressive Cavity / Positive Displacement (Viscous sludge, polymer · $12,500 base)', value: 'positive_displacement', baseCost: 12500, eff: 0.65 },
        { label: 'Heavy Submersible Slurry / Sump Pump (Abrasive mine tailings, grit · $16,000 base)', value: 'submersible_slurry', baseCost: 16000, eff: 0.60 },
        { label: 'Multistage High-Pressure Boiler Feed Pump (High TDH, feed water · $22,000 base)', value: 'multistage_feed', baseCost: 22000, eff: 0.75 },
      ],
      description: 'Hydraulic technology dictates pressure capabilities, solids tolerance, and baseline manufacturing tolerances.',
    },
    {
      id: 'flowRateGpm',
      label: 'Design Flow Rate (Gallons Per Minute - GPM)',
      type: 'number',
      defaultValue: 350,
      min: 10,
      max: 5000,
      step: 25,
      unit: 'GPM',
      description: 'Target continuous volumetric fluid throughput required by the manufacturing process.',
    },
    {
      id: 'totalDynamicHeadFt',
      label: 'Total Dynamic Head (TDH in Feet of Fluid)',
      type: 'number',
      defaultValue: 140,
      min: 15,
      max: 800,
      step: 10,
      unit: 'ft head',
      description: 'Sum of static elevation lift, equipment pressure requirements, and piping friction head loss.',
    },
    {
      id: 'fluidSpecificGravity',
      label: 'Fluid Specific Gravity (SG) & Viscosity',
      type: 'select',
      defaultValue: 'sg_water_10',
      options: [
        { label: 'Clean Water / Aqueous Coolant (SG: 1.00 · Low viscosity · 1.00× factor)', value: 'sg_water_10', sg: 1.0, factor: 1.0 },
        { label: 'Light Lubricating Oil / Hydrocarbon (SG: 0.85 · Medium viscosity · 1.12× factor)', value: 'sg_hydrocarbon_085', sg: 0.85, factor: 1.12 },
        { label: 'Industrial Brine / Mild Slurry (SG: 1.20 · Moderate solids · 1.28× factor)', value: 'sg_brine_12', sg: 1.2, factor: 1.28 },
        { label: 'Heavy Abrasive Slurry / Ore Pulp (SG: 1.45 · Heavy abrasive solids · 1.60× factor)', value: 'sg_slurry_145', sg: 1.45, factor: 1.6 },
      ],
      description: 'Fluid density and solids content directly govern required motor shaft power and casing erosion.',
    },
    {
      id: 'metallurgySeal',
      label: 'Wetted Metallurgy & Mechanical Seal Package',
      type: 'select',
      defaultValue: '316ss_cartridge',
      options: [
        { label: 'Cast Iron Casing / Bronze Impeller + Packing Gland (Utility baseline · 1.00×)', value: 'cast_iron_bronze', costMult: 1.0 },
        { label: '316 Stainless Steel Wet-End + Single Cartridge Mechanical Seal (1.45×)', value: '316ss_cartridge', costMult: 1.45 },
        { label: 'CD4MCu Duplex Stainless / High Chrome Iron for abrasive service (1.85×)', value: 'duplex_abrasion', costMult: 1.85 },
        { label: 'Hastelloy C / Alloy 20 + Dual Pressurized Barrier Seal Plan 53 (2.60×)', value: 'hastelloy_chemical', costMult: 2.6 },
      ],
      description: 'Corrosion and abrasion resistance dictate wet-end alloy selection and environmental seal plans.',
    },
    {
      id: 'motorDrive',
      label: 'Electric Motor Enclosure & Drive System',
      type: 'select',
      defaultValue: 'vfd_premium',
      options: [
        { label: 'TEFC Premium Efficiency Induction Motor 480V (Standard fixed speed · 1.00×)', value: 'tefc_fixed', mult: 1.0, addOn: 0 },
        { label: 'Inverter-Duty Motor + Variable Frequency Drive (VFD) Package (+$3,200)', value: 'vfd_premium', mult: 1.0, addOn: 3200 },
        { label: 'Explosion-Proof Class 1 Div 1 Hazardous Location Motor (+$5,400)', value: 'explosion_proof', mult: 1.0, addOn: 5400 },
      ],
      description: 'VFD drives allow modulating flow along the system curve without wasteful discharge throttling.',
    },
  ],
  calculate: (values) => {
    const gpm = Number(values.flowRateGpm) || 350;
    const tdh = Number(values.totalDynamicHeadFt) || 140;

    const pumpTypeData: Record<string, { baseCost: number; eff: number }> = {
      end_suction: { baseCost: 4200, eff: 0.72 },
      ansi_process: { baseCost: 8800, eff: 0.70 },
      positive_displacement: { baseCost: 12500, eff: 0.65 },
      submersible_slurry: { baseCost: 16000, eff: 0.60 },
      multistage_feed: { baseCost: 22000, eff: 0.75 },
    };
    const pumpInfo = pumpTypeData[values.pumpType] || { baseCost: 8800, eff: 0.70 };

    const sgData: Record<string, { sg: number; factor: number }> = {
      sg_water_10: { sg: 1.0, factor: 1.0 },
      sg_hydrocarbon_085: { sg: 0.85, factor: 1.12 },
      sg_brine_12: { sg: 1.2, factor: 1.28 },
      sg_slurry_145: { sg: 1.45, factor: 1.6 },
    };
    const sgInfo = sgData[values.fluidSpecificGravity] || { sg: 1.0, factor: 1.0 };

    const metalMults: Record<string, number> = {
      cast_iron_bronze: 1.0,
      '316ss_cartridge': 1.45,
      duplex_abrasion: 1.85,
      hastelloy_chemical: 2.6,
    };
    const metalMult = metalMults[values.metallurgySeal] || 1.45;

    const driveAdds: Record<string, number> = {
      tefc_fixed: 0,
      vfd_premium: 3200,
      explosion_proof: 5400,
    };
    const driveAdd = driveAdds[values.motorDrive] || 0;

    // Hydraulic Horsepower: WHP = (GPM * TDH * SG) / 3960
    const waterHp = (gpm * tdh * sgInfo.sg) / 3960;
    // Brake Horsepower: BHP = WHP / Efficiency
    const brakeHp = waterHp / pumpInfo.eff;

    // Standard motor sizing steps: 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300 HP
    const motorRatings = [3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500];
    const nominalMotorHp = motorRatings.find((m) => m >= brakeHp * 1.15) || Math.ceil(brakeHp * 1.2);

    // Motor hardware cost scaling ($75 to $110 per HP for industrial 480V 3-phase C-face)
    const motorCost = Math.round(nominalMotorHp * 95);

    // Bare pump wet-end scaling with flow and head
    const capacityScalar = Math.pow((gpm * tdh) / (100 * 100), 0.42);
    const pumpWetEndCost = Math.round(pumpInfo.baseCost * capacityScalar * metalMult);

    // Baseplate, structural mounting, and API mechanical seal plan
    const baseplateSealCost = Math.round((pumpWetEndCost + motorCost) * 0.28);

    // Turnkey mechanical and electrical installation (millwright rigging, laser alignment, piping flanges, electrical drop)
    const installationLabor = Math.round((pumpWetEndCost + motorCost + baseplateSealCost + driveAdd) * 0.38);

    const totalTurnkeyCost = pumpWetEndCost + motorCost + baseplateSealCost + driveAdd + installationLabor;

    // Annual energy operating cost: 4,000 operating hours/year at $0.11/kWh
    // kW = BHP * 0.746 / motor_eff (approx 93% motor eff)
    const powerKw = (brakeHp * 0.746) / 0.93;
    const annualEnergyCost = Math.round(powerKw * 4000 * 0.11);

    const low = Math.round(totalTurnkeyCost * 0.88);
    const high = Math.round(totalTurnkeyCost * 1.16);

    return {
      primaryLabel: `Turnkey Industrial Pump Package Investment`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalTurnkeyCost,
      frequencyLabel: `capital expenditure (${nominalMotorHp} HP motor rating)`,
      breakdown: [
        {
          label: 'Bare Pump Wet-End & Impeller Assembly',
          amount: pumpWetEndCost,
          description: `Volute casing, precision impeller, and shaft rated for ${gpm} GPM at ${tdh} ft TDH.`,
        },
        {
          label: 'Electric Motor & Baseplate Support Frame',
          amount: motorCost + baseplateSealCost,
          description: `${nominalMotorHp} HP 480V 3-phase motor, structural skid, and mechanical cartridge seal.`,
        },
        {
          label: 'Electrical Drive & Control Equipment',
          amount: driveAdd,
          description: values.motorDrive === 'vfd_premium' ? 'Variable Frequency Drive (VFD) inverter controller with 4-20mA process loop.' : 'Standard motor control starter and disconnect enclosure.',
        },
        {
          label: 'Turnkey Mechanical Rigging & Laser Alignment',
          amount: installationLabor,
          description: `Concrete pad grouting, dial indicator laser shaft alignment, and piping suction/discharge tie-in.`,
        },
      ],
      keyDrivers: [
        `Hydraulic Sizing: ${gpm} GPM @ ${tdh} ft TDH produces ${brakeHp.toFixed(1)} BHP (${nominalMotorHp} HP motor selected).`,
        `Pump Technology: ${values.pumpType.toUpperCase().replace('_', ' ')} (${Math.round(pumpInfo.eff * 100)}% hydraulic efficiency).`,
        `Annual Energy OPEX: ~$${annualEnergyCost.toLocaleString()}/yr based on 4,000 hrs/yr @ $0.11/kWh.`,
        `Life Cycle Cost (LCC) Law: Over 15 years, electrical power typically represents 75%–85% of total pump ownership cost.`,
      ],
      costReductionTips: [
        'Utilize a VFD rather than discharge throttling valves to reduce electrical consumption by 20% to 40% when operating below peak flow.',
        'Perform dual-plane laser alignment during commissioning to double the operating life of mechanical seals and ball bearings.',
        'Size suction piping one nominal pipe size larger than the pump suction nozzle to ensure adequate Net Positive Suction Head Available (NPSHa).',
      ],
      benchmarks: [
        { label: 'Hydraulic Duty', value: `${gpm} GPM / ${tdh} ft` },
        { label: 'Brake Power', value: `${brakeHp.toFixed(1)} BHP` },
        { label: 'Annual Power OPEX', value: `$${annualEnergyCost.toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Pump Sizing & Capital Costs Are Determined',
    paragraphs: [
      'Industrial pump engineering begins with hydraulic system modeling. Two foundational operating parameters govern pump selection: Design Flow Rate (expressed in Gallons Per Minute, or GPM) and Total Dynamic Head (TDH, expressed in feet of fluid). TDH represents the total equivalent height fluid must be lifted, comprising static elevation differences, process equipment backpressures, and frictional drag incurred across pipe walls, valves, and fittings.',
      'From these parameters, engineers calculate Hydraulic Water Horsepower (WHP = GPM × TDH × Specific Gravity / 3,960) and Brake Horsepower (BHP = WHP / Hydraulic Efficiency). Centrifugal process pumps operate at peak efficiencies between 65% and 82% at their Best Efficiency Point (BEP). Selecting an electric motor with an appropriate service factor (typically 1.15) ensures the motor never overheats if system friction varies.',
      'Metallurgy and mechanical seal selection heavily drive initial capital costs. While cast-iron bronze-fitted pumps serve general chilled water loops, petrochemical and chemical manufacturing demands ANSI B73.1 316 stainless steel or Hastelloy C wet-ends with specialized API seal flush plans (such as API Plan 11 or Plan 53 pressurized barrier fluid reservoirs) to eliminate hazardous volatile organic compound (VOC) emissions.',
      'According to Hydraulic Institute Life Cycle Costing (LCC) standards, initial purchase price accounts for only 10% to 15% of total lifetime pump expenditure. Electrical energy consumption represents 75% to 85% of total 15-year costs, while maintenance and seal rebuilds account for the remainder. Integrating Variable Frequency Drives (VFDs) that adjust impeller speed along affinity law curves generates substantial annual power savings compared to traditional discharge throttling.',
    ],
    factors: [
      {
        name: 'Design Flow Rate & Total Dynamic Head (TDH)',
        impact: 'High (Directly dictates pump frame & motor HP)',
        detail: 'Higher pressures require larger impeller diameters, thicker pressure casings, and larger motors.',
      },
      {
        name: 'Wetted Materials & API Mechanical Seal Plans',
        impact: 'High (1.4× to 2.6× capital multiplier)',
        detail: 'Corrosion-resistant alloys and dual pressurized barrier seals add significant component expense.',
      },
      {
        name: 'Variable Frequency Drive (VFD) Integration',
        impact: 'Moderate (Adds $3,200, saves 30% OPEX)',
        detail: 'Soft-starts motor windings and eliminates mechanical pressure relief valve bypass loops.',
      },
      {
        name: 'Turnkey Millwright Foundation & Alignment',
        impact: 'Moderate (30-40% of hardware total)',
        detail: 'Precision baseplate epoxy grouting and laser alignment prevent destructive bearing vibration.',
      },
    ],
    industryBenchmarkNote:
      'Industrial process pumps typically average $250 to $450 per installed motor horsepower, with annual electricity consumption exceeding the initial pump purchase price within 18 to 24 months of continuous operation.',
  },
  faqs: [
    {
      question: 'What is Total Dynamic Head (TDH) and how is it calculated?',
      answer:
        'Total Dynamic Head (TDH) is the total equivalent pressure head a pump must generate. It is calculated as: Static Head (vertical elevation change from fluid source to discharge point) + Pressure Head (vessel operating pressure converted to feet of fluid) + Friction Head Loss (resistance of pipes, elbows, valves, and strainers at design flow velocity).',
    },
    {
      question: 'What is Net Positive Suction Head (NPSH) and how does it prevent cavitation?',
      answer:
        'Cavitation occurs when fluid pressure at the pump suction falls below its vapor pressure, forming vapor bubbles that implode violently against the impeller. To prevent cavitation damage, the Net Positive Suction Head Available (NPSHa) from the plant piping system must exceed the pump’s required Net Positive Suction Head (NPSHr) by a safety margin of at least 3 to 5 feet.',
    },
    {
      question: 'Why is pump Life Cycle Cost (LCC) more important than initial purchase price?',
      answer:
        'Over a standard 15-year industrial pump lifecycle, electrical power consumption represents approximately 80% of total costs, maintenance and mechanical seals represent 10%, and the initial equipment purchase represents only 10%. Specifying a high-efficiency pump with a VFD often repays any price premium in under 12 months.',
    },
    {
      question: 'What is the difference between an ANSI chemical pump and a standard end-suction pump?',
      answer:
        'ANSI B73.1 pumps conform to standardized dimensional guidelines established by the American National Standards Institute. This allows process plants to swap pumps from different manufacturers without altering suction/discharge piping or baseplate bolt holes. They also feature rear pull-out designs and heavy-duty mechanical seal chambers designed for corrosive chemicals.',
    },
  ],
  relatedCalculatorIds: [
    'cnc-machine-operating-cost-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'equipment-breakdown-insurance-calculator',
  ],
};

export const airCompressorRentalCalc: CalculatorDefinition = {
  id: 'air-compressor-rental-cost-calculator',
  slug: 'air-compressor-rental-cost-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/air-compressor-rental-cost-calculator',
  name: 'Air Compressor Rental Cost Calculator',
  metaTitle: 'Air Compressor Rental Cost Calculator – Industrial CFM & Diesel Rates',
  metaDescription:
    'Calculate industrial air compressor rental costs. Model 185 to 1600 CFM units, Class 0 oil-free packages, desiccant dryers, diesel fuel, and transport freight.',
  shortDescription:
    'Estimate temporary industrial air compressor rental rates across CFM sizes, oil-free Class 0 configurations, desiccant dryers, and on-site fuel costs.',
  targetAudience:
    'Plant turnaround managers, sandblasting contractors, refinery maintenance planners, and packaging facility engineers managing air system outages.',
  featured: true,
  featuredBadge: 'Utility Rental',
  iconName: 'Wrench',
  fields: [
    {
      id: 'compressorCapacity',
      label: 'Compressed Air Capacity & Pressure (CFM @ 100-150 PSI)',
      type: 'select',
      defaultValue: 'cfm_375',
      options: [
        { label: '185 CFM Towable Utility (Sandblasting, air tools · $165/day · $1,650/mo)', value: 'cfm_185', dayRate: 165, weekRate: 520, monthRate: 1650, fuelGph: 3.2 },
        { label: '375 CFM Industrial Rotary Screw (Plant backup, shotcrete · $285/day · $2,850/mo)', value: 'cfm_375', dayRate: 285, weekRate: 890, monthRate: 2850, fuelGph: 6.5 },
        { label: '750 CFM Heavy Industrial (High-volume manufacturing, blasting · $520/day · $5,200/mo)', value: 'cfm_750', dayRate: 520, weekRate: 1650, monthRate: 5200, fuelGph: 12.8 },
        { label: '1,600 CFM High-Volume Plant Header (Full factory shutdown bypass · $1,150/day · $11,500/mo)', value: 'cfm_1600', dayRate: 1150, weekRate: 3600, monthRate: 11500, fuelGph: 26.5 },
      ],
      description: 'Air flow rate measured in Cubic Feet per Minute (CFM) at standard 100–125 PSI plant header pressures.',
    },
    {
      id: 'airPurityGrade',
      label: 'Air Purity & Oil-Free Certification',
      type: 'select',
      defaultValue: 'instrument_oil_free',
      options: [
        { label: 'Standard Industrial Diesel Rotary Screw (General pneumatic tools · 1.00×)', value: 'standard_rotary', mult: 1.0 },
        { label: '100% Oil-Free Class 0 Rotary Screw (Food, pharma, electronics, paint · 1.55×)', value: 'instrument_oil_free', mult: 1.55 },
        { label: 'Electric Stationary Skid 480V 3-Phase (Zero on-site emissions · 1.20×)', value: 'electric_skid', mult: 1.2 },
      ],
      description: 'ISO 8573-1 Class 0 oil-free air prevents catastrophic lubricant contamination in sensitive production streams.',
    },
    {
      id: 'rentalDuration',
      label: 'Rental Duration Commitment',
      type: 'select',
      defaultValue: 'month_1',
      options: [
        { label: 'Daily Rental (1 to 4 Days)', value: 'daily_3', days: 3, unit: 'daily' },
        { label: 'Weekly Rental (1 to 3 Weeks)', value: 'weekly_2', weeks: 2, unit: 'weekly' },
        { label: '1 Month (4-Week Industrial Rental Cycle)', value: 'month_1', months: 1, unit: 'monthly' },
        { label: '3-Month Plant Outage / Major Capital Overhaul', value: 'month_3', months: 3, unit: 'monthly' },
      ],
      description: 'Standard equipment rental terms bill on 4-week (28-day) cycles.',
    },
    {
      id: 'airDryerFiltration',
      label: 'Auxiliary Air Treatment & Desiccant Dryers',
      type: 'select',
      defaultValue: 'desiccant_minus40',
      options: [
        { label: 'None (Compressor internal aftercooler only · +$0)', value: 'none', feePerMo: 0 },
        { label: 'Refrigerated Air Dryer (+38°F Pressure Dew Point · +$750/mo)', value: 'refrigerated', feePerMo: 750 },
        { label: 'Heated Desiccant Dryer (-40°F Pressure Dew Point · +$1,650/mo)', value: 'desiccant_minus40', feePerMo: 1650 },
        { label: 'Desiccant Dryer + Dual Coalescing Particle Filters (+$2,200/mo)', value: 'desiccant_filters', feePerMo: 2200 },
      ],
      description: 'Desiccant dryers strip moisture down to -40°F pressure dew point to prevent air line condensation.',
    },
    {
      id: 'fuelManagement',
      label: 'Fuel Supply & Operating Mode (Diesel Units)',
      type: 'select',
      defaultValue: 'user_fueled',
      options: [
        { label: 'Customer-Supplied Fuel (User purchases off-road diesel · $3.65/gal)', value: 'user_fueled', costPerGal: 3.65 },
        { label: 'Turnkey On-Site Fuel Service (Rental company automated fuel truck · $4.85/gal)', value: 'fuel_service', costPerGal: 4.85 },
      ],
      description: 'Off-road non-taxed red dye diesel consumed under typical 65% plant loading cycles.',
    },
  ],
  calculate: (values) => {
    const capData: Record<string, { dayRate: number; weekRate: number; monthRate: number; fuelGph: number }> = {
      cfm_185: { dayRate: 165, weekRate: 520, monthRate: 1650, fuelGph: 3.2 },
      cfm_375: { dayRate: 285, weekRate: 890, monthRate: 2850, fuelGph: 6.5 },
      cfm_750: { dayRate: 520, weekRate: 1650, monthRate: 5200, fuelGph: 12.8 },
      cfm_1600: { dayRate: 1150, weekRate: 3600, monthRate: 11500, fuelGph: 26.5 },
    };
    const cap = capData[values.compressorCapacity] || capData.cfm_375;

    const purityMults: Record<string, number> = {
      standard_rotary: 1.0,
      instrument_oil_free: 1.55,
      electric_skid: 1.2,
    };
    const purityMult = purityMults[values.airPurityGrade] || 1.55;

    const dryerFees: Record<string, number> = {
      none: 0,
      refrigerated: 750,
      desiccant_minus40: 1650,
      desiccant_filters: 2200,
    };
    const monthlyDryer = dryerFees[values.airDryerFiltration] || 0;

    const fuelPrices: Record<string, number> = {
      user_fueled: 3.65,
      fuel_service: 4.85,
    };
    const fuelPrice = fuelPrices[values.fuelManagement] || 3.65;

    let baseRental = 0;
    let dryerTotal = 0;
    let operatingHours = 0;
    let durationLabel = '';

    if (values.rentalDuration === 'daily_3') {
      baseRental = cap.dayRate * 3 * purityMult;
      dryerTotal = (monthlyDryer / 28) * 3;
      operatingHours = 3 * 8; // 24 operating hours
      durationLabel = '3-Day Rapid Rental';
    } else if (values.rentalDuration === 'weekly_2') {
      baseRental = cap.weekRate * 2 * purityMult;
      dryerTotal = (monthlyDryer / 4) * 2;
      operatingHours = 10 * 8; // 80 operating hours
      durationLabel = '2-Week Rental';
    } else if (values.rentalDuration === 'month_3') {
      baseRental = cap.monthRate * 3 * purityMult;
      dryerTotal = monthlyDryer * 3;
      operatingHours = 60 * 10; // 600 operating hours
      durationLabel = '3-Month Outage Rental';
    } else {
      // 1 Month default
      baseRental = cap.monthRate * purityMult;
      dryerTotal = monthlyDryer;
      operatingHours = 20 * 10; // 200 operating hours
      durationLabel = '1-Month (4-Week) Rental';
    }

    // Round base equipment
    baseRental = Math.round(baseRental);
    dryerTotal = Math.round(dryerTotal);

    // Fuel expense (assuming diesel unit running at 65% average capacity factor)
    const isElectric = values.airPurityGrade === 'electric_skid';
    let energyCost = 0;
    if (isElectric) {
      // Electric utility consumption (approx 0.18 kWh per CFM-hour)
      const cfmNum = values.compressorCapacity === 'cfm_185' ? 185 : values.compressorCapacity === 'cfm_375' ? 375 : values.compressorCapacity === 'cfm_750' ? 750 : 1600;
      energyCost = Math.round(cfmNum * 0.18 * operatingHours * 0.11);
    } else {
      energyCost = Math.round(cap.fuelGph * 0.65 * operatingHours * fuelPrice);
    }

    // Mobilization freight delivery, setup and heavy rubber bull hoses
    const freightDelivery = values.compressorCapacity === 'cfm_1600' ? 1850 : 850;

    const totalProjectCost = baseRental + dryerTotal + energyCost + freightDelivery;

    const low = Math.round(totalProjectCost * 0.90);
    const high = Math.round(totalProjectCost * 1.15);

    return {
      primaryLabel: `Total Estimated Compressor Rental Cost`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalProjectCost,
      frequencyLabel: `${durationLabel} (${operatingHours} est. operating hours)`,
      breakdown: [
        {
          label: 'Primary Compressor Machine Rental',
          amount: baseRental,
          description: `${values.compressorCapacity.replace('cfm_', '')} CFM unit with ${values.airPurityGrade.replace('_', ' ')} package.`,
        },
        {
          label: 'Desiccant Dryer & Air Filtration Skid',
          amount: dryerTotal,
          description: values.airDryerFiltration === 'none' ? 'Standard aftercooler only.' : `${values.airDryerFiltration.replace('_', ' ')} package preventing downstream pipeline moisture.`,
        },
        {
          label: isElectric ? 'Electric Utility Energy Charge' : 'Diesel Fuel Operating Consumption',
          amount: energyCost,
          description: isElectric ? `Electricity for ${operatingHours} operating hours.` : `Estimated ${Math.round(cap.fuelGph * 0.65 * operatingHours)} gallons of diesel @ $${fuelPrice}/gal.`,
        },
        {
          label: 'Transport Freight, Drop-Off & Rigging',
          amount: freightDelivery,
          description: `Flatbed freight delivery, heavy air bull-hose connection, and pre-start fluid checks.`,
        },
      ],
      keyDrivers: [
        `Capacity Sizing: ${values.compressorCapacity.replace('cfm_', '')} CFM header volume (${cap.fuelGph} GPH full-load fuel burn).`,
        `Purity Spec: ${values.airPurityGrade.toUpperCase().replace('_', ' ')} (${purityMult}× rental premium).`,
        `Air Quality: ${dryerTotal > 0 ? 'Includes -40°F dew point desiccant drying' : 'Raw ambient aftercooled air'}.`,
        `Fuel vs. Bare Rate: On long-term rentals, diesel fuel often exceeds the bare equipment rental rate.`,
      ],
      costReductionTips: [
        'If 480V 3-phase power is available on-site, rent an electric compressor skid to cut energy costs by 50% compared to diesel fuel.',
        'Commit to a monthly 4-week billing rate rather than extending weekly rentals, which saves 25% to 35% on daily equivalent costs.',
        'Verify plant pneumatic leakage before sizing; compressed air system leaks frequently waste 20% to 30% of total compressor output.',
      ],
      benchmarks: [
        { label: 'Duration Basis', value: durationLabel },
        { label: 'Weekly Equivalent', value: `$${Math.round(totalProjectCost / (operatingHours / 40 || 1)).toLocaleString()}/wk` },
        { label: 'Fuel Burn Rate', value: isElectric ? 'Electric Drive' : `${(cap.fuelGph * 0.65).toFixed(1)} gal/hr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Air Compressor Rental Rates Are Calculated',
    paragraphs: [
      'Industrial plants rely on temporary air compressor rentals during scheduled preventative maintenance turnarounds, unexpected rotary screw breakdowns, seasonal production surges, or facility expansions. Sizing a rental compressor requires evaluating two critical engineering metrics: Cubic Feet per Minute (CFM) volumetric demand and operating discharge pressure (typically 100 to 125 PSIG for plant tools, or up to 150 PSIG for heavy sandblasting).',
      'Air purity classification dramatically impacts rental rates. Standard diesel-driven oil-flooded rotary screw compressors introduce minute quantities of lubricating oil into the air stream (1 to 3 PPM). For food packaging, pharmaceutical processing, sterile cleanrooms, and automotive paint booths, oil contamination can ruin hundreds of thousands of dollars in product. These industries mandate ISO 8573-1 Class 0 100% Oil-Free compressors, which utilize specialized teflon-coated rotors and non-lubricated air chambers, carrying a 50% to 60% rental rate premium.',
      'Moisture management represents another essential cost component. Hot compressed air exiting a compressor contains high ambient humidity that condenses inside plant distribution headers, causing pneumatic cylinder corrosion and freezing in winter. Rental packages typically include external Desiccant Air Dryers with dual twin-tower desiccant beds that suppress pressure dew points to -40°F, accompanied by particulate coalescing filters to remove sub-micron dust.',
      'Operating fuel consumption is frequently the largest single expense on multi-week rentals. A 750 CFM diesel compressor running 10 hours per day consumes roughly 80 to 90 gallons of off-road diesel daily, equating to over $300 per day in fuel alone. Where high-amperage 480-volt electrical substations are accessible, renting stationary electric-drive compressor skids eliminates diesel exhaust emissions and reduces energy operating costs by half.',
    ],
    factors: [
      {
        name: 'CFM Output & Frame Size',
        impact: 'High ($1,650/mo for 185 CFM to $11,500/mo for 1,600 CFM)',
        detail: 'Higher air volumes require larger multi-stage rotors and heavier diesel powerplants.',
      },
      {
        name: 'Class 0 Oil-Free Certification',
        impact: 'High (50% to 60% price premium)',
        detail: 'Guarantees zero hydrocarbon vapor transfer for food, beverage, and medical manufacturing.',
      },
      {
        name: '-40°F Desiccant Air Dryers',
        impact: 'Moderate (Adds $1,200 to $2,200/month)',
        detail: 'Mandatory to prevent pneumatic valve freeze-up and pipeline water condensation.',
      },
      {
        name: 'Diesel Fuel Consumption',
        impact: 'High ($300 to $1,000+ per operating day)',
        detail: 'Fuel charges quickly outstrip bare rental rates during continuous 24/7 shutdown operations.',
      },
    ],
    industryBenchmarkNote:
      'Standard industrial rotary screw rentals range from $2,800 to $5,500 per month for 375–750 CFM units, with fuel and desiccant drying packages typically doubling the total project operational expense.',
  },
  faqs: [
    {
      question: 'What is the difference between an oil-flooded and an oil-free Class 0 compressor?',
      answer:
        'In an oil-flooded compressor, oil is injected directly into the compression chamber to seal rotor clearances, lubricate bearings, and remove heat. Even with downstream coalescing filters, trace oil vapors can pass into the air line. In an oil-free Class 0 compressor, the rotors never contact oil, ensuring 100% hydrocarbon-free air for food, medical, and spray finishing processes.',
    },
    {
      question: 'Why do I need a desiccant air dryer instead of a standard refrigerated dryer?',
      answer:
        'Refrigerated dryers chill air to approximately +38°F, which is adequate for indoor warm environments. However, if compressed air lines run outdoors or in unheated warehouses during winter, temperatures below +38°F will cause water to condense and freeze inside pipes. Desiccant dryers achieve -40°F dew points, ensuring air lines remain bone-dry.',
    },
    {
      question: 'Can I power a rental air compressor using plant 480V electricity instead of diesel?',
      answer:
        'Yes. Equipment rental suppliers offer stationary electric-drive compressor skids. If your facility has sufficient spare breaker capacity (typically 100A to 400A at 480V 3-phase), electric compressors eliminate diesel refueling logistics, run much quieter, produce zero emissions indoors, and cut energy expenses by 40% to 60%.',
    },
    {
      question: 'How many pneumatic tools can a 375 CFM compressor support?',
      answer:
        'A 375 CFM compressor can simultaneously power approximately 8 to 10 standard 90-lb pavement breakers (35–40 CFM each), 2 continuous industrial sandblasting nozzles (with #5 or #6 orifices requiring 120–160 CFM each), or an entire mid-sized CNC machining and automated packaging plant header.',
    },
  ],
  relatedCalculatorIds: [
    'crane-rental-cost-estimator',
    'scaffolding-rental-cost-estimator',
    'equipment-breakdown-insurance-calculator',
  ],
};

export const industrialWaterTreatmentCalc: CalculatorDefinition = {
  id: 'industrial-water-treatment-cost-calculator',
  slug: 'industrial-water-treatment-cost-calculator',
  categoryId: 'compliance',
  path: '/compliance/industrial-water-treatment-cost-calculator',
  name: 'Industrial Water Treatment Cost Calculator',
  metaTitle: 'Industrial Water Treatment Cost Calculator – Boiler, Cooling & RO OPEX',
  metaDescription:
    'Calculate industrial water treatment capital and annual chemical OPEX. Model cooling towers, boiler feedwater demineralization, Reverse Osmosis, and NPDES sewer compliance.',
  shortDescription:
    'Estimate annual chemical consumables, filtration membranes, municipal sewer surcharges, and capital costs for industrial process water and wastewater systems.',
  targetAudience:
    'Plant environmental compliance managers, boiler plant operators, utility directors, and food/beverage processing engineers optimizing water OPEX.',
  featured: false,
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'treatmentObjective',
      label: 'Water Treatment Application & Process Objective',
      type: 'select',
      defaultValue: 'cooling_tower',
      options: [
        { label: 'Cooling Tower Water (Evaporative scale, biocide, Legionella control · $2.20/kgal)', value: 'cooling_tower', chemPerKgal: 2.2, capBase: 28000 },
        { label: 'High-Pressure Boiler Feedwater (Demineralization, oxygen scavenging · $4.80/kgal)', value: 'boiler_feed', chemPerKgal: 4.8, capBase: 45000 },
        { label: 'Industrial Wastewater Pretreatment (Heavy metals, pH neutralization · $6.50/kgal)', value: 'wastewater_pre', chemPerKgal: 6.5, capBase: 65000 },
        { label: 'High-Purity Reverse Osmosis / EDI (Semiconductor, pharmaceutical · $5.40/kgal)', value: 'reverse_osmosis', chemPerKgal: 5.4, capBase: 85000 },
      ],
      description: 'System objective dictates chemical chemistry, filtration pore size, and regulatory monitoring standards.',
    },
    {
      id: 'dailyWaterVolumeGpd',
      label: 'Daily Water Volume Throughput (Gallons Per Day - GPD)',
      type: 'number',
      defaultValue: 35000,
      min: 1000,
      max: 500000,
      step: 2500,
      unit: 'GPD',
      description: 'Total daily volumetric water consumption or wastewater effluent volume treated.',
    },
    {
      id: 'influentTdsPpm',
      label: 'Raw Influent Water Hardness / Total Dissolved Solids (TDS)',
      type: 'select',
      defaultValue: 'moderate_hard_450',
      options: [
        { label: 'Low TDS Municipal Supply (<150 PPM TDS · 0.85× chemical load)', value: 'low_soft_150', mult: 0.85 },
        { label: 'Moderate Hard Groundwater (300 to 500 PPM TDS · 1.00× standard baseline)', value: 'moderate_hard_450', mult: 1.0 },
        { label: 'High Hardness / Brackish Well (700 to 1,200 PPM TDS · 1.45× factor)', value: 'high_hard_900', mult: 1.45 },
        { label: 'Heavy Industrial Process Effluent (2,500+ PPM TDS · 1.95× heavy load)', value: 'extreme_tds_2500', mult: 1.95 },
      ],
      description: 'Higher dissolved mineral concentrations accelerate boiler scaling and require increased antiscalant dosage.',
    },
    {
      id: 'automationPackage',
      label: 'Chemical Dosing & Sensor Automation Package',
      type: 'select',
      defaultValue: 'automated_orp_ph',
      options: [
        { label: 'Manual Batch Chemical Mixing & Manual Dip Tests (High labor, lower Capex · $0)', value: 'manual', addCap: 0, addOpexMult: 1.25 },
        { label: 'Automated Microprocessor Controllers (Continuous pH/ORP/Conductivity · +$12,000)', value: 'automated_orp_ph', addCap: 12000, addOpexMult: 1.0 },
        { label: 'IoT Smart Cloud Monitoring with Remote Telemetry & Auto Blowdown (+$24,000)', value: 'iot_cloud', addCap: 24000, addOpexMult: 0.9 },
      ],
      description: 'Automated bleed and feed controllers maintain optimal cycles of concentration without over-feeding expensive chemicals.',
    },
    {
      id: 'complianceDischarge',
      label: 'NPDES / Municipal Sewer Surcharge Classification',
      type: 'select',
      defaultValue: 'potw_surcharge',
      options: [
        { label: 'Direct Surface Discharge (NPDES Permit with stringent EPA limits · +$8,500/yr testing)', value: 'npdes_direct', annualAudit: 8500 },
        { label: 'Publicly Owned Treatment Works (POTW) Sewer with BOD/TSS Surcharges (+$4,200/yr)', value: 'potw_surcharge', annualAudit: 4200 },
        { label: 'Zero Liquid Discharge (ZLD) / Closed-Loop Internal Recirculation (+$1,500/yr testing)', value: 'zld_closed', annualAudit: 1500 },
      ],
      description: 'Discharge destination dictates mandated environmental lab testing and municipal high-strength surcharges.',
    },
  ],
  calculate: (values) => {
    const gpd = Number(values.dailyWaterVolumeGpd) || 35000;
    const annualGallons = gpd * 365;
    const annualKgal = annualGallons / 1000;

    const objData: Record<string, { chemPerKgal: number; capBase: number }> = {
      cooling_tower: { chemPerKgal: 2.2, capBase: 28000 },
      boiler_feed: { chemPerKgal: 4.8, capBase: 45000 },
      wastewater_pre: { chemPerKgal: 6.5, capBase: 65000 },
      reverse_osmosis: { chemPerKgal: 5.4, capBase: 85000 },
    };
    const obj = objData[values.treatmentObjective] || objData.cooling_tower;

    const tdsMults: Record<string, number> = {
      low_soft_150: 0.85,
      moderate_hard_450: 1.0,
      high_hard_900: 1.45,
      extreme_tds_2500: 1.95,
    };
    const tdsMult = tdsMults[values.influentTdsPpm] || 1.0;

    const autoData: Record<string, { addCap: number; addOpexMult: number }> = {
      manual: { addCap: 0, addOpexMult: 1.25 },
      automated_orp_ph: { addCap: 12000, addOpexMult: 1.0 },
      iot_cloud: { addCap: 24000, addOpexMult: 0.9 },
    };
    const auto = autoData[values.automationPackage] || autoData.automated_orp_ph;

    const compAudit: Record<string, number> = {
      npdes_direct: 8500,
      potw_surcharge: 4200,
      zld_closed: 1500,
    };
    const auditCost = compAudit[values.complianceDischarge] || 4200;

    // Chemical OPEX: scale inhibitors, oxidizing/non-oxidizing biocides, oxygen scavengers, polymers
    const baseChemOpex = annualKgal * obj.chemPerKgal * tdsMult * auto.addOpexMult;
    const annualChemicals = Math.round(baseChemOpex);

    // Media & consumables (RO membrane replacement, resin bed regeneration salt, cartridge filters)
    const mediaConsumables = Math.round(annualChemicals * 0.32);

    // Capital system equipment scaling
    const volumeScalar = Math.pow(gpd / 25000, 0.48);
    const capitalEquipment = Math.round(obj.capBase * volumeScalar + auto.addCap);

    // Total Annual Operating Expense (OPEX)
    const totalAnnualOpex = annualChemicals + mediaConsumables + auditCost;
    const costPerKgal = Number((totalAnnualOpex / annualKgal).toFixed(2));

    const low = Math.round(totalAnnualOpex * 0.88);
    const high = Math.round(totalAnnualOpex * 1.18);

    return {
      primaryLabel: `Total Annual Water Treatment OPEX`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnualOpex,
      frequencyLabel: `per year ($${costPerKgal}/1,000 gallons treated)`,
      breakdown: [
        {
          label: 'Chemical Treatment Formulations & Biocides',
          amount: annualChemicals,
          description: `Corrosion inhibitors, scale dispersants, microbicides, and pH neutralizing chemistry.`,
        },
        {
          label: 'Filtration Media, Resin & Membrane Replacement',
          amount: mediaConsumables,
          description: `RO membrane elements, softener salt regeneration brine, and cartridge sediment filters.`,
        },
        {
          label: 'Compliance Testing & Environmental Lab Profiling',
          amount: auditCost,
          description: `Mandated NPDES effluent composite sampling, heavy metal profiling, and POTW sewer reporting.`,
        },
      ],
      keyDrivers: [
        `Annual Throughput: ${(annualGallons / 1e6).toFixed(2)} Million Gallons treated per year (${gpd.toLocaleString()} GPD).`,
        `Effective Treatment Cost: $${costPerKgal} per 1,000 gallons (kgal).`,
        `Capital Equipment Budget: ~$${capitalEquipment.toLocaleString()} for skid, dosing skids, and probes.`,
        `Energy & Scale ROI: Just 1/32" of scale deposit inside boiler or chiller tubes increases fuel energy costs by 8% to 12%.`,
      ],
      costReductionTips: [
        'Increase cooling tower cycles of concentration from 3 to 6 using automated conductivity bleed controllers to save 20% on water utility bills.',
        'Implement an automated biocide alternation program (oxidizing vs. non-oxidizing) to prevent biological biofilm resistance without over-dosing.',
        'Install RO permeate recycling on rinse baths to recapture up to 70% of treated effluent for upstream utility processes.',
      ],
      benchmarks: [
        { label: 'OPEX / 1k Gallons', value: `$${costPerKgal}` },
        { label: 'Annual Chemical OPEX', value: `$${annualChemicals.toLocaleString()}/yr` },
        { label: 'Capital Skid Budget', value: `$${capitalEquipment.toLocaleString()}` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Water Treatment & Compliance Costs Are Calculated',
    paragraphs: [
      'Water is the lifeblood of modern industrial manufacturing—acting as a thermal heat transfer fluid in cooling towers, high-energy steam in industrial boilers, an ultra-pure solvent in semiconductor fabrication, or a carrier of chemical waste. However, untreated municipal or well water contains dissolved calcium, magnesium, silica, and microbiological organisms that cause rapid scale crystallization, oxygen pitting corrosion, and biofilm accumulation.',
      'Water treatment costs divide into initial Capital Expenditure (skid-mounted reverse osmosis units, dual-bed water softeners, chemical feed pumps, and digital blowdown controllers) and continuous Operating Expenditure (chemical inhibitors, biocides, acid/caustic, replacement membranes, and environmental lab analysis). OPEX is calculated on a per-thousand-gallon (kgal) basis, typically ranging from $2.50 to $7.00 per 1,000 gallons depending on raw influent water hardness.',
      'In cooling towers, mineral concentrations rise as pure water evaporates. Operating at higher Cycles of Concentration (CoC) reduces makeup water consumption and municipal sewer discharge. However, running high cycles without adequate phosphonate scale inhibitors causes calcium carbonate to precipitate onto heat exchanger tubes. Even a microscopic scale layer of 0.03 inches insulates heat transfer surfaces, inflating plant refrigeration chiller electrical power consumption by over 10%.',
      'Environmental discharge regulations present another substantial cost consideration. Discharging process water into municipal sewers is governed by Publicly Owned Treatment Works (POTW) pretreatment standards. Exceeding limits for Biochemical Oxygen Demand (BOD), Total Suspended Solids (TSS), or heavy metals triggers punitive monthly municipal sewer surcharges, making automated pH neutralization and clarifier coagulant dosing an essential financial safeguard.',
    ],
    factors: [
      {
        name: 'Process Objective (Cooling vs. Boiler vs. Wastewater)',
        impact: 'High ($2.20/kgal cooling vs $6.50/kgal wastewater)',
        detail: 'Boiler and wastewater treatment require specialized scavenging chemicals and precision polymer dosing.',
      },
      {
        name: 'Influent Hardness & Total Dissolved Solids (TDS)',
        impact: 'High (Up to 95% chemical dosage increase)',
        detail: 'Hard groundwater supplies require heavier antiscalant and ion-exchange salt consumption.',
      },
      {
        name: 'Automated Blowdown & Smart Controllers',
        impact: 'Moderate (Saves 10-20% on water & chemicals)',
        detail: 'Conductivity sensors bleed tower basins only when necessary, preventing chemical wash-out.',
      },
      {
        name: 'Municipal POTW Sewer Surcharges',
        impact: 'Moderate ($4,000 to $25,000/year)',
        detail: 'Pretreating effluent prevents high-strength municipal sewer surcharges for high BOD or acidity.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing plants typically budget $35,000 to $95,000 annually for water treatment chemical programs, earning a 300%+ ROI through boiler tube failure prevention and reduced water consumption.',
  },
  faqs: [
    {
      question: 'What are "Cycles of Concentration" in a cooling tower and why do they matter?',
      answer:
        'Cycles of Concentration (CoC) measures how many times dissolved solids concentrate in the recirculating cooling water compared to the incoming raw makeup water. Increasing cycles from 2 to 5 reduces tower blowdown by over 60%, drastically cutting water utility bills and chemical replenishment requirements.',
    },
    {
      question: 'How does water treatment protect industrial boilers from catastrophic failure?',
      answer:
        'Without proper deaeration and chemical oxygen scavengers (such as sodium sulfite), dissolved oxygen in feedwater causes severe localized pitting that can penetrate steel boiler tubes in months. Furthermore, scale deposits insulate the tube metal from cooling water, causing the steel to overheat, blister, and explode under operating pressure.',
    },
    {
      question: 'What is ASHRAE Standard 188 regarding Legionella control in cooling towers?',
      answer:
        'ASHRAE 188 mandates that commercial and industrial facilities with evaporative cooling towers maintain a formal Water Management Program (WMP). This includes routine biocide disinfection protocols, drift eliminator maintenance, and microbiological water testing to prevent Legionella pneumophila bacterial outbreaks.',
    },
    {
      question: 'When is Reverse Osmosis (RO) preferred over traditional ion-exchange softening?',
      answer:
        'Ion-exchange softeners replace calcium and magnesium with sodium ions, preventing scale but leaving total dissolved solids (TDS) unchanged. Reverse Osmosis physically removes 98%+ of all dissolved minerals and silica, making it essential for high-pressure steam boilers (>600 PSI), electronics fabrication, and food processing.',
    },
  ],
  relatedCalculatorIds: [
    'boiler-insurance-calculator',
    'boiler-inspection-cost-calculator',
    'industrial-waste-disposal-cost-by-state',
  ],
};

export const epaHazardousWasteCalc: CalculatorDefinition = {
  id: 'epa-hazardous-waste-compliance-cost-calculator',
  slug: 'epa-hazardous-waste-compliance-cost-calculator',
  categoryId: 'compliance',
  path: '/compliance/epa-hazardous-waste-compliance-cost-calculator',
  name: 'EPA Hazardous Waste Compliance Cost Calculator',
  metaTitle: 'EPA Hazardous Waste Compliance Cost Calculator – RCRA Drum & TSDF Costs',
  metaDescription:
    'Calculate EPA RCRA hazardous waste compliance and disposal costs. Model VSQG, SQG, and LQG generator tiers, drum profiling, hazardous transport, and penalty avoidance.',
  shortDescription:
    'Calculate annual EPA Resource Conservation and Recovery Act (RCRA) compliance budgets, TSDF drum disposal fees, lab profiling, and contingency plan expenses.',
  targetAudience:
    'EHS directors, environmental compliance engineers, chemical plant managers, and manufacturing plant executives managing regulated waste streams.',
  featured: false,
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'generatorStatus',
      label: 'EPA RCRA Hazardous Waste Generator Classification',
      type: 'select',
      defaultValue: 'sqg_tier',
      options: [
        { label: 'Very Small Quantity Generator (VSQG: <220 lbs or ~half-drum/month · 0.80× base)', value: 'vsqg_tier', mult: 0.8, reqLevel: 'Minimal' },
        { label: 'Small Quantity Generator (SQG: 220 to 2,200 lbs or 1 to 5 drums/month · 1.00× standard)', value: 'sqg_tier', mult: 1.0, reqLevel: 'Standard' },
        { label: 'Large Quantity Generator (LQG: >2,200 lbs or >5 drums/month · 1.55× regulatory rigor)', value: 'lqg_tier', mult: 1.55, reqLevel: 'Comprehensive' },
      ],
      description: 'Monthly generation volume dictates statutory accumulation time limits (180 days for SQG vs 90 days for LQG).',
    },
    {
      id: 'monthlyDrumVolume',
      label: 'Regulated Hazardous Waste Volume (55-Gallon Drums / Month)',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 60,
      step: 1,
      unit: 'drums/mo',
      description: 'Average monthly generation of RCRA-regulated liquid, sludge, or solid hazardous waste.',
    },
    {
      id: 'wasteCharacterization',
      label: 'Primary Waste Stream Characteristic & Hazard Class',
      type: 'select',
      defaultValue: 'd001_solvents',
      options: [
        { label: 'D001 Ignitable / Flammable Liquids & Spent Thinners ($320/drum disposal)', value: 'd001_solvents', costPerDrum: 320 },
        { label: 'D002 Corrosive Waste (Spent plating acids & caustic pickling baths · $380/drum)', value: 'd002_corrosive', costPerDrum: 380 },
        { label: 'D004–D043 Toxic Metal Sludge (TCLP lead, cadmium, chrome, solvents · $480/drum)', value: 'd_toxic_metals', costPerDrum: 480 },
        { label: 'F-Code Listed Solvent Blends & High-Temperature Incineration Waste ($650/drum)', value: 'f_listed_incineration', costPerDrum: 650 },
      ],
      description: 'Waste stream chemistry determines whether disposal occurs via fuel blending, neutralization, or hazardous incineration.',
    },
    {
      id: 'labProfilingTesting',
      label: 'Analytical Testing & Waste Characterization Frequency',
      type: 'select',
      defaultValue: 'annual_tclp',
      options: [
        { label: 'Generator Knowledge / Profile Renewal Only (Minimal re-testing · $750/yr)', value: 'minimal_profile', labCost: 750 },
        { label: 'Annual Certified Lab TCLP Metal & VOC Analytical Testing (+$2,400/yr)', value: 'annual_tclp', labCost: 2400 },
        { label: 'Quarterly Multi-Stream Analytical Profiling + Fingerprint Testing (+$5,800/yr)', value: 'quarterly_tclp', labCost: 5800 },
      ],
      description: 'Certified analytical testing (Toxicity Characteristic Leaching Procedure) proves waste classification to TSDF facilities.',
    },
    {
      id: 'secondaryContainment',
      label: 'Storage Infrastructure, Spill Kits & Contingency Plan',
      type: 'select',
      defaultValue: 'standard_containment',
      options: [
        { label: 'Poly Spill Pallets & Standard RCRA Emergency Plan (1.00× factor)', value: 'standard_containment', fee: 1200 },
        { label: 'Outdoor Fire-Rated Hazmat Drum Storage Building + Formal Written Contingency Plan', value: 'engineered_building', fee: 4500 },
      ],
      description: 'EPA mandates liquid secondary containment holding at least 10% of total container volume.',
    },
  ],
  calculate: (values) => {
    const drumsPerMonth = Number(values.monthlyDrumVolume) || 4;
    const annualDrums = drumsPerMonth * 12;

    const genData: Record<string, { mult: number; reqLevel: string }> = {
      vsqg_tier: { mult: 0.8, reqLevel: 'Minimal' },
      sqg_tier: { mult: 1.0, reqLevel: 'Standard' },
      lqg_tier: { mult: 1.55, reqLevel: 'Comprehensive' },
    };
    const gen = genData[values.generatorStatus] || genData.sqg_tier;

    const wasteData: Record<string, number> = {
      d001_solvents: 320,
      d002_corrosive: 380,
      d_toxic_metals: 480,
      f_listed_incineration: 650,
    };
    const drumCost = wasteData[values.wasteCharacterization] || 320;

    const labData: Record<string, number> = {
      minimal_profile: 750,
      annual_tclp: 2400,
      quarterly_tclp: 5800,
    };
    const labTesting = labData[values.labProfilingTesting] || 2400;

    const infraData: Record<string, number> = {
      standard_containment: 1200,
      engineered_building: 4500,
    };
    const infraCost = infraData[values.secondaryContainment] || 1200;

    // Direct TSDF transportation & disposal costs
    // Transporter stop fee ~$450 per pickup run (every 90-180 days)
    const pickupsPerYear = values.generatorStatus === 'lqg_tier' ? 4 : 2;
    const transportFees = pickupsPerYear * 550;
    const directDisposal = annualDrums * drumCost;

    // Regulatory administration: EPA Biennial Reporting, e-Manifest system fees, weekly inspection logs
    const adminFees = Math.round(1800 * gen.mult);

    // Employee annual RCRA hazardous waste & DOT hazmat training
    const trainingPpe = Math.round(1400 * gen.mult);

    const totalAnnualCost = directDisposal + transportFees + labTesting + infraCost + adminFees + trainingPpe;
    const costPerDrumAllIn = Math.round(totalAnnualCost / annualDrums);

    const low = Math.round(totalAnnualCost * 0.88);
    const high = Math.round(totalAnnualCost * 1.16);

    return {
      primaryLabel: `Total Annual RCRA Hazardous Waste Compliance Cost`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnualCost,
      frequencyLabel: `per year (${annualDrums} drums · $${costPerDrumAllIn}/drum all-in)`,
      breakdown: [
        {
          label: 'Licensed TSDF Drum Transportation & Final Disposal',
          amount: directDisposal + transportFees,
          description: `Permitted hazardous waste transportation and TSDF thermal destruction/fuel blending for ${annualDrums} drums.`,
        },
        {
          label: 'Analytical Lab Testing & Profile Characterization',
          amount: labTesting,
          description: `Certified lab TCLP testing and multi-year TSDF waste acceptance profiles.`,
        },
        {
          label: 'Storage Secondary Containment & Emergency Equipment',
          amount: infraCost,
          description: `Spill containment sumps, emergency eyewash stations, and EPA hazardous drum labeling.`,
        },
        {
          label: 'Regulatory Compliance & Annual RCRA/DOT Staff Training',
          amount: adminFees + trainingPpe,
          description: `EPA e-Manifest tracking fees, Biennial Hazardous Waste reports, and certified personnel training.`,
        },
      ],
      keyDrivers: [
        `Generator Tier: ${values.generatorStatus.toUpperCase().replace('_TIER', '')} status (${gen.reqLevel} compliance level).`,
        `Annual Generation: ${annualDrums} total drums/year ($${costPerDrumAllIn} all-in compliance cost per drum).`,
        `Waste Characteristic: ${values.wasteCharacterization.toUpperCase().replace('_', ' ')}.`,
        `Penalty Avoidance: Federal RCRA civil statutory penalties reach up to $87,855 per violation day for improper storage.`,
      ],
      costReductionTips: [
        'Implement waste stream segregation to prevent mixing non-hazardous oily wastewater with listed solvents, avoiding 5× disposal charges.',
        'Use on-site solvent recycling distillation units to recover up to 80% of spent clean-up solvents for re-use.',
        'Conduct weekly drum storage inspections with documented date/time logs to easily prove RCRA compliance during unannounced EPA audits.',
      ],
      benchmarks: [
        { label: 'All-In / Drum', value: `$${costPerDrumAllIn}` },
        { label: 'Annual Volume', value: `${annualDrums} Drums` },
        { label: 'Max Fine/Day', value: '$87,855/day' },
      ],
    };
  },
  explainer: {
    title: 'How EPA RCRA Hazardous Waste Compliance Costs Are Calculated',
    paragraphs: [
      'Under the federal Resource Conservation and Recovery Act (RCRA), industrial facilities bear strict Cradle-to-Grave Legal Liability for all hazardous wastes they generate. This legal doctrine means a manufacturer remains legally responsible for toxic waste from the moment it is produced on the plant floor, throughout highway transit, and into perpetuity—even after a certified Treatment, Storage, and Disposal Facility (TSDF) incinerates or landfills the material.',
      'EPA categorizes industrial facilities into three regulatory generator classes based on monthly output: Very Small Quantity Generators (VSQG, generating under 220 lbs or roughly half a 55-gallon drum monthly), Small Quantity Generators (SQG, producing 220 to 2,200 lbs or 1 to 5 drums monthly), and Large Quantity Generators (LQG, producing over 2,200 lbs monthly). LQG facilities face the most rigorous operational mandates, including a strict 90-day maximum accumulation time limit, a written Contingency Plan submitted to local fire authorities, and mandatory annual personnel training.',
      'Compliance costs encompass four core operational pillars: certified chemical laboratory profiling (using EPA Toxicity Characteristic Leaching Procedure, or TCLP tests to verify whether waste is ignitable, corrosive, reactive, or toxic), physical secondary containment infrastructure (poly spill pallets holding 10% of container volume), licensed hazmat freight transportation with EPA Uniform Hazardous Waste Manifests, and final TSDF thermal destruction or fuel blending.',
      'Failing to maintain compliant RCRA drum management carries severe financial consequences. The EPA statutory civil penalty rate exceeds $87,855 per day per violation. Common enforcement citations include open drum bungs, missing hazard labels, storing hazardous waste past the statutory 90/180-day clock, and lacking documented weekly inspection logs.',
    ],
    factors: [
      {
        name: 'EPA Generator Classification Tier',
        impact: 'High (30% to 55% compliance cost variance)',
        detail: 'LQG facilities require comprehensive contingency plans, biennial reporting, and strict 90-day turnover.',
      },
      {
        name: 'Waste Chemistry & Disposal Method',
        impact: 'High ($320 fuel blending vs $650 incineration)',
        detail: 'F-code listed solvent residues and toxic heavy metals require high-temperature thermal incineration.',
      },
      {
        name: 'Analytical TCLP Laboratory Testing',
        impact: 'Moderate ($750 to $5,800 annually)',
        detail: 'Certified lab profiles must be re-verified periodically to maintain TSDF facility acceptance.',
      },
      {
        name: 'Secondary Containment & Drum Labeling',
        impact: 'Moderate ($1,200 to $4,500/year)',
        detail: 'Mandatory liquid sumps and DOT/EPA hazardous waste warning labels prevent catastrophic leaks.',
      },
    ],
    industryBenchmarkNote:
      'Small to mid-sized industrial manufacturers spend between $14,000 and $45,000 annually managing hazardous waste streams, with all-in costs averaging $400 to $700 per 55-gallon drum.',
  },
  faqs: [
    {
      question: 'What is the "Cradle-to-Grave" liability principle under RCRA?',
      answer:
        'Cradle-to-grave liability means your company remains permanently legally liable for any environmental contamination caused by your hazardous waste. Even if you pay a licensed transporter and a licensed disposal facility, if that disposal facility later leaks into groundwater, the EPA can order your company to fund Superfund cleanup operations.',
    },
    {
      question: 'What is the difference between an SQG and an LQG generator?',
      answer:
        'A Small Quantity Generator (SQG) generates between 220 and 2,200 lbs of hazardous waste per month and may store waste on-site for up to 180 days without a storage permit. A Large Quantity Generator (LQG) generates over 2,200 lbs (approx. 5 drums) per month, may only store waste for 90 days, and must file formal Biennial Reports and maintain a full written Contingency Plan.',
    },
    {
      question: 'What is a TCLP test and when is it required?',
      answer:
        'The Toxicity Characteristic Leaching Procedure (TCLP - EPA Method 1311) is a certified chemical laboratory test that simulates landfill leaching conditions. It measures whether toxic metals (lead, arsenic, mercury, chromium) or volatile organics leach out at concentrations exceeding federal toxicity limits.',
    },
    {
      question: 'What are the rules for Satellite Accumulation Areas (SAAs)?',
      answer:
        'Under 40 CFR 262.15, an operator may accumulate up to 55 gallons of hazardous waste at or near the point of generation without starting the 90/180-day storage clock, provided the drum is under the control of the operator, kept closed except when adding waste, and labeled with the words "Hazardous Waste".',
    },
  ],
  relatedCalculatorIds: [
    'industrial-waste-disposal-cost-by-state',
    'epa-compliance-cost-calculator',
    'hazwoper-certification-cost-guide',
  ],
};

export const industrialAirPermitCalc: CalculatorDefinition = {
  id: 'industrial-air-quality-permit-cost-by-state',
  slug: 'industrial-air-quality-permit-cost-by-state',
  categoryId: 'compliance',
  path: '/compliance/industrial-air-quality-permit-cost-by-state',
  name: 'Industrial Air Quality Permit Cost by State',
  metaTitle: 'Industrial Air Quality Permit Cost by State – Title V & Minor NSR',
  metaDescription:
    'Calculate industrial Clean Air Act air quality permit costs by state. Estimate Title V, synthetic minor, dispersion modeling, stack testing, and regulatory timelines.',
  shortDescription:
    'Estimate state environmental air permit application fees, AERMOD dispersion modeling, emission inventory fees, and engineering consulting across all 50 states.',
  targetAudience:
    'Industrial plant engineers, EHS directors, commercial developers, and environmental consultants permitting boilers, paint booths, and manufacturing emission sources.',
  featured: true,
  featuredBadge: 'Clean Air Act',
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'state',
      label: 'State / Air Quality Control Jurisdiction',
      type: 'select',
      defaultValue: 'OH',
      options: STATE_SELECT_OPTIONS,
      description: 'State environmental agency regulations (e.g., Texas TCEQ, Ohio EPA, California SCAQMD, Pennsylvania DEP).',
    },
    {
      id: 'permitTier',
      label: 'Air Permitting Classification & Regulatory Tier',
      type: 'select',
      defaultValue: 'synthetic_minor',
      options: [
        { label: 'Minor Source / General Permit (Small spray booths, emergency generators · $2,500 base)', value: 'minor_source', baseFee: 2500, timelineMo: 4 },
        { label: 'Synthetic Minor / FESOP Permit (Federally enforceable operational limits · $7,500 base)', value: 'synthetic_minor', baseFee: 7500, timelineMo: 8 },
        { label: 'Major Source Title V Operating Permit (>100 TPY or >10/25 HAP · $18,500 base)', value: 'title_v_major', baseFee: 18500, timelineMo: 14 },
      ],
      description: 'Threshold based on Potential to Emit (PTE) criteria pollutants (VOC, NOx, PM2.5, SO2, CO) and Hazardous Air Pollutants (HAPs).',
    },
    {
      id: 'sourceEquipment',
      label: 'Primary Industrial Emission Equipment Category',
      type: 'select',
      defaultValue: 'spray_paint_voc',
      options: [
        { label: 'Surface Coating, Paint Spray Booths & Ovens (VOCs / Solvents · 1.00× factor)', value: 'spray_paint_voc', multiplier: 1.0 },
        { label: 'Industrial Boilers, Furnaces & Thermal Oxidizers (NOx, CO, PM · 1.25× factor)', value: 'boilers_furnaces', multiplier: 1.25 },
        { label: 'Chemical Processing Reactors & Polymer Compounding (HAPs / Toxics · 1.50× factor)', value: 'chemical_reactors', multiplier: 1.5 },
        { label: 'Emergency Backup Generators & Reciprocating IC Engines (RICE NESHAP · 0.85× factor)', value: 'emergency_generators', multiplier: 0.85 },
      ],
      description: 'Equipment design governs applicable federal NSPS (New Source Performance Standards) and NESHAP standards.',
    },
    {
      id: 'engineeringModeling',
      label: 'Environmental Engineering Consulting & AERMOD Dispersion Modeling',
      type: 'select',
      defaultValue: 'external_consulting',
      options: [
        { label: 'In-House Environmental Staff (Standard emission inventory calculations · $0)', value: 'in_house', consultFee: 0 },
        { label: 'Specialized Consulting Firm (PTE calculations + State application packaging · +$8,500)', value: 'external_consulting', consultFee: 8500 },
        { label: 'Turnkey Consulting + Full AERMOD Computer Air Dispersion Modeling (+$18,500)', value: 'full_aermod_modeling', consultFee: 18500 },
      ],
      description: 'Computer dispersion modeling proves emissions will not exceed National Ambient Air Quality Standards (NAAQS) at the property fenceline.',
    },
    {
      id: 'stackTestingCems',
      label: 'Initial Compliance Stack Testing & Performance Verification',
      type: 'select',
      defaultValue: 'epa_stack_test',
      options: [
        { label: 'No Physical Testing Mandated (Manufacturer emission data acceptance · $0)', value: 'none', testFee: 0 },
        { label: 'EPA Method Initial Emission Stack Test (Single source run · +$9,500)', value: 'epa_stack_test', testFee: 9500 },
        { label: 'Multi-Source Stack Testing + Continuous Opacity/Emission Monitors (+$22,000)', value: 'multi_stack_cems', testFee: 22000 },
      ],
      description: 'Certified third-party stack testing verifies that actual exhaust concentrations comply with permit limits.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    // High regulatory friction states (CA, NY, NJ, IL, PA) carry higher fees and review delays
    const highRegStates = ['CA', 'NY', 'NJ', 'IL', 'PA', 'CT', 'MA', 'WA'];
    const stateRegMult = highRegStates.includes(values.state) ? 1.45 : 1.0;

    const tierData: Record<string, { baseFee: number; timelineMo: number }> = {
      minor_source: { baseFee: 2500, timelineMo: 4 },
      synthetic_minor: { baseFee: 7500, timelineMo: 8 },
      title_v_major: { baseFee: 18500, timelineMo: 14 },
    };
    const tier = tierData[values.permitTier] || tierData.synthetic_minor;

    const sourceMults: Record<string, number> = {
      spray_paint_voc: 1.0,
      boilers_furnaces: 1.25,
      chemical_reactors: 1.5,
      emergency_generators: 0.85,
    };
    const sourceMult = sourceMults[values.sourceEquipment] || 1.0;

    const consultData: Record<string, number> = {
      in_house: 0,
      external_consulting: 8500,
      full_aermod_modeling: 18500,
    };
    const consultFee = consultData[values.engineeringModeling] || 8500;

    const testData: Record<string, number> = {
      none: 0,
      epa_stack_test: 9500,
      multi_stack_cems: 22000,
    };
    const testFee = testData[values.stackTestingCems] || 9500;

    // State agency application filing and technical review fees
    const agencyFee = Math.round(tier.baseFee * stateRegMult * sourceMult);

    // Annual emission inventory fee (annual operating compliance)
    const annualEmissionFee = Math.round((tier.baseFee * 0.45 + 850) * stateRegMult);

    // Total first-year capital permitting project investment
    const totalInitialProjectCost = agencyFee + consultFee + testFee;

    const estimatedMonths = Math.round(tier.timelineMo * (highRegStates.includes(values.state) ? 1.35 : 1.0));

    const low = Math.round(totalInitialProjectCost * 0.88);
    const high = Math.round(totalInitialProjectCost * 1.18);

    return {
      primaryLabel: `Total Air Permitting & Engineering Cost`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInitialProjectCost,
      frequencyLabel: `turnkey permit authorization (${estimatedMonths} mo approval timeline)`,
      breakdown: [
        {
          label: 'State Environmental Agency Application & Review Fees',
          amount: agencyFee,
          description: `Direct fees paid to ${stateObj.name} environmental regulatory division (${stateObj.epaRegion}).`,
        },
        {
          label: 'Environmental Engineering & AERMOD Dispersion Modeling',
          amount: consultFee,
          description: `Potential to Emit (PTE) calculations, BACT reviews, and computer plume modeling.`,
        },
        {
          label: 'Initial EPA Method Stack Testing & Performance Run',
          amount: testFee,
          description: `Certified third-party isokinetic sampling verifying exhaust concentrations.`,
        },
      ],
      keyDrivers: [
        `Permit Classification: ${values.permitTier.toUpperCase().replace('_', ' ')} in ${stateObj.name} (${estimatedMonths} month review cycle).`,
        `Agency Jurisdiction: ${stateObj.epaRegion} (${highRegStates.includes(values.state) ? 'Strict Air Quality Control Region' : 'Standard Baseline Environment'}).`,
        `Ongoing Annual Compliance Fee: ~$${annualEmissionFee.toLocaleString()}/year in recurring emission inventory fees.`,
        `Public Notice Requirement: Major source Title V permits mandate 30-day public comment and EPA 45-day veto review.`,
      ],
      costReductionTips: [
        'Cap operations under Synthetic Minor (FESOP) limits to legally avoid expensive and cumbersome Title V major source oversight.',
        'Reformulate coatings to low-VOC or waterborne chemistry to stay below state construction permit threshold triggers.',
        'Submit permit applications well in advance; commencing construction before receiving an air permit is a federal Clean Air Act violation.',
      ],
      benchmarks: [
        { label: 'Agency Fee', value: `$${agencyFee.toLocaleString()}` },
        { label: 'Approval Timeline', value: `${estimatedMonths} Months` },
        { label: 'Annual OPEX', value: `$${annualEmissionFee.toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Air Quality Permitting Costs & Timelines Are Calculated',
    paragraphs: [
      'Under the federal Clean Air Act (CAA), any industrial facility that installs or modifies equipment with the potential to emit regulated air pollutants must obtain authorization prior to commencing construction. Regulated air pollutants include Criteria Pollutants (Volatile Organic Compounds [VOCs], Nitrogen Oxides [NOx], Carbon Monoxide [CO], Sulfur Dioxide [SO2], and Particulate Matter [PM10/PM2.5]) and Hazardous Air Pollutants (HAPs).',
      'Air permits fall into three primary categories based on Potential to Emit (PTE): Minor Source Permits (for small operations emitting well below federal limits), Synthetic Minor Permits (also called Federally Enforceable State Operating Permits, or FESOP, where a plant agrees to legally enforceable operational caps, such as limiting paint spray hours to stay below major thresholds), and Major Source Title V Operating Permits. Facilities emitting over 100 tons per year of criteria pollutants, or 10 tons of an individual HAP (25 tons aggregate HAPs), trigger Title V.',
      'Permitting costs consist of statutory state agency review fees, environmental engineering consulting, computer dispersion modeling, and stack testing. State environmental agency fees vary dramatically—from a few thousand dollars in business-friendly jurisdictions to over $25,000 in stringent non-attainment air basins like California’s South Coast Air Quality Management District (SCAQMD) or New Jersey DEP.',
      'Air dispersion modeling (frequently conducted using the EPA’s AERMOD computer simulation software) represents a significant technical investment. Environmental engineers input local meteorological data, terrain elevations, stack exit velocities, and exhaust temperatures to mathematically demonstrate that pollutants will not exceed National Ambient Air Quality Standards (NAAQS) beyond the property fenceline.',
    ],
    factors: [
      {
        name: 'Permit Classification (Minor vs. Synthetic Minor vs. Title V)',
        impact: 'High ($2,500 minor fee vs $18,500+ Title V)',
        detail: 'Title V permits involve federal EPA oversight, mandatory public hearings, and compliance certifications.',
      },
      {
        name: 'AERMOD Computer Dispersion Modeling',
        impact: 'High (Adds $8,500 to $18,500 in engineering)',
        detail: 'Required when local air basins are in non-attainment or source emissions approach toxic screening levels.',
      },
      {
        name: 'EPA Method Stack Testing Verification',
        impact: 'High ($9,500 to $22,000)',
        detail: 'Third-party testing crews measure flue gas velocity, moisture, and particulate mass rates.',
      },
      {
        name: 'State / Local Non-Attainment Designation',
        impact: 'Moderate (30-45% cost and timeline inflation)',
        detail: 'Ozone and PM2.5 non-attainment areas mandate Lowest Achievable Emission Rate (LAER) technology.',
      },
    ],
    industryBenchmarkNote:
      'Industrial facilities spend between $18,000 and $65,000 for turnkey air permitting and dispersion modeling, with approval timelines extending from 4 months for minor sources to 18+ months for Title V permits.',
  },
  faqs: [
    {
      question: 'What is "Potential to Emit" (PTE) and how does it determine my permit type?',
      answer:
        'Potential to Emit (PTE) is the maximum capacity of a facility to emit a pollutant under its physical and operational design, assuming continuous operation at 8,760 hours per year (24/7/365). Even if your factory only operates 8 hours a day, state agencies calculate PTE at 24 hours a day unless you accept legally binding permit restrictions.',
    },
    {
      question: 'What is a "Synthetic Minor" or FESOP permit and why do companies prefer it?',
      answer:
        'A Synthetic Minor permit allows a facility that would otherwise be classified as a major Title V source to take legally enforceable operational limits (such as fuel caps, coating gallon limits, or operating hour restrictions) to keep actual emissions below major source thresholds. This avoids hundreds of thousands in compliance reporting costs.',
    },
    {
      question: 'Can I begin equipment installation before receiving our approved air permit?',
      answer:
        'No. Under Clean Air Act "New Source Review" (NSR) regulations, pouring concrete foundations, installing structural steel, or connecting ductwork for an unpermitted emission source constitutes illegal construction, exposing the company to stop-work orders and federal civil penalties exceeding $100,000.',
    },
    {
      question: 'What is Best Available Control Technology (BACT)?',
      answer:
        'BACT is an emission limitation based on the maximum degree of reduction for each pollutant, determined by the permitting authority on a case-by-case basis. It often requires installing add-on pollution control equipment such as Thermal Oxidizers, Baghouses, or Selective Catalytic Reduction (SCR) systems.',
    },
  ],
  relatedCalculatorIds: [
    'epa-compliance-cost-calculator',
    'epa-hazardous-waste-compliance-cost-calculator',
    'manufacturing-overhead-cost-calculator',
  ],
};
