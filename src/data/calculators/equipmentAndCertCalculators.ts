import { CalculatorDefinition } from '../../types';

export const machineryDepreciationCalc: CalculatorDefinition = {
  id: 'machinery-depreciation-hourly-rate-calculator',
  slug: 'machinery-depreciation-hourly-rate-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/machinery-depreciation-hourly-rate-calculator',
  name: 'Machinery Depreciation & Hourly Rate Calculator',
  metaTitle: 'Machinery Depreciation & Hourly Rate Calculator – Machine Burden Rates',
  metaDescription:
    'Calculate industrial machinery hourly burden rates and depreciation. Model capital cost, useful life, power consumption, and maintenance overhead per spindle hour.',
  shortDescription:
    'Calculate the true fully burdened cost per machine operating hour, including straight-line depreciation, electricity, floor space, and maintenance.',
  targetAudience:
    'Cost accountants, machine shop estimators, fabrication plant owners, and manufacturing engineers quoting job work.',
  featured: true,
  featuredBadge: 'Shop Floor Essential',
  iconName: 'Wrench',
  fields: [
    {
      id: 'purchasePrice',
      label: 'Machinery Acquisition Cost (Delivered & Installed)',
      type: 'number',
      defaultValue: 220000,
      min: 10000,
      max: 5000000,
      step: 5000,
      unit: '$ USD',
      description: 'Total capital investment including tooling packages, rigging, and electrical drop installation.',
    },
    {
      id: 'usefulLifeYears',
      label: 'Target Useful Life (Depreciation Horizon)',
      type: 'select',
      defaultValue: '7',
      options: [
        { label: '5 Years (Aggressive high-wear / rapid obsolescence)', value: '5' },
        { label: '7 Years (Standard IRS MACRS 7-Year Property Class)', value: '7' },
        { label: '10 Years (Heavy production durability standard)', value: '10' },
        { label: '15 Years (Long-life structural press / boiler)', value: '15' },
      ],
      description: 'Useful operating timeframe before planned overhaul or replacement.',
    },
    {
      id: 'annualHours',
      label: 'Annual Operating Spindle / Machine Hours',
      type: 'number',
      defaultValue: 2000,
      min: 200,
      max: 8000,
      step: 100,
      unit: 'hrs/year',
      description: 'Typical single-shift is 2,000 hrs/yr; two-shift operation is ~4,000 hrs/yr.',
    },
    {
      id: 'salvageValue',
      label: 'Estimated Residual / Salvage Value',
      type: 'number',
      defaultValue: 30000,
      min: 0,
      max: 500000,
      step: 2000,
      unit: '$ USD',
      description: 'Projected secondary market resale value at end of useful life.',
    },
    {
      id: 'powerDrawKw',
      label: 'Average Continuous Power Draw',
      type: 'number',
      defaultValue: 25,
      min: 2,
      max: 500,
      step: 1,
      unit: 'kW',
      description: 'True running electrical load of spindle, servo drives, chillers, and hydraulics.',
    },
    {
      id: 'electricityRate',
      label: 'Industrial Electricity Rate ($/kWh)',
      type: 'number',
      defaultValue: 0.12,
      min: 0.04,
      max: 0.45,
      step: 0.01,
      unit: '$/kWh',
      description: 'Industrial blended utility tariff including demand charges.',
    },
    {
      id: 'annualMaintenance',
      label: 'Annual Preventive Maintenance & Fluid Consumables',
      type: 'number',
      defaultValue: 8500,
      min: 500,
      max: 100000,
      step: 500,
      unit: '$ USD/yr',
      description: 'Filters, slideway lube, hydraulic oil, preventative technician visits, and seals.',
    },
  ],
  calculate: (values) => {
    const price = Number(values.purchasePrice) || 220000;
    const years = Number(values.usefulLifeYears) || 7;
    const annualHours = Number(values.annualHours) || 2000;
    const salvage = Number(values.salvageValue) || 30000;
    const kw = Number(values.powerDrawKw) || 25;
    const kwhRate = Number(values.electricityRate) || 0.12;
    const maintenance = Number(values.annualMaintenance) || 8500;

    // Depreciation
    const annualDepreciation = (price - salvage) / years;
    const depPerHour = annualDepreciation / annualHours;

    // Electricity cost per hour
    const powerPerHour = kw * kwhRate;

    // Maintenance per hour
    const maintPerHour = maintenance / annualHours;

    // Capital opportunity cost / financing cost (approx 5.5% on average capital book value)
    const avgBookValue = (price + salvage) / 2;
    const financingPerHour = (avgBookValue * 0.055) / annualHours;

    // Total machine burden rate per hour (excluding operator wages)
    const totalHourlyBurden = depPerHour + powerPerHour + maintPerHour + financingPerHour;
    const low = Number((totalHourlyBurden * 0.92).toFixed(2));
    const high = Number((totalHourlyBurden * 1.15).toFixed(2));

    const totalAnnualOperatingCost = Math.round(totalHourlyBurden * annualHours);

    return {
      primaryLabel: 'Machine Burden Rate (Excluding Operator)',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: Number(totalHourlyBurden.toFixed(2)),
      frequencyLabel: 'per machine operating hour',
      breakdown: [
        {
          label: 'Capital Equipment Depreciation',
          amount: Number(depPerHour.toFixed(2)),
          description: `$${Math.round(annualDepreciation).toLocaleString()} / year amortized across ${annualHours.toLocaleString()} machine hours.`,
        },
        {
          label: 'Power & Energy Consumption',
          amount: Number(powerPerHour.toFixed(2)),
          description: `${kw} kW draw × $${kwhRate.toFixed(2)}/kWh electric rate.`,
        },
        {
          label: 'Preventative Maintenance & Consumables',
          amount: Number(maintPerHour.toFixed(2)),
          description: `$${maintenance.toLocaleString()}/yr in fluids, scheduled maintenance, and wear items.`,
        },
        {
          label: 'Financing Cost of Capital (5.5%)',
          amount: Number(financingPerHour.toFixed(2)),
          description: `Capital carrying cost on average machine net asset value ($${Math.round(avgBookValue).toLocaleString()}).`,
        },
      ],
      keyDrivers: [
        `Utilization Impact: At ${annualHours} hrs/yr, depreciation is $${depPerHour.toFixed(2)}/hr; running a second shift (4,000 hrs) would cut depreciation to $${(depPerHour / 2).toFixed(2)}/hr.`,
        `Annualized Machine Overhead: $${totalAnnualOperatingCost.toLocaleString()} per year total machine burden.`,
        `Book Value Recovery: Depreciates $${(price - salvage).toLocaleString()} over ${years} years.`,
      ],
      costReductionTips: [
        'Increase machine utilization by running lights-out night shifts to cut fixed hourly depreciation by up to 50%.',
        'Negotiate industrial time-of-use (TOU) power schedules with local utility to shave peak energy charges.',
        'Implement predictive vibration sensors to address bearing wear before catastrophic spindle rebuilds.',
      ],
      benchmarks: [
        { label: 'Depreciation / Year', value: `$${Math.round(annualDepreciation).toLocaleString()}` },
        { label: 'Annual Machine Cost', value: `$${totalAnnualOperatingCost.toLocaleString()}` },
      ],
    };
  },
  explainer: {
    title: 'How Machine Depreciation and Hourly Burden Rates Are Calculated',
    paragraphs: [
      'In precision manufacturing and fabrication, pricing parts accurately requires knowing the true hourly machine rate—often termed the machine burden rate. When estimators fail to account for capital depreciation, auxiliary electrical draw, or capital financing costs, shops underquote and lose money on complex jobs.',
      'Our model applies straight-line depreciation: Total Acquisition Cost minus Salvage Value divided by Useful Life in years. In the United States, tax accounting frequently utilizes MACRS (Modified Accelerated Cost Recovery System) 7-year property class for industrial machinery, allowing faster tax write-offs in early years.',
      'Operating utilization is the single largest lever affecting hourly costs. Fixed capital depreciation doesn’t change whether a machine runs 1,000 hours or 4,000 hours in a calendar year. High-utilization multi-shift shops spread the depreciation cost over many more billable hours, lowering their cost floor dramatically.',
      'Additionally, electric motors and hydraulic power units in modern CNC mills or stamping presses consume significant electricity. Blended industrial electric rates that include demand charges often bring true power costs to $0.10 to $0.20 per kilowatt-hour, adding several dollars every spindle hour.',
    ],
    factors: [
      {
        name: 'Annual Machine Utilization (Spindle Hours)',
        impact: 'Extreme (2× cost variation)',
        detail: 'Increasing annual operating hours from 2,000 (single shift) to 4,000 (two shifts) cuts hourly depreciation in half.',
      },
      {
        name: 'Acquisition Price & Residual Salvage',
        impact: 'High (directly scales capital cost)',
        detail: 'High residual value equipment (like premium Japanese/German machine tools) reduces net depreciable basis.',
      },
      {
        name: 'Energy Tariff & Demand Charges',
        impact: 'Moderate (10-25% of hourly burden)',
        detail: 'Peak demand ratchet charges can spike effective electric rates during summer production surges.',
      },
      {
        name: 'Cost of Capital & Lease Interest',
        impact: 'Moderate (5-8% annual return on capital)',
        detail: 'Accounts for interest paid on equipment loans or forgone yield on corporate capital.',
      },
    ],
    industryBenchmarkNote:
      'Standard CNC vertical machining centers typically carry burden rates of $35 to $65/hr (excluding operator), while 5-axis and heavy horizontal boring mills range from $85 to $160/hr.',
  },
  faqs: [
    {
      question: 'Does the machine burden rate include operator wages?',
      answer:
        'No. This calculator isolates the machine burden rate (capital, power, maintenance, and financing). To obtain the full shop hourly billing rate, add your operator’s direct hourly wage plus payroll burden (typically 25-35%) and general administrative SG&A margin.',
    },
    {
      question: 'What is the difference between MACRS tax depreciation and financial depreciation?',
      answer:
        'MACRS is used for tax reporting to accelerate deductions and reduce immediate taxable income. Financial management depreciation uses straight-line accounting to determine accurate, stable hourly cost rates for customer quoting and job costing.',
    },
    {
      question: 'How do I estimate salvage value for industrial machinery?',
      answer:
        'Standard industrial machine tools typically retain 15% to 25% of original purchase price after 7 to 10 years on the secondary auction market, assuming routine maintenance and undamaged ways/spindles.',
    },
    {
      question: 'Why is financing cost included if we bought the machine with cash?',
      answer:
        'Even if funded with cash reserves, capital has an opportunity cost—that money could have been earning interest or invested in other corporate projects. Standard cost accounting models assign a 5% to 7% capital carrying cost to reflect this asset utilization.',
    },
  ],
  relatedCalculatorIds: [
    'cnc-machine-operating-cost-calculator',
    'heavy-equipment-rental-vs-buy-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const cncMachineOperatingCostCalc: CalculatorDefinition = {
  id: 'cnc-machine-operating-cost-calculator',
  slug: 'cnc-machine-operating-cost-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/cnc-machine-operating-cost-calculator',
  name: 'CNC Machine Operating Cost Calculator',
  metaTitle: 'CNC Machine Operating Cost Calculator – Hourly Job & Tooling Rate',
  metaDescription:
    'Calculate true CNC machine operating costs per hour. Include machinist labor, carbide tooling consumption, coolant, power, and machine burden.',
  shortDescription:
    'Determine complete hourly quoting rates for CNC milling and turning centers, including tooling wear, operator labor, and overhead.',
  targetAudience:
    'Job shop owners, CNC machinists, manufacturing estimators, and production managers quoting competitive machining contracts.',
  featured: false,
  iconName: 'Cpu',
  fields: [
    {
      id: 'machineType',
      label: 'CNC Machine Classification',
      type: 'select',
      defaultValue: 'mill_3axis',
      options: [
        { label: '3-Axis Vertical Machining Center (VMC)', value: 'mill_3axis', multiplier: 1.0 },
        { label: '4-Axis Horizontal Machining Center (HMC)', value: 'mill_4axis', multiplier: 1.4 },
        { label: '5-Axis Simultaneous Machining Center', value: 'mill_5axis', multiplier: 1.85 },
        { label: '2-Axis / Multi-Axis CNC Turning Center', value: 'lathe', multiplier: 1.15 },
        { label: 'Swiss-Type Multi-Spindle Automatic Lathe', value: 'swiss', multiplier: 1.6 },
      ],
      description: 'Machine complexity influences tooling wear, programming overhead, and capital expense.',
    },
    {
      id: 'operatorHourlyWage',
      label: 'Machinist / Operator Hourly Wage',
      type: 'number',
      defaultValue: 28,
      min: 15,
      max: 75,
      step: 1,
      unit: '$/hr',
      description: 'Direct hourly pay rate for setup technician or machine operator.',
    },
    {
      id: 'laborMultiplier',
      label: 'Operator-to-Machine Ratio',
      type: 'select',
      defaultValue: 'one_to_two',
      options: [
        { label: '1 Operator dedicated to 1 Machine (1.00× wage)', value: 'one_to_one', multiplier: 1.0 },
        { label: '1 Operator running 2 Machines (0.50× wage per machine)', value: 'one_to_two', multiplier: 0.5 },
        { label: '1 Cell Operator running 3-4 Machines (0.30× wage)', value: 'one_to_three', multiplier: 0.3 },
      ],
      description: 'Cellular manufacturing divides labor cost across multiple simultaneously running spindles.',
    },
    {
      id: 'toolingCostPerHour',
      label: 'Estimated Cutting Tooling & Insert Wear ($/hr)',
      type: 'number',
      defaultValue: 9,
      min: 2,
      max: 60,
      step: 1,
      unit: '$/spindle hr',
      description: 'Solid carbide endmills, indexable inserts, drills, taps, and regrind costs per cut hour.',
    },
    {
      id: 'overheadMarkupPct',
      label: 'Shop Overhead & Administrative SG&A Markup (%)',
      type: 'number',
      defaultValue: 35,
      min: 10,
      max: 80,
      step: 5,
      unit: '%',
      description: 'Covers shop rent, CAM programming licenses, inspection CMM equipment, and office staff.',
    },
  ],
  calculate: (values) => {
    const wage = Number(values.operatorHourlyWage) || 28;
    const tooling = Number(values.toolingCostPerHour) || 9;
    const markupPct = Number(values.overheadMarkupPct) || 35;

    const machineTypeRates: Record<string, number> = {
      mill_3axis: 28,
      mill_4axis: 42,
      mill_5axis: 65,
      lathe: 32,
      swiss: 55,
    };
    const baseMachineRate = machineTypeRates[values.machineType] || 28;

    const ratioMults: Record<string, number> = {
      one_to_one: 1.0,
      one_to_two: 0.5,
      one_to_three: 0.3,
    };
    const ratioMult = ratioMults[values.laborMultiplier] || 0.5;

    // Fully burdened labor (wage + 30% taxes/benefits) divided by machines run
    const burdenedLabor = wage * 1.3 * ratioMult;

    // Coolant, filtration, waste disposal per spindle hour
    const consumables = 3.5;

    const directCostPerHour = baseMachineRate + burdenedLabor + tooling + consumables;
    const fullBillingRate = Math.round(directCostPerHour * (1 + markupPct / 100));

    const low = Math.round(fullBillingRate * 0.9);
    const high = Math.round(fullBillingRate * 1.15);

    return {
      primaryLabel: 'Recommended CNC Billing / Quoting Rate',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: fullBillingRate,
      frequencyLabel: 'per billable spindle hour',
      breakdown: [
        {
          label: 'Direct Labor (Burdened with Benefits)',
          amount: Math.round(burdenedLabor),
          description: `$${wage}/hr base + 30% payroll burden adjusted for ${values.laborMultiplier === 'one_to_two' ? '2-machine cell' : 'cell staffing'}.`,
        },
        {
          label: 'Machine Burden (Capital & Power)',
          amount: Math.round(baseMachineRate),
          description: `Machine amortization, spindle power, and scheduled mechanical maintenance.`,
        },
        {
          label: 'Per-Hour Tooling & Insert Consumption',
          amount: Math.round(tooling),
          description: `Indexable carbide inserts, endmill wear, tap breakage, and toolholder depreciation.`,
        },
        {
          label: `Shop Overhead & SG&A Margin (${markupPct}%)`,
          amount: Math.round(fullBillingRate - directCostPerHour),
          description: `CAM software (Mastercam/Fusion), shop rent, QA inspection, and net profit target.`,
        },
      ],
      keyDrivers: [
        `Operator Allocation: Cellular machining cuts labor cost per machine to $${burdenedLabor.toFixed(2)}/hr.`,
        `Tooling Intensity: Tooling represents ${Math.round((tooling / directCostPerHour) * 100)}% of direct hourly operating cost.`,
        `Direct Cost Floor: Minimum cash break-even rate is $${Math.round(directCostPerHour)}/hr.`,
      ],
      costReductionTips: [
        'Group similar setups to allow one operator to tend two or three machines during long cycle times.',
        'Adopt high-feed milling geometries or tool coatings tailored to workpiece hardness to extend insert life.',
        'Recycle high-grade coolant and implement refractometer testing to double fluid sump life.',
      ],
    };
  },
  explainer: {
    title: 'How CNC Machine Hourly Operating Costs Are Calculated',
    paragraphs: [
      'Accurate CNC hourly cost calculation is the backbone of machine shop profitability. Many job shops quote based on arbitrary local market figures (such as "we charge $75 an hour for milling") without understanding if that rate covers actual capital depreciation, high-end carbide consumption, and true shop overhead.',
      'Our formula separates costs into three distinct categories: Direct Labor, Direct Machine Burden, and General Overhead Markup. Direct labor accounts for hourly wages plus statutory payroll burden (FICA, FUTA, workers’ compensation, health insurance, and 401k match), which typically adds 28% to 35% to base pay.',
      'When shops transition from one-operator-per-machine to multi-machine cellular manufacturing—where a single skilled machinist supervises two or three automated cycles—hourly labor charges per machine fall by 50% to 70%, drastically boosting competitiveness on production volumes.',
      'Tooling consumption varies significantly by workpiece material. Milling mild aluminum consumes modest carbide tooling ($4-$8/hr), whereas machining hardened titanium (Ti-6Al-4V) or Inconel can easily exceed $30 to $50 per spindle hour in insert wear and specialized endmills.',
    ],
    factors: [
      {
        name: 'Workpiece Material & Tooling Wear',
        impact: 'High ($5 to $40/hr variance)',
        detail: 'High-temp nickel alloys and tool steels wear cutting edges 4× to 8× faster than structural aluminum.',
      },
      {
        name: 'Machinist Staffing Multiplier',
        impact: 'High (30% to 50% labor reduction)',
        detail: 'Designing parts for lights-out or multi-pallet horizontal machining multiplies operator leverage.',
      },
      {
        name: 'Machine Kinematics (3-Axis vs. 5-Axis)',
        impact: 'Moderate (50-80% capital rate difference)',
        detail: 'Complex 5-axis trunnion machines carry higher purchase prices and require premium CAM programming.',
      },
      {
        name: 'Shop Overhead Allocation Percentage',
        impact: 'Moderate (20-40% of final rate)',
        detail: 'Captures facility square footage lease costs, environmental chip disposal, and quality CMM certification.',
      },
    ],
    industryBenchmarkNote:
      'National precision machining survey data indicates average shop billing rates range from $65-$85/hr for standard 3-axis VMCs, $95-$130/hr for 4-axis horizontals, and $140-$220/hr for 5-axis machining.',
  },
  faqs: [
    {
      question: 'What is the difference between spindle run time and shop clock time?',
      answer:
        'Spindle run time measures only when the cutting tool is actively engaged in the cut. Shop clock time includes part loading, deburring, datum probing, and chip clearing. A machine with 60% spindle utilization over an 8-hour shift has 4.8 true cutting hours.',
    },
    {
      question: 'How do I factor CAM programming time into my part quote?',
      answer:
        'For high-volume production, programming time is amortized over the total batch count. For prototypes or single-piece runs, programming should be billed as a separate one-time engineering charge ($85-$125/hr) rather than blended into the spindle rate.',
    },
    {
      question: 'Why should coolant and chip recycling be included in hourly calculations?',
      answer:
        'Modern water-soluble cutting fluids, biocides, refractometer maintenance, and hazardous swarf disposal cost between $2.50 and $5.00 per machine hour. Ignoring them erodes profit margins across thousands of operating hours.',
    },
    {
      question: 'How does high-pressure coolant (HPC) affect operating costs?',
      answer:
        'High-pressure coolant (1,000 PSI) increases power consumption slightly, but extends carbide tool life by up to 100% and enables faster feeds and speeds, reducing cycle times and net job costs.',
    },
  ],
  relatedCalculatorIds: [
    'machinery-depreciation-hourly-rate-calculator',
    'heavy-equipment-rental-vs-buy-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const heavyEquipmentRentalVsBuyCalc: CalculatorDefinition = {
  id: 'heavy-equipment-rental-vs-buy-calculator',
  slug: 'heavy-equipment-rental-vs-buy-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/heavy-equipment-rental-vs-buy-calculator',
  name: 'Heavy Equipment Rental vs Buy Calculator',
  metaTitle: 'Heavy Equipment Rental vs Buy Calculator – Financial Break-Even',
  metaDescription:
    'Compare renting versus buying industrial equipment. Calculate financial crossover break-even points, monthly cash flows, depreciation, and maintenance costs.',
  shortDescription:
    'Evaluate capital purchase vs. monthly commercial rental to pinpoint the exact utilization crossover break-even point.',
  targetAudience:
    'Industrial plant engineers, construction contractors, logistics operators, and CFOs weighing capital expenditure against operating lease rentals.',
  featured: false,
  iconName: 'Scale',
  fields: [
    {
      id: 'purchasePrice',
      label: 'New or Used Equipment Purchase Price',
      type: 'number',
      defaultValue: 95000,
      min: 10000,
      max: 1000000,
      step: 5000,
      unit: '$ USD',
      description: 'Capital cost to purchase outright (e.g. boom lift, yard switcher, telehandler).',
    },
    {
      id: 'monthlyRentalRate',
      label: 'Monthly Commercial Rental Rate',
      type: 'number',
      defaultValue: 3200,
      min: 500,
      max: 50000,
      step: 100,
      unit: '$/month',
      description: 'Quoted rate from industrial equipment rental suppliers (including basic insurance waivers).',
    },
    {
      id: 'monthsUsedPerYear',
      label: 'Projected Equipment Utilization (Months per Year)',
      type: 'slider',
      defaultValue: 8,
      min: 1,
      max: 12,
      step: 1,
      unit: 'months/yr',
      description: 'How many months per year the asset will be actively working on-site.',
    },
    {
      id: 'ownershipLifespan',
      label: 'Projected Ownership Horizon',
      type: 'select',
      defaultValue: '5',
      options: [
        { label: '3 Years (Shorter project cycle)', value: '3' },
        { label: '5 Years (Standard industrial horizon)', value: '5' },
        { label: '7 Years (Extended lifecycle)', value: '7' },
      ],
      description: 'Total duration you plan to utilize or retain this asset class.',
    },
    {
      id: 'resaleValuePct',
      label: 'Estimated Resale Value at End of Horizon (%)',
      type: 'number',
      defaultValue: 40,
      min: 10,
      max: 75,
      step: 5,
      unit: '% of original price',
      description: 'Secondary market auction or dealer trade-in residual percentage.',
    },
  ],
  calculate: (values) => {
    const buyPrice = Number(values.purchasePrice) || 95000;
    const monthlyRent = Number(values.monthlyRentalRate) || 3200;
    const monthsPerYear = Number(values.monthsUsedPerYear) || 8;
    const horizonYears = Number(values.ownershipLifespan) || 5;
    const resalePct = Number(values.resaleValuePct) || 40;

    // Rental path:
    const totalRentalCost = monthlyRent * monthsPerYear * horizonYears;

    // Ownership path:
    // Annual maintenance & repair: ~6% of purchase price per year
    const annualMaint = buyPrice * 0.06;
    // Insurance & storage: ~2.5% per year
    const annualInsStorage = buyPrice * 0.025;
    // Total maintenance & carrying over horizon
    const totalCarryingCost = (annualMaint + annualInsStorage) * horizonYears;

    // Financing cost (~6% annual interest assuming 80% LTV over 5 years ≈ 14% total interest on purchase)
    const financingInterest = buyPrice * 0.12;

    const resaleAmount = buyPrice * (resalePct / 100);
    const netOwnershipCost = buyPrice + totalCarryingCost + financingInterest - resaleAmount;

    // Break-even annual months of usage
    // netOwnershipCost / horizonYears = annual cost to own
    const annualOwnCost = netOwnershipCost / horizonYears;
    const breakEvenMonthsPerYear = Math.min(12, Math.max(1, Number((annualOwnCost / monthlyRent).toFixed(1))));

    const recommendation =
      monthsPerYear > breakEvenMonthsPerYear
        ? 'BUY: High utilization makes capital purchase more cost-effective.'
        : 'RENT: Lower seasonal utilization makes commercial rental cheaper with zero capital risk.';

    return {
      primaryLabel: `Total ${horizonYears}-Year Cost Comparison`,
      estimatedLow: Math.min(Math.round(totalRentalCost), Math.round(netOwnershipCost)),
      estimatedHigh: Math.max(Math.round(totalRentalCost), Math.round(netOwnershipCost)),
      pointEstimate: Math.round(netOwnershipCost),
      frequencyLabel: `${horizonYears}-year net ownership vs $${Math.round(totalRentalCost).toLocaleString()} rental`,
      breakdown: [
        {
          label: `Total Rental Cost (${monthsPerYear} mos/yr × ${horizonYears} yrs)`,
          amount: Math.round(totalRentalCost),
          description: `Cumulative rental payments with zero maintenance responsibility or resale risk.`,
        },
        {
          label: 'Net Ownership Cost (After Resale)',
          amount: Math.round(netOwnershipCost),
          description: `Purchase ($${buyPrice.toLocaleString()}) + Maint/Ins ($${Math.round(totalCarryingCost).toLocaleString()}) - Resale ($${Math.round(resaleAmount).toLocaleString()}).`,
        },
        {
          label: 'Estimated Resale Residual Cash Inflow',
          amount: Math.round(resaleAmount),
          description: `Liquid cash returned at end of year ${horizonYears} based on ${resalePct}% market residual.`,
        },
      ],
      keyDrivers: [
        `Break-Even Utilization: ${breakEvenMonthsPerYear} months/year. You entered ${monthsPerYear} months/year.`,
        `Financial Verdict: ${recommendation}`,
        `Net Savings: $${Math.abs(Math.round(totalRentalCost - netOwnershipCost)).toLocaleString()} ${netOwnershipCost < totalRentalCost ? 'saved by buying' : 'saved by renting'}.`,
      ],
      costReductionTips: [
        'If utilization is under 6 months/year, negotiate seasonal flex rental contracts with suppliers.',
        'Consider buying certified pre-owned units with 2-year factory warranties to avoid steep initial depreciation.',
        'Factor in tax deductions: Section 179 bonus depreciation can write off 100% of equipment purchase in year 1.',
      ],
    };
  },
  explainer: {
    title: 'How Rental vs. Purchase Break-Even Calculations Work',
    paragraphs: [
      'The decision to rent versus purchase heavy industrial machinery—such as telehandlers, articulated boom lifts, yard hostlers, or air compressors—hinges on annualized utilization and capital holding costs. While monthly rental rates appear high, they transfer maintenance, warranty repairs, and secondary market depreciation risk to the rental house.',
      'Our model evaluates total life-cycle costs across your target horizon. For ownership, the true cost is not merely the purchase check; it includes preventative servicing, wear items, commercial inland marine equipment insurance, secure storage, and loan financing interest, minus the discounted cash recovered upon secondary resale.',
      'The critical metric is the Break-Even Utilization Point (expressed in months per year). If your facility utilizes the equipment for more months than the break-even threshold, purchasing builds equity and minimizes cumulative expenses. If your project is seasonal, erratic, or under the threshold, commercial renting preserves working capital.',
      'Tax implications also deserve scrutiny. Under IRS Section 179, qualifying capital purchases can often be fully expensed in the year acquired, yielding significant immediate tax deductions that offset first-year cash outlays.',
    ],
    factors: [
      {
        name: 'Annual Utilization Duration',
        impact: 'High (Primary decision driver)',
        detail: 'Equipment idling in a yard still incurs capital depreciation, insurance, and battery degradation.',
      },
      {
        name: 'Secondary Resale Market Liquidity',
        impact: 'High (30-50% cash recovery)',
        detail: 'Well-maintained top-tier brands (Caterpillar, Genie, JLG) hold strong residual resale values.',
      },
      {
        name: 'Maintenance & Tire/Track Replacement',
        impact: 'Moderate (6-8% of capital cost/year)',
        detail: 'Renting eliminates unexpected hydraulic failures and major component overhaul liabilities.',
      },
    ],
    industryBenchmarkNote:
      'The standard industrial rule of thumb states that if an asset is utilized over 60% of the year (more than 7-8 months), purchasing or long-term capital leasing is generally financially superior.',
  },
  faqs: [
    {
      question: 'What is Section 179 tax deduction and how does it affect the buy decision?',
      answer:
        'IRS Section 179 allows businesses to deduct the full purchase price of qualifying industrial equipment purchased or financed during the tax year, up to statutory limits, rather than depreciating it over many years. This can save 21% to 30% in net cash outlays.',
    },
    {
      question: 'Who pays for freight and delivery on heavy rental equipment?',
      answer:
        'The renter is almost always responsible for round-trip freight charges, which typically range from $300 to $1,500 depending on distance and oversize transport permits. Factor freight into short-term rental math.',
    },
    {
      question: 'What is a Loss Damage Waiver (LDW) on rental agreements?',
      answer:
        'An LDW is an optional fee (usually 12-16% of the rental rate) charged by the rental supplier that waives your liability for physical damage to the machine, subject to a deductible. Providing your own certificate of insurance with an inland marine floater waives this fee.',
    },
    {
      question: 'Does renting provide flexibility for changing technology?',
      answer:
        'Yes. Renting allows you to always access the newest, most emissions-compliant electric or Tier 4 Final equipment without holding obsolete assets on your corporate balance sheet.',
    },
  ],
  relatedCalculatorIds: [
    'machinery-depreciation-hourly-rate-calculator',
    'cnc-machine-operating-cost-calculator',
    'forklift-insurance-cost-calculator',
  ],
};

export const iso9001CertificationCalc: CalculatorDefinition = {
  id: 'iso-9001-certification-cost-calculator',
  slug: 'iso-9001-certification-cost-calculator',
  categoryId: 'certification',
  path: '/certification/iso-9001-certification-cost-calculator',
  name: 'ISO 9001 Certification Cost Calculator',
  metaTitle: 'ISO 9001 Certification Cost Calculator – Audit & Implementation Budget',
  metaDescription:
    'Calculate ISO 9001:2015 quality management system certification costs. Estimate registrar audit days, consulting fees, internal training, and 3-year surveillance cycles.',
  shortDescription:
    'Estimate complete 3-year quality management system certification budgets, including consulting, registrar stage 1/2 audits, and annual surveillance.',
  targetAudience:
    'Quality directors, operations VPs, plant managers, and small-to-mid manufacturing executives pursuing or renewing ISO 9001 credentials.',
  featured: true,
  featuredBadge: 'Quality Standard',
  iconName: 'Award',
  fields: [
    {
      id: 'employeeHeadcount',
      label: 'Total Facility Headcount (All Shifts)',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '1 to 20 Employees (Small shop · 3-4 audit days)', value: 'tiny', multiplier: 0.65 },
        { label: '21 to 65 Employees (Mid-size facility · 5-6 audit days)', value: 'small', multiplier: 0.85 },
        { label: '66 to 175 Employees (Standard manufacturing · 7-8 audit days)', value: 'medium', multiplier: 1.0 },
        { label: '176 to 500 Employees (Large multi-shift plant · 10-12 audit days)', value: 'large', multiplier: 1.45 },
      ],
      description: 'Accredited registrars strictly determine mandatory audit duration using IAF MD 5 auditor man-day tables.',
    },
    {
      id: 'sitesCount',
      label: 'Number of Operating Facilities / Campuses',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 10,
      step: 1,
      unit: 'sites',
      description: 'Multi-site certifications require sampling audits across all satellite manufacturing locations.',
    },
    {
      id: 'currentMaturity',
      label: 'Existing Quality Management System (QMS) Maturity',
      type: 'select',
      defaultValue: 'informal',
      options: [
        { label: 'Starting from Scratch / Zero Documentation (1.35× consulting)', value: 'scratch', multiplier: 1.35 },
        { label: 'Informal Standard Operating Procedures (SOPs) exist (1.00×)', value: 'informal', multiplier: 1.0 },
        { label: 'Mature QMS / Updating from previous ISO or AS9100 (0.75×)', value: 'mature', multiplier: 0.75 },
      ],
      description: 'Maturity dictates required consulting hours for gap analysis and process mapping.',
    },
    {
      id: 'consultingModel',
      label: 'External Consulting & Implementation Support',
      type: 'select',
      defaultValue: 'hybrid',
      options: [
        { label: 'Turnkey Full-Service Consultant (Hands-on drafting & pre-audit)', value: 'turnkey', multiplier: 1.4 },
        { label: 'Hybrid Advisory (Templates + monthly mentoring & gap review)', value: 'hybrid', multiplier: 1.0 },
        { label: 'Internal DIY (Internal quality team only · Software toolkits)', value: 'diy', multiplier: 0.4 },
      ],
      description: 'Full-service consulting speeds timeline to 4-6 months with higher upfront advisory spend.',
    },
    {
      id: 'registrarTier',
      label: 'Registrar / Certification Body Tier',
      type: 'select',
      defaultValue: 'tier2',
      options: [
        { label: 'Global Tier 1 Registrar (BSI, DNV, TÜV, Bureau Veritas · $2,200/day)', value: 'tier1', multiplier: 1.2 },
        { label: 'Accredited Tier 2 Body (Perry Johnson, NQA, SAI Global · $1,800/day)', value: 'tier2', multiplier: 1.0 },
        { label: 'Regional Accredited Registrar (Standard ANAB accredited · $1,500/day)', value: 'tier3', multiplier: 0.85 },
      ],
      description: 'Brand prestige and customer supplier approval acceptance requirements.',
    },
  ],
  calculate: (values) => {
    const headMults: Record<string, { mult: number; auditDays: number }> = {
      tiny: { mult: 0.65, auditDays: 3.5 },
      small: { mult: 0.85, auditDays: 5.5 },
      medium: { mult: 1.0, auditDays: 7.5 },
      large: { mult: 1.45, auditDays: 11 },
    };
    const headInfo = headMults[values.employeeHeadcount] || headMults.medium;

    const sites = Number(values.sitesCount) || 1;
    const maturityMults: Record<string, number> = {
      scratch: 1.35,
      informal: 1.0,
      mature: 0.75,
    };
    const maturityMult = maturityMults[values.currentMaturity] || 1.0;

    const consultMults: Record<string, number> = {
      turnkey: 1.4,
      hybrid: 1.0,
      diy: 0.4,
    };
    const consultMult = consultMults[values.consultingModel] || 1.0;

    const regMults: Record<string, { mult: number; dayRate: number }> = {
      tier1: { mult: 1.2, dayRate: 2200 },
      tier2: { mult: 1.0, dayRate: 1800 },
      tier3: { mult: 0.85, dayRate: 1500 },
    };
    const regInfo = regMults[values.registrarTier] || regMults.tier2;

    // 1. Registrar Audit Fees (Stage 1 Readiness + Stage 2 Certification + Auditor Travel)
    const initialAuditDays = headInfo.auditDays * (1 + (sites - 1) * 0.4);
    const registrarInitial = Math.round(initialAuditDays * regInfo.dayRate + 2500); // travel/admin

    // 2. Consulting & Gap Assessment
    const baseConsulting = 12000 * headInfo.mult * maturityMult * consultMult;
    const consultingFees = Math.round(baseConsulting);

    // 3. Internal Training & Documentation Software
    const internalTrainingSoftware = Math.round(4500 * headInfo.mult);

    // Initial Year 1 Total
    const year1Total = registrarInitial + consultingFees + internalTrainingSoftware;

    // 4. Annual Surveillance Audits (Years 2 & 3: approx 1/3 of initial audit days per year)
    const annualSurveillancePerYear = Math.round((initialAuditDays * 0.35 * regInfo.dayRate + 1500));
    const total3YearCycle = year1Total + annualSurveillancePerYear * 2;

    const low = Math.round(year1Total * 0.88);
    const high = Math.round(year1Total * 1.18);

    return {
      primaryLabel: 'Initial Year-1 ISO 9001 Certification Budget',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: year1Total,
      frequencyLabel: `initial certification (plus ~$${annualSurveillancePerYear.toLocaleString()}/yr surveillance)`,
      breakdown: [
        {
          label: 'Registrar Stage 1 & Stage 2 Audit Fees',
          amount: registrarInitial,
          description: `Accredited registrar fees for ~${initialAuditDays.toFixed(1)} auditor days plus travel expenses.`,
        },
        {
          label: 'QMS Consulting, Gap Analysis & Pre-Audit',
          amount: consultingFees,
          description: `Process mapping, internal audit training, quality manual drafting, and management review prep.`,
        },
        {
          label: 'Internal Training & Document Control Tooling',
          amount: internalTrainingSoftware,
          description: `Lead internal auditor course certification and cloud document control subscription.`,
        },
        {
          label: 'Subsequent Years 2 & 3 Surveillance Audits',
          amount: annualSurveillancePerYear * 2,
          description: `Mandatory annual surveillance audits to maintain accredited certificate standing ($${annualSurveillancePerYear.toLocaleString()}/yr).`,
        },
      ],
      keyDrivers: [
        `Mandatory Registrar Days: ~${initialAuditDays.toFixed(1)} days required under IAF MD 5 guidelines.`,
        `Consulting Model: ${values.consultingModel === 'turnkey' ? 'Full-service turnkey guidance' : values.consultingModel === 'diy' ? 'Internal team DIY execution' : 'Hybrid advisory model'}.`,
        `Complete 3-Year Lifecycle Budget: ~$${total3YearCycle.toLocaleString()} including both surveillance audits.`,
      ],
      costReductionTips: [
        'Utilize a local registrar auditor based in your metro area to eliminate airfare and hotel per diems.',
        'Train two internal employees as certified internal auditors rather than hiring external consultants for annual internal reviews.',
        'Consolidate multiple ISO standards (e.g. ISO 9001 + ISO 14001) into an Integrated Management System (IMS) to save 20% on audit days.',
      ],
      benchmarks: [
        { label: 'Audit Days Required', value: `${initialAuditDays.toFixed(1)} days` },
        { label: 'Full 3-Year Total', value: `$${total3YearCycle.toLocaleString()}` },
        { label: 'Implementation Timeline', value: '5 – 8 Months' },
      ],
    };
  },
  explainer: {
    title: 'How ISO 9001 Certification Budgets Are Calculated',
    paragraphs: [
      'ISO 9001:2015 is the internationally recognized benchmark for Quality Management Systems (QMS). Achieving accredited certification is often a strict commercial prerequisite for bidding on aerospace, automotive, medical device, and Tier 1 industrial supply chains.',
      'Pricing consists of two principal phases: Implementation (Year 1) and Ongoing Maintenance (Years 2 & 3). In Year 1, costs are split between registrar audit fees and internal/consulting preparation costs. Accredited certification bodies (such as BSI, DNV, Perry Johnson, or TÜV) cannot arbitrarily invent audit durations—they are bound by IAF MD 5 (International Accreditation Forum Mandatory Document 5), which dictates exact auditor day minimums based on employee headcount, shifts, and process complexity.',
      'The initial registration audit is performed in two separate stages: Stage 1 (Documentation and Readiness Review) and Stage 2 (On-Site Operational Audit and Process Verification). If major non-conformances are discovered during Stage 2, registrars charge for a subsequent special re-audit, highlighting the importance of thorough internal pre-audits.',
      'Certificates remain valid for a 3-year cycle. To preserve certification, organizations must undergo mandatory annual Surveillance Audits at the end of Year 1 and Year 2 (requiring approximately one-third of the initial audit duration), culminating in a comprehensive Recertification Audit at the end of Year 3.',
    ],
    factors: [
      {
        name: 'IAF MD 5 Mandatory Headcount Table',
        impact: 'High (Dictates auditor days)',
        detail: 'Registrars calculate audit duration based on total staff, shifts, and high-risk technical manufacturing steps.',
      },
      {
        name: 'Consulting Model & Gap Closure',
        impact: 'High ($5,000 to $25,000 variance)',
        detail: 'Hiring a dedicated quality consultant speeds readiness and reduces risk of failed Stage 2 audits.',
      },
      {
        name: 'Auditor Travel & Expenses',
        impact: 'Moderate ($1,500 to $4,500)',
        detail: 'Requesting a regionally based lead auditor significantly reduces reimbursable travel charges.',
      },
    ],
    industryBenchmarkNote:
      'For a typical 50-person manufacturing plant, total initial ISO 9001 implementation and certification costs range from $18,000 to $32,000 over a 6-month timeframe.',
  },
  faqs: [
    {
      question: 'Can the same firm consult on our QMS and also certify us?',
      answer:
        'No. Strict international accreditation rules (ISO/IEC 17021) strictly prohibit certification bodies from offering consulting services to the same client. There must be an independent firewall between the implementation consultant and the accredited registrar.',
    },
    {
      question: 'What is the difference between Stage 1 and Stage 2 audits?',
      answer:
        'The Stage 1 audit assesses your documentation, policy manual, scope, and confirms that you have completed at least one full cycle of internal audits and a management review. The Stage 2 audit evaluates actual shop floor implementation, interviewing operators and sampling quality records.',
    },
    {
      question: 'How long does it take to get ISO 9001 certified?',
      answer:
        'Most mid-sized industrial facilities require between 4 and 8 months from kickoff to final Stage 2 audit completion. Companies with existing SOPs can occasionally complete certification in 3 to 4 months.',
    },
    {
      question: 'What happens if we find a non-conformance during the audit?',
      answer:
        'Minor non-conformances require submitting a written corrective action plan within 60 to 90 days without withholding certification. A major non-conformance (such as complete absence of internal audits or calibration logs) requires an on-site verification re-audit before certification can be granted.',
    },
  ],
  relatedCalculatorIds: [
    'iso-14001-certification-cost-calculator',
    'manufacturing-plant-insurance-calculator',
    'osha-fine-calculator',
  ],
};

export const iso14001CertificationCalc: CalculatorDefinition = {
  id: 'iso-14001-certification-cost-calculator',
  slug: 'iso-14001-certification-cost-calculator',
  categoryId: 'certification',
  path: '/certification/iso-14001-certification-cost-calculator',
  name: 'ISO 14001 Environmental Audit Cost Calculator',
  metaTitle: 'ISO 14001 Environmental Audit Cost Calculator – EMS Certification',
  metaDescription:
    'Calculate ISO 14001:2015 Environmental Management System (EMS) certification costs. Estimate aspects registers, registrar audit days, and surveillance fees.',
  shortDescription:
    'Estimate complete 3-year environmental management system audit budgets, aspect registers, and registrar fees for industrial plants.',
  targetAudience:
    'Environmental directors, sustainability leaders, plant managers, and industrial compliance executives achieving verified EMS accreditation.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'employeeCount',
      label: 'Facility Total Headcount',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '1 to 25 Employees (Small shop · 3-4 audit days)', value: 'tiny', multiplier: 0.7 },
        { label: '26 to 85 Employees (Mid-size manufacturing · 5-6 audit days)', value: 'small', multiplier: 0.9 },
        { label: '86 to 250 Employees (Standard industrial plant · 7-9 audit days)', value: 'medium', multiplier: 1.0 },
        { label: '251+ Employees (Heavy multi-shift complex · 10-14 audit days)', value: 'large', multiplier: 1.4 },
      ],
      description: 'Used by accredited registrars to calculate mandatory EMS audit man-days.',
    },
    {
      id: 'environmentalAspects',
      label: 'Environmental Complexity & Aspect Profile',
      type: 'select',
      defaultValue: 'moderate',
      options: [
        { label: 'Low Complexity (Dry assembly, packaging, warehousing · 0.80×)', value: 'low', multiplier: 0.8 },
        { label: 'Moderate Complexity (Machining, cutting fluids, spray booths · 1.00×)', value: 'moderate', multiplier: 1.0 },
        { label: 'High Complexity (Chemical processing, plating, wastewater treatment · 1.35×)', value: 'high', multiplier: 1.35 },
      ],
      description: 'Discharge permits, hazardous air pollutants, and waste streams dictate aspect register depth.',
    },
    {
      id: 'existingIso9001',
      label: 'Existing ISO 9001 QMS Integration',
      type: 'select',
      defaultValue: 'integrated',
      options: [
        { label: 'Already ISO 9001 Certified (Integrate into existing system · 0.75×)', value: 'integrated', multiplier: 0.75 },
        { label: 'Standalone Standalone EMS (No existing ISO certifications · 1.00×)', value: 'standalone', multiplier: 1.0 },
      ],
      description: 'Integrating with an existing Annex SL high-level structure cuts document preparation time by 25%.',
    },
    {
      id: 'consultingScope',
      label: 'Consulting Support Level',
      type: 'select',
      defaultValue: 'advisory',
      options: [
        { label: 'Full Turnkey Consulting (Aspect mapping + legal register + audit prep)', value: 'turnkey', multiplier: 1.35 },
        { label: 'Advisory Mentoring (Templates + monthly coaching sessions)', value: 'advisory', multiplier: 1.0 },
        { label: 'Internal Staff Led (DIY with internal EHS team)', value: 'diy', multiplier: 0.45 },
      ],
      description: 'Level of external expert guidance utilized for environmental aspect identification.',
    },
  ],
  calculate: (values) => {
    const headMults: Record<string, { mult: number; days: number }> = {
      tiny: { mult: 0.7, days: 3.5 },
      small: { mult: 0.9, days: 5.0 },
      medium: { mult: 1.0, days: 7.5 },
      large: { mult: 1.4, days: 11.5 },
    };
    const head = headMults[values.employeeCount] || headMults.medium;

    const aspectMults: Record<string, number> = {
      low: 0.8,
      moderate: 1.0,
      high: 1.35,
    };
    const aspectMult = aspectMults[values.environmentalAspects] || 1.0;

    const iso9001Mults: Record<string, number> = {
      integrated: 0.75,
      standalone: 1.0,
    };
    const iso9001Mult = iso9001Mults[values.existingIso9001] || 1.0;

    const consultMults: Record<string, number> = {
      turnkey: 1.35,
      advisory: 1.0,
      diy: 0.45,
    };
    const consultMult = consultMults[values.consultingScope] || 1.0;

    // Registrar fee ($1,850/day standard + travel)
    const auditDays = head.days * (aspectMult > 1 ? 1.15 : aspectMult < 1 ? 0.9 : 1.0);
    const registrarInitial = Math.round(auditDays * 1850 + 2200);

    // Consulting & Aspect/Impact Register development
    const consultingFees = Math.round(14000 * head.mult * aspectMult * iso9001Mult * consultMult);

    // Internal Training & Legal Register Subscription
    const internalCosts = Math.round(4200 * head.mult);

    const year1Total = registrarInitial + consultingFees + internalCosts;
    const surveillancePerYear = Math.round(auditDays * 0.35 * 1850 + 1200);
    const total3Year = year1Total + surveillancePerYear * 2;

    const low = Math.round(year1Total * 0.88);
    const high = Math.round(year1Total * 1.18);

    return {
      primaryLabel: 'Initial Year-1 ISO 14001 Certification Budget',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: year1Total,
      frequencyLabel: 'initial certification investment',
      breakdown: [
        {
          label: 'Registrar Stage 1 & Stage 2 EMS Audits',
          amount: registrarInitial,
          description: `Accredited registrar fees for ~${auditDays.toFixed(1)} auditor days plus travel expenses.`,
        },
        {
          label: 'Aspect/Impact Register & Legal Compliance Review',
          amount: consultingFees,
          description: `Identification of emissions, water discharges, chemical handling, and regulatory legal register.`,
        },
        {
          label: 'Internal Auditor Training & Emergency Procedures',
          amount: internalCosts,
          description: `Training internal EHS auditors and running simulated environmental spill drill exercises.`,
        },
        {
          label: 'Subsequent Years 2 & 3 Surveillance Audits',
          amount: surveillancePerYear * 2,
          description: `Annual surveillance audits to maintain accredited certification ($${surveillancePerYear.toLocaleString()}/yr).`,
        },
      ],
      keyDrivers: [
        `Audit Duration: ~${auditDays.toFixed(1)} mandatory registrar days under IAF MD 5 tables.`,
        `ISO 9001 Integration: ${iso9001Mult < 1 ? 'Integrated Management System (25% preparation savings)' : 'Standalone system'}.`,
        `Estimated 3-Year Life-Cycle Cost: ~$${total3Year.toLocaleString()}.`,
      ],
      costReductionTips: [
        'Build upon your existing ISO 9001 document control and management review structures to eliminate duplicate meetings.',
        'Use digital EHS legal register update services to track changes in state and federal environmental rules automatically.',
        'Schedule combined ISO 9001 + ISO 14001 joint surveillance audits to save 20% to 30% on auditor travel fees.',
      ],
      benchmarks: [
        { label: 'Initial Audit Days', value: `${auditDays.toFixed(1)} days` },
        { label: '3-Year Total Budget', value: `$${total3Year.toLocaleString()}` },
      ],
    };
  },
  explainer: {
    title: 'How ISO 14001 Environmental Certification Costs Are Calculated',
    paragraphs: [
      'ISO 14001:2015 establishes requirements for an Environmental Management System (EMS). It provides a structured framework to identify significant environmental aspects (such as air emissions, wastewater discharge, hazardous waste, and energy consumption) and systematically reduce footprint while ensuring legal compliance.',
      'A primary cost differentiator is whether an organization is already ISO 9001 certified. Both standards share the Annex SL High-Level Structure (HLS), featuring identical clauses for leadership, risk management, internal auditing, and corrective action. Facilities integrating ISO 14001 into an existing QMS can save 25% to 35% in implementation consulting and up to 20% in ongoing registrar audit days.',
      'The initial budget covers three core components: Registrar Stage 1 and Stage 2 audit days (governed by IAF MD 5 guidelines), consulting assistance to develop the Environmental Aspects and Impacts Register, and mandatory legal compliance evaluations.',
      'Demonstrating compliance with local, state, and federal environmental laws (Clean Air Act, Clean Water Act, RCRA) is mandatory. Registrars verify not only that you have an environmental policy, but that you track environmental permits, monitor discharge metrics, and maintain documented spill response procedures.',
    ],
    factors: [
      {
        name: 'Process Hazard & Aspect Complexity',
        impact: 'High (20-35% variance)',
        detail: 'Chemical processing and electroplating require deeper aspect analysis than dry mechanical packaging.',
      },
      {
        name: 'Integrated Management System (IMS) Synergies',
        impact: 'High (up to 30% savings)',
        detail: 'Combining quality (9001) and environmental (14001) audits minimizes redundant documentation.',
      },
      {
        name: 'Internal vs. External Lead Auditor Training',
        impact: 'Moderate ($3,000 to $6,000)',
        detail: 'Training internal staff avoids hiring recurring external auditors for mandatory annual internal EMS audits.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing facilities typically budget $16,000 to $28,000 for initial ISO 14001 certification, plus $4,500 to $7,000 annually for surveillance audits.',
  },
  faqs: [
    {
      question: 'Does ISO 14001 certify that a plant produces zero pollution?',
      answer:
        'No. ISO 14001 certifies the management system, not specific environmental performance levels. It requires an active commitment to legal compliance, pollution prevention, and continuous systematic improvement in environmental metrics over time.',
    },
    {
      question: 'What is an Environmental Aspects and Impacts Register?',
      answer:
        'The aspect register is the foundational document of ISO 14001. An "aspect" is an element of your activities that interacts with the environment (e.g., solvent degreasing), and the "impact" is the resulting change to the environment (e.g., VOC air emissions and potential photochemical ozone creation).',
    },
    {
      question: 'Can small businesses achieve ISO 14001 affordably?',
      answer:
        'Yes. Small manufacturers under 25 employees frequently use hybrid consulting templates and internal project teams, achieving accredited certification for $12,000 to $16,000 in Year 1.',
    },
    {
      question: 'What are the commercial benefits of ISO 14001 certification?',
      answer:
        'Major automotive OEMs, multinational consumer brands, and government procurement agencies increasingly mandate ISO 14001 certification as a qualifying condition for vendor master services agreements.',
    },
  ],
  relatedCalculatorIds: [
    'epa-compliance-cost-calculator',
    'iso-9001-certification-cost-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};
