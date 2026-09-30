import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const craneRentalCostEstimator: CalculatorDefinition = {
  id: 'crane-rental-cost-estimator',
  slug: 'crane-rental-cost-estimator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/crane-rental-cost-estimator',
  name: 'Crane Rental Cost Estimator',
  metaTitle: 'Crane Rental Cost Estimator – Mobile, Hydraulic & Crawler Rates',
  metaDescription:
    'Calculate industrial mobile crane rental costs. Estimate hourly, daily, and weekly rates by tonnage capacity, NCCCO certified operator crew, and mobilization freight.',
  shortDescription:
    'Calculate commercial crane rental costs by tonnage capacity, bare vs. operated crew, mobilization freight distance, and municipal street permits.',
  targetAudience:
    'Industrial plant engineers, rigging contractors, steel erectors, HVAC mechanical contractors, and project estimators budgeting heavy lift operations.',
  featured: true,
  featuredBadge: 'Heavy Lift',
  iconName: 'Wrench',
  fields: [
    {
      id: 'craneType',
      label: 'Crane Classification & Lifting Capacity',
      type: 'select',
      defaultValue: 'hydraulic_50',
      options: [
        { label: 'Carry Deck / Industrial Yard Crane (15 to 25 Ton · $175/hr)', value: 'carry_deck', multiplier: 0.75 },
        { label: 'Boom Truck / Hydraulic Truck Crane (35 to 60 Ton · $245/hr)', value: 'hydraulic_50', multiplier: 1.0 },
        { label: 'All-Terrain Mobile Crane (70 to 120 Ton · $365/hr)', value: 'all_terrain_100', multiplier: 1.5 },
        { label: 'Heavy All-Terrain Crane (150 to 300 Ton · $580/hr)', value: 'all_terrain_250', multiplier: 2.4 },
        { label: 'Lattice Boom Crawler Crane (350+ Ton · $850/hr)', value: 'crawler_heavy', multiplier: 3.5 },
      ],
      description: 'Lifting capacity required based on maximum radius and boom length.',
    },
    {
      id: 'rentalBasis',
      label: 'Rental Duration Unit',
      type: 'select',
      defaultValue: 'day',
      options: [
        { label: 'Hourly (Standard 4 to 8-hour portal-to-portal minimum)', value: 'hourly' },
        { label: 'Daily Shift (8-hour standard workday rate)', value: 'day' },
        { label: 'Weekly Rate (40 hours · 3.5× daily rate discount)', value: 'week' },
        { label: 'Monthly Rental (160 hours · 3× weekly rate discount)', value: 'month' },
      ],
      description: 'Longer contract commitments unlock significant multi-day and weekly volume discounts.',
    },
    {
      id: 'durationCount',
      label: 'Duration Count (Hours, Days, Weeks, or Months)',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 60,
      step: 1,
      unit: 'units',
      description: 'Number of duration units selected above.',
    },
    {
      id: 'crewType',
      label: 'Operator & Rigging Crew Configuration',
      type: 'select',
      defaultValue: 'operated_nccco',
      options: [
        { label: 'Operated: NCCCO Certified Crane Operator Included', value: 'operated_nccco', multiplier: 1.0 },
        { label: 'Full Rigging Crew: Operator + Certified Rigger + Signalperson', value: 'full_crew', multiplier: 1.45 },
        { label: 'Bare Rental (Customer supplies qualified operator & fuel)', value: 'bare', multiplier: 0.65 },
      ],
      description: 'OSHA 1926 Subpart CC mandates certified operators and qualified riggers for critical picks.',
    },
    {
      id: 'mobilizationDistance',
      label: 'Mobilization & Counterweight Freight (Depot Distance)',
      type: 'select',
      defaultValue: 'mid',
      options: [
        { label: 'Local Yard Delivery (Under 25 Miles · Single Lowboy)', value: 'local', multiplier: 0.8 },
        { label: 'Regional Transport (25 to 75 Miles · 1-2 Support Semis)', value: 'mid', multiplier: 1.0 },
        { label: 'Long Distance (75 to 150 Miles · Oversize Escort Required)', value: 'far', multiplier: 1.6 },
        { label: 'Heavy Mobilization (150+ Miles · Multiple Counterweight Trucks)', value: 'heavy_haul', multiplier: 2.5 },
      ],
      description: 'Transporting boom sections, counterweight slabs, and escort pilot cars.',
    },
    {
      id: 'permitsTraffic',
      label: 'Municipal Permitting & Traffic Control',
      type: 'select',
      defaultValue: 'basic',
      options: [
        { label: 'Private Industrial Facility / No Public Street Closure ($0)', value: 'none', multiplier: 0 },
        { label: 'City Street / Lane Closure Permit ($750 – $1,500)', value: 'basic', multiplier: 1.0 },
        { label: 'Full Road Closure with Police Escort & Traffic Barricades ($2,500+)', value: 'full_closure', multiplier: 2.2 },
      ],
      description: 'Municipal DOT permits for crane outrigger setup on public rights-of-way.',
    },
  ],
  calculate: (values) => {
    const craneRates: Record<string, { hourly: number; day: number; mobBase: number }> = {
      carry_deck: { hourly: 175, day: 1400, mobBase: 650 },
      hydraulic_50: { hourly: 245, day: 1960, mobBase: 1200 },
      all_terrain_100: { hourly: 365, day: 2920, mobBase: 2400 },
      all_terrain_250: { hourly: 580, day: 4640, mobBase: 5500 },
      crawler_heavy: { hourly: 850, day: 6800, mobBase: 11000 },
    };

    const crane = craneRates[values.craneType] || craneRates.hydraulic_50;
    const count = Number(values.durationCount) || 1;

    const crewMults: Record<string, number> = {
      operated_nccco: 1.0,
      full_crew: 1.45,
      bare: 0.65,
    };
    const crewMult = crewMults[values.crewType] || 1.0;

    const mobMults: Record<string, number> = {
      local: 0.8,
      mid: 1.0,
      far: 1.6,
      heavy_haul: 2.5,
    };
    const mobMult = mobMults[values.mobilizationDistance] || 1.0;

    // Base rental calculation
    let baseCraneCost = 0;
    if (values.rentalBasis === 'hourly') {
      const effectiveHours = Math.max(count, 4); // 4-hour minimum
      baseCraneCost = effectiveHours * crane.hourly * crewMult;
    } else if (values.rentalBasis === 'day') {
      baseCraneCost = count * crane.day * crewMult;
    } else if (values.rentalBasis === 'week') {
      // Weekly is roughly 3.5× daily rate
      baseCraneCost = count * (crane.day * 3.5) * crewMult;
    } else {
      // Monthly is roughly 3× weekly rate (10.5× daily rate)
      baseCraneCost = count * (crane.day * 10.5) * crewMult;
    }

    // Mobilization & freight (round-trip mobilization and demobilization)
    const mobilizationFee = Math.round(crane.mobBase * mobMult * 2);

    // Permits & Traffic control
    const permitMap: Record<string, number> = {
      none: 0,
      basic: 1100,
      full_closure: 2800,
    };
    const permitFee = permitMap[values.permitsTraffic] || 0;

    // Fuel & rigging equipment surcharge (hook blocks, nylon slings, shackles)
    const riggingSurcharge = Math.round(baseCraneCost * 0.08);

    const totalEstimate = Math.round(baseCraneCost + mobilizationFee + permitFee + riggingSurcharge);
    const low = Math.round(totalEstimate * 0.9);
    const high = Math.round(totalEstimate * 1.15);

    return {
      primaryLabel: `Total Estimated Crane Rental & Operation`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalEstimate,
      frequencyLabel: `total project estimate (${count} ${values.rentalBasis}${count > 1 ? 's' : ''})`,
      breakdown: [
        {
          label: 'Crane Time & Operating Crew',
          amount: Math.round(baseCraneCost),
          description: `Machine time and ${values.crewType === 'bare' ? 'bare machine' : values.crewType === 'full_crew' ? 'operator + 2 riggers' : 'NCCCO certified operator'}.`,
        },
        {
          label: 'Mobilization, Counterweights & Freight',
          amount: mobilizationFee,
          description: `Round-trip transport from depot to jobsite including heavy tractor-trailers.`,
        },
        {
          label: 'Rigging Hardware & Fuel Surcharge',
          amount: riggingSurcharge,
          description: `Spreader bars, wire rope slings, synthetic chokers, and diesel fuel allocation.`,
        },
        ...(permitFee > 0
          ? [
              {
                label: 'City DOT Permits & Traffic Barricades',
                amount: permitFee,
                description: `Municipal right-of-way occupancy, traffic control plans, and street closure fees.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Capacity Class: ${values.craneType.replace('_', ' ').toUpperCase()} (${crane.hourly}/hr base rate).`,
        `Crew Model: ${values.crewType === 'full_crew' ? 'Turnkey Rigging Crew (+45%)' : values.crewType === 'bare' ? 'Bare Machine (-35%)' : 'Operated Standard'}.`,
        `Mobilization Impact: $${mobilizationFee.toLocaleString()} round-trip freight (${Math.round((mobilizationFee / totalEstimate) * 100)}% of total cost).`,
      ],
      costReductionTips: [
        'Perform all ground prep, cribbing, and staging prior to crane arrival to avoid portal-to-portal standby charges ($250+/hr).',
        'Consolidate multiple equipment picks into a single continuous 8-hour shift rather than splitting over consecutive half-days.',
        'Obtain city right-of-way permits 3 weeks in advance to avoid expedited agency review surcharges.',
      ],
      benchmarks: [
        { label: 'Mobilization Share', value: `${Math.round((mobilizationFee / totalEstimate) * 100)}% of total` },
        { label: 'Effective Day Rate', value: `$${Math.round(totalEstimate / Math.max(1, count * (values.rentalBasis === 'week' ? 5 : values.rentalBasis === 'month' ? 20 : 1))).toLocaleString()}/day` },
      ],
    };
  },
  explainer: {
    title: 'How Crane Rental Costs and Mob/Demob Fees Are Calculated',
    paragraphs: [
      'Commercial crane rentals operate on an entirely different pricing framework than standard earthmoving or access equipment. Because mobile cranes require dedicated certified operators, complex road travel permits, and secondary transport trucks for counterweight slabs, up to 40% of the total invoice cost can be incurred before the hook ever lifts off the ground.',
      'Pricing begins with the crane capacity classification, determined by the maximum lift radius and load weight. A 50-ton hydraulic truck crane can travel on public roads with minimal axle permitting. However, heavy all-terrain cranes exceeding 100 tons cannot legally drive with counterweights installed; they require two to four flatbed tractor-trailers to carry the boom sections and counterweight trays, driving mobilization and demobilization (mob/demob) charges into thousands of dollars.',
      'Under OSHA 29 CFR 1926 Subpart CC, employers must ensure crane operators are accredited by a nationally recognized certifying body (such as the National Commission for the Certification of Crane Operators, NCCCO). "Operated" rentals include the NCCCO crane operator and fuel. "Bare" rentals are reserved for licensed contractors with verified inland marine rigging insurance and qualified in-house operators.',
      'Time billing usually follows "portal-to-portal" terms—billing commences when the crane pulls out of the supplier’s equipment depot and concludes when it returns to the yard. When operating on public roadways or blocking lanes, municipal DOT encroachment permits and off-duty police escorts can add another $1,000 to $3,500 to the job budget.',
    ],
    factors: [
      {
        name: 'Tonnage & Radius Capacity',
        impact: 'High ($175 to $850+/hr)',
        detail: 'Increasing crane size from 50 tons to 250 tons triples the hourly machine rate and multiplies mobilization trucks.',
      },
      {
        name: 'Mobilization & Counterweight Trailers',
        impact: 'High ($1,200 to $20,000+)',
        detail: 'Heavy cranes require separate lowboy tractor-trailers to transport counterweights and outrigger mats.',
      },
      {
        name: 'Portal-to-Portal Time Minimums',
        impact: 'Moderate (4-8 hour minimums)',
        detail: 'Most rental companies require a 4-hour or 8-hour shift minimum plus travel time between yard and site.',
      },
      {
        name: 'Street Encroachment & Police Traffic Escort',
        impact: 'Moderate ($800 to $3,000)',
        detail: 'City permits and traffic safety plans are mandatory whenever outriggers occupy public roadway lanes.',
      },
    ],
    industryBenchmarkNote:
      'Nationwide crane industry data shows the average 50-ton hydraulic crane day-rate runs $1,800 to $2,400 with operator, while a 150-ton all-terrain crane averages $3,800 to $5,200 per 8-hour shift plus freight.',
  },
  faqs: [
    {
      question: 'What does "portal-to-portal" crane billing mean?',
      answer:
        'Portal-to-portal billing means the customer pays for the crane and operator starting from the moment the crane leaves the supplier’s equipment yard until it completes the lift and returns to the yard. Travel time is billed at the full hourly operating rate.',
    },
    {
      question: 'What is the difference between an Operated Rental and a Bare Rental?',
      answer:
        'An Operated Rental includes the crane, an NCCCO-certified crane operator, routine maintenance, and diesel fuel. A Bare Rental provides only the crane itself; the renting customer is responsible for providing their own certified operator, fuel, daily maintenance, and comprehensive inland marine physical damage insurance.',
    },
    {
      question: 'Why do large cranes require separate mobilization trucks?',
      answer:
        'Due to state DOT axle-load weight restrictions (Federal Bridge Formula), heavy cranes cannot legally drive on public highways with their counterweights attached. Counterweight blocks, jibs, and outrigger pads must be detached and hauled separately on tractor-trailers, then assembled on-site.',
    },
    {
      question: 'Who is liable if an accident occurs during a crane pick?',
      answer:
        'Commercial crane rental agreements contain stringent indemnification clauses. Unless the crane operator acts with gross negligence, the site contractor (designated as the "Controlling Entity" under OSHA) is responsible for ground stability, verifying underground utilities, and proper rigging attachment.',
    },
  ],
  relatedCalculatorIds: [
    'heavy-equipment-rental-vs-buy-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'forklift-insurance-cost-calculator',
  ],
};

export const heavyEquipmentFinancingCalc: CalculatorDefinition = {
  id: 'heavy-equipment-financing-calculator',
  slug: 'heavy-equipment-financing-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/heavy-equipment-financing-calculator',
  name: 'Heavy Equipment Financing Calculator',
  metaTitle: 'Heavy Equipment Financing Calculator – Commercial Loan & Lease Rates',
  metaDescription:
    'Calculate heavy industrial equipment financing payments, interest charges, Section 179 tax deductions, and capital lease options for manufacturing machinery.',
  shortDescription:
    'Estimate monthly equipment loan and lease payments, total interest carrying costs, and first-year Section 179 tax savings.',
  targetAudience:
    'Plant CFOs, fabrication shop owners, construction contractors, and capital planners evaluating commercial loans vs. capital leases.',
  featured: false,
  iconName: 'DollarSign',
  fields: [
    {
      id: 'equipmentPrice',
      label: 'Total Equipment Invoice Price (Installed)',
      type: 'number',
      defaultValue: 180000,
      min: 10000,
      max: 2000000,
      step: 5000,
      unit: '$ USD',
      description: 'Delivered capital cost including rigging, accessories, and warranty.',
    },
    {
      id: 'downPaymentPct',
      label: 'Cash Down Payment Percentage (%)',
      type: 'select',
      defaultValue: '10',
      options: [
        { label: '0% Down (100% Financed · Working Capital Preservation)', value: '0' },
        { label: '10% Down Payment (Standard commercial tier)', value: '10' },
        { label: '15% Down Payment (Lower monthly payment)', value: '15' },
        { label: '20% Down Payment (Optimal interest rate tier)', value: '20' },
        { label: '25% Down Payment (Lowest total finance charge)', value: '25' },
      ],
      description: 'Initial equity injection into the financing agreement.',
    },
    {
      id: 'termMonths',
      label: 'Financing Term Duration',
      type: 'select',
      defaultValue: '60',
      options: [
        { label: '24 Months (2 Years · Accelerated equity buildup)', value: '24' },
        { label: '36 Months (3 Years · Standard short cycle)', value: '36' },
        { label: '48 Months (4 Years · Balanced cash flow)', value: '48' },
        { label: '60 Months (5 Years · Standard heavy machinery)', value: '60' },
        { label: '72 Months (6 Years · Extended low payment)', value: '72' },
        { label: '84 Months (7 Years · Large enterprise machinery)', value: '84' },
      ],
      description: 'Typical heavy equipment amortization spans 36 to 60 months.',
    },
    {
      id: 'interestApr',
      label: 'Annual Percentage Rate (APR %)',
      type: 'number',
      defaultValue: 7.5,
      min: 4.0,
      max: 18.0,
      step: 0.25,
      unit: '% APR',
      description: 'Commercial equipment loan interest rate based on market prime and corporate credit.',
    },
    {
      id: 'financeStructure',
      label: 'Financing Agreement Structure',
      type: 'select',
      defaultValue: 'standard_loan',
      options: [
        { label: 'Commercial Equipment Loan (Direct ownership + Title lien)', value: 'standard_loan', multiplier: 1.0 },
        { label: '$1 Buyout Capital Lease (Ownership transfers for $1 at end)', value: 'capital_lease', multiplier: 1.02 },
        { label: 'Fair Market Value (FMV) Operating Lease (Lowest payment / Return machine)', value: 'fmv_lease', multiplier: 0.85 },
      ],
      description: 'Capital leases allow full tax ownership; FMV leases treat payments as operating expenses.',
    },
    {
      id: 'corporateTaxRate',
      label: 'Effective Corporate Income Tax Rate (%)',
      type: 'number',
      defaultValue: 25,
      min: 15,
      max: 35,
      step: 1,
      unit: '% tax rate',
      description: 'Used to calculate first-year Section 179 expensing cash tax savings.',
    },
  ],
  calculate: (values) => {
    const price = Number(values.equipmentPrice) || 180000;
    const downPct = Number(values.downPaymentPct) || 10;
    const months = Number(values.termMonths) || 60;
    const apr = Number(values.interestApr) || 7.5;
    const taxRate = Number(values.corporateTaxRate) || 25;

    const structureMults: Record<string, number> = {
      standard_loan: 1.0,
      capital_lease: 1.02,
      fmv_lease: 0.85,
    };
    const structMult = structureMults[values.financeStructure] || 1.0;

    const downPayment = Math.round(price * (downPct / 100));
    const principal = price - downPayment;

    // Standard monthly loan payment formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyRate = apr / 100 / 12;
    let baseMonthlyPayment = 0;
    if (monthlyRate === 0) {
      baseMonthlyPayment = principal / months;
    } else {
      baseMonthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const monthlyPayment = Math.round(baseMonthlyPayment * structMult);
    const totalPayments = monthlyPayment * months;
    const totalFinanceCharges = Math.max(0, totalPayments - principal);
    const totalCostOfEquipment = downPayment + totalPayments;

    // Section 179 First-Year Tax Shield calculation
    // Full purchase price eligible for 100% first-year expensing under IRS limits
    const section179Deduction = price;
    const estimatedTaxSavings = Math.round(section179Deduction * (taxRate / 100));

    return {
      primaryLabel: 'Estimated Monthly Equipment Payment',
      estimatedLow: Math.round(monthlyPayment * 0.95),
      estimatedHigh: Math.round(monthlyPayment * 1.06),
      pointEstimate: monthlyPayment,
      frequencyLabel: `per month (${months} months)`,
      breakdown: [
        {
          label: 'Financed Loan Principal',
          amount: principal,
          description: `$${price.toLocaleString()} purchase price minus $${downPayment.toLocaleString()} (${downPct}%) cash down payment.`,
        },
        {
          label: `Total Financing Interest Charges (${apr}% APR)`,
          amount: totalFinanceCharges,
          description: `Cumulative finance interest paid over the ${months}-month term.`,
        },
        {
          label: 'First-Year Section 179 Tax Shield',
          amount: estimatedTaxSavings,
          description: `Immediate corporate tax reduction at ${taxRate}% tax rate on $${price.toLocaleString()} qualifying capital asset.`,
        },
        {
          label: 'Initial Cash Required at Closing',
          amount: downPayment + 650, // doc fee
          description: `Down payment plus standard commercial loan documentation and UCC-1 filing fees (~$650).`,
        },
      ],
      keyDrivers: [
        `Loan Amount: $${principal.toLocaleString()} financed over ${months} months.`,
        `Section 179 Impact: Up to $${estimatedTaxSavings.toLocaleString()} in immediate cash tax savings in Year 1.`,
        `Effective Net Cost: $${(totalCostOfEquipment - estimatedTaxSavings).toLocaleString()} net after accounting for Section 179 tax benefits.`,
      ],
      costReductionTips: [
        'Leverage IRS Section 179 to deduct up to 100% of the equipment price in Year 1 to offset upfront payments.',
        'Compare a $1 Buyout Capital Lease against a standard chattel mortgage to evaluate off-balance sheet reporting benefits.',
        'Consider 48 or 60-month terms to balance low monthly debt-service against excessive cumulative interest charges.',
      ],
      benchmarks: [
        { label: 'Total Interest Paid', value: `$${totalFinanceCharges.toLocaleString()}` },
        { label: 'Sec. 179 Tax Shield', value: `-$${estimatedTaxSavings.toLocaleString()}` },
        { label: 'Financing Cost / Year', value: `$${Math.round(totalFinanceCharges / (months / 12)).toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Heavy Equipment Financing and Tax Deductions Are Calculated',
    paragraphs: [
      'Financing capital machinery—such as CNC machining centers, stamping presses, heavy earthmoving equipment, or laser cutters—requires balancing monthly operational cash flow against total interest expense and corporate tax incentives.',
      'Our model evaluates the standard amortizing commercial installment loan and capital lease schedules. In a standard commercial loan or $1-Buyout Capital Lease, the business holds full equity ownership from day one, recording the asset on its balance sheet. In contrast, Fair Market Value (FMV) leases result in 15% to 20% lower monthly payments because the lender retains residual value, but the machine must be purchased at fair market value or returned at lease end.',
      'The single most impactful financial catalyst for industrial equipment acquisition in the United States is IRS Section 179 and Bonus Depreciation. Under current tax rules, qualifying industrial machinery (both new and used) put into service during the tax year can be deducted up to 100% against corporate taxable income in Year 1, rather than depreciating slowly over 7 to 10 years.',
      'For a business in the 25% tax bracket, a $180,000 equipment purchase can generate approximately $45,000 in immediate cash tax savings—frequently exceeding the entire first year of monthly loan installments.',
    ],
    factors: [
      {
        name: 'Down Payment Equity Ratio',
        impact: 'Moderate (Lowers debt principal)',
        detail: 'Putting down 10% to 20% protects cash reserves while securing preferred lender prime interest rates.',
      },
      {
        name: 'Section 179 Expensing Limit',
        impact: 'High (Immediate tax cash flow)',
        detail: 'Allows businesses to write off full purchase price in year 1, offsetting corporate tax obligations.',
      },
      {
        name: 'Loan Term Duration (Months)',
        impact: 'High (Spreads payment vs. total interest)',
        detail: 'A 60-month term reduces monthly payments by 35% compared to 36 months, but increases total interest paid.',
      },
      {
        name: 'Financing Structure ($1 Buyout vs. FMV)',
        impact: 'Moderate (15-20% payment variance)',
        detail: 'FMV leases minimize monthly cash burn for technology subject to rapid obsolescence.',
      },
    ],
    industryBenchmarkNote:
      'Commercial industrial equipment interest rates currently range from 6.5% to 9.5% for established prime businesses with 2+ years of operating history and strong DSCR.',
  },
  faqs: [
    {
      question: 'What is the difference between an Equipment Loan and a $1 Buyout Capital Lease?',
      answer:
        'Functionally, they are almost identical. With a standard equipment loan, you own the asset and the bank files a UCC-1 lien. With a $1 Buyout Lease, the leasing company owns the title during the term, but ownership automatically transfers to you for $1 upon final payment. Both qualify for Section 179 tax deductions.',
    },
    {
      question: 'Can used machinery qualify for Section 179 tax deductions?',
      answer:
        'Yes. Both brand-new and certified used industrial equipment qualify for Section 179 expensing, provided the equipment is new to your business and placed in service during the tax calendar year.',
    },
    {
      question: 'What credit score and financial records do equipment lenders require?',
      answer:
        'For equipment transactions under $250,000 ("application-only"), lenders typically require a 650+ FICO score, 2+ years in business, and 3-6 months of commercial bank statements. Transactions over $250,000 require 2 years of corporate tax returns and audited financial statements.',
    },
    {
      question: 'Can soft costs like freight, tooling, and rigging be included in the loan?',
      answer:
        'Yes. Most commercial equipment lenders allow up to 15% to 25% of the total loan amount to cover "soft costs" such as delivery freight, electrical rigging drop installation, tooling starter packages, and initial operator training.',
    },
  ],
  relatedCalculatorIds: [
    'heavy-equipment-rental-vs-buy-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'cnc-machine-operating-cost-calculator',
  ],
};

export const boilerInsuranceCalc: CalculatorDefinition = {
  id: 'boiler-insurance-calculator',
  slug: 'boiler-insurance-calculator',
  categoryId: 'insurance',
  path: '/insurance/boiler-insurance-calculator',
  name: 'Boiler Insurance Calculator',
  metaTitle: 'Boiler Insurance Calculator – Equipment Breakdown & Pressure Vessel Rates',
  metaDescription:
    'Calculate industrial boiler insurance premiums and equipment breakdown coverage. Model steam pressure vessel explosion, mechanical failure, and state inspection fees.',
  shortDescription:
    'Estimate equipment breakdown premiums, pressure vessel explosion coverage, and statutory jurisdictional inspection fees for industrial boilers.',
  targetAudience:
    'Plant engineers, boiler operators, facility managers, and risk directors in processing, heating, food manufacturing, and institutional facilities.',
  featured: false,
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'boilerType',
      label: 'Boiler Classification & Operating Pressure',
      type: 'select',
      defaultValue: 'high_pressure_steam',
      options: [
        { label: 'Low-Pressure Hydronic / Hot Water Boiler (<15 PSI / <250°F · 0.85×)', value: 'low_pressure', multiplier: 0.85 },
        { label: 'High-Pressure Firetube Process Steam Boiler (15 to 150 PSI · 1.00×)', value: 'high_pressure_steam', multiplier: 1.0 },
        { label: 'High-Pressure Watertube Industrial Power Boiler (>150 PSI · 1.45×)', value: 'watertube', multiplier: 1.45 },
        { label: 'Thermal Fluid / Hot Oil Heating System (Closed-loop · 1.25×)', value: 'thermal_fluid', multiplier: 1.25 },
        { label: 'Cast Iron Sectional Heating Boiler (Fragile thermal shock · 1.15×)', value: 'cast_iron', multiplier: 1.15 },
      ],
      description: 'Operating pressure and fluid dynamics dictate mechanical explosion severities.',
    },
    {
      id: 'replacementValue',
      label: 'Boiler Room & Auxiliary Equipment Replacement Value',
      type: 'number',
      defaultValue: 750000,
      min: 50000,
      max: 15000000,
      step: 25000,
      unit: '$ USD',
      description: 'Includes pressure vessel, burner, deaerator tank, feedwater pumps, and steam piping.',
    },
    {
      id: 'boilerAge',
      label: 'Equipment Age & Maintenance History',
      type: 'select',
      defaultValue: 'medium_age',
      options: [
        { label: 'Modern / Under 5 Years (Advanced digital flame supervision · 0.85×)', value: 'new', multiplier: 0.85 },
        { label: '5 to 15 Years (Regular water treatment & annual inspections · 1.00×)', value: 'medium_age', multiplier: 1.0 },
        { label: '15 to 25 Years (Aging refractory & tube wall wear · 1.25×)', value: 'older', multiplier: 1.25 },
        { label: 'Over 25 Years (Legacy pressure vessel / high scale risk · 1.60×)', value: 'vintage', multiplier: 1.6 },
      ],
      description: 'Underwriters inspect scale buildup, mud drum sludge, and burner safety interlocks.',
    },
    {
      id: 'state',
      label: 'State Location / Jurisdictional Authority',
      type: 'select',
      defaultValue: 'PA',
      options: STATE_SELECT_OPTIONS,
      description: 'State statutory boiler inspection laws (National Board of Boiler Inspectors).',
    },
    {
      id: 'businessInterruption',
      label: 'Business Interruption & Production Spoilage Exposure',
      type: 'select',
      defaultValue: 'moderate',
      options: [
        { label: 'Low: Dual N+1 Redundant Boiler on Standby (0.80×)', value: 'low', multiplier: 0.8 },
        { label: 'Moderate: Single Boiler with 48-Hour Rental Steamer Plan (1.00×)', value: 'moderate', multiplier: 1.0 },
        { label: 'Critical: Sole Source / Perishable Process Goods at Risk (1.40×)', value: 'critical', multiplier: 1.4 },
      ],
      description: 'Loss of process steam halting production lines or causing product freeze-up/spoilage.',
    },
    {
      id: 'deductible',
      label: 'Equipment Breakdown Deductible',
      type: 'select',
      defaultValue: '5000',
      options: [
        { label: '$1,500 Deductible (Lowest retention · 1.12×)', value: '1500', multiplier: 1.12 },
        { label: '$5,000 Deductible (Standard industrial · 1.00×)', value: '5000', multiplier: 1.0 },
        { label: '$10,000 Deductible (Balanced · 0.90×)', value: '10000', multiplier: 0.9 },
        { label: '$25,000 Deductible (Higher retention · 0.78×)', value: '25000', multiplier: 0.78 },
      ],
      description: 'Direct damage retention per incident.',
    },
  ],
  calculate: (values) => {
    const val = Number(values.replacementValue) || 750000;
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const stateMult = stateObj.insuranceRiskMult;

    const typeMults: Record<string, number> = {
      low_pressure: 0.85,
      high_pressure_steam: 1.0,
      watertube: 1.45,
      thermal_fluid: 1.25,
      cast_iron: 1.15,
    };
    const typeMult = typeMults[values.boilerType] || 1.0;

    const ageMults: Record<string, number> = {
      new: 0.85,
      medium_age: 1.0,
      older: 1.25,
      vintage: 1.6,
    };
    const ageMult = ageMults[values.boilerAge] || 1.0;

    const biMults: Record<string, number> = {
      low: 0.8,
      moderate: 1.0,
      critical: 1.4,
    };
    const biMult = biMults[values.businessInterruption] || 1.0;

    const dedMults: Record<string, number> = {
      '1500': 1.12,
      '5000': 1.0,
      '10000': 0.9,
      '25000': 0.78,
    };
    const dedMult = dedMults[values.deductible] || 1.0;

    // Base equipment breakdown property rate: ~0.42% of boiler room replacement value
    const propertyDirectDamage = val * 0.0042 * typeMult * ageMult * stateMult * dedMult;

    // Business income & extra expense (rental boiler hookup, emergency generator)
    const businessIncome = propertyDirectDamage * 0.45 * biMult;

    // Expediting expenses & hazardous substance decontamination (asbestos/refrigerant)
    const expeditingExpenses = Math.round(propertyDirectDamage * 0.15);

    // Jurisdictional inspection certificate compliance fee (insurance inspector National Board commission)
    const inspectionEndorsement = 850;

    const totalAnnual = Math.round(propertyDirectDamage + businessIncome + expeditingExpenses + inspectionEndorsement);
    const low = Math.round(totalAnnual * 0.88);
    const high = Math.round(totalAnnual * 1.18);

    return {
      primaryLabel: 'Estimated Annual Boiler & Machinery Premium',
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnual,
      frequencyLabel: 'per year',
      breakdown: [
        {
          label: 'Direct Damage (Explosion, Cracking & Burnout)',
          amount: Math.round(propertyDirectDamage),
          description: `Physical repair or replacement of boiler shell, refractory, tube bundles, and burner controls.`,
        },
        {
          label: 'Business Income & Emergency Rental Steam',
          amount: Math.round(businessIncome),
          description: `Replaces operating revenue and covers portable trailer boiler hookup during downtime.`,
        },
        {
          label: 'Expediting Expenses & Ammonia/Chemical Decon',
          amount: expeditingExpenses,
          description: `Overtime labor for rapid repairs and hazardous material cleanup following containment release.`,
        },
        {
          label: 'State Jurisdictional Inspection Service',
          amount: inspectionEndorsement,
          description: `Certified National Board insurance inspector visits fulfilling statutory state operating permits.`,
        },
      ],
      keyDrivers: [
        `Boiler Type: ${values.boilerType.replace('_', ' ').toUpperCase()} (${typeMult}× pressure factor).`,
        `Age & Scale Hazard: ${ageMult > 1 ? `+${Math.round((ageMult - 1) * 100)}% surcharge for aging vessel` : 'Modern vessel discount'}.`,
        `Redundancy Status: ${biMult < 1 ? 'N+1 Backup redundancy discount applied' : biMult > 1 ? 'Single-point-of-failure load' : 'Standard 48-hr plan'}.`,
      ],
      costReductionTips: [
        'Maintain daily water treatment logs and chemical testing to prevent oxygen pitting and scale buildup.',
        'Install an automated low-water fuel cut-off (LWCO) testing system to qualify for preferred underwriter rating tiers.',
        'Establish a pre-piped emergency rental boiler hookup connection on your steam header to reduce business interruption limits.',
      ],
      benchmarks: [
        { label: 'Rate per $100 TIV', value: `$${((totalAnnual / val) * 100).toFixed(2)}` },
        { label: 'Monthly Equivalent', value: `$${Math.round(totalAnnual / 12).toLocaleString()}/mo` },
      ],
    };
  },
  explainer: {
    title: 'How Boiler & Machinery Insurance Costs Are Calculated',
    paragraphs: [
      'Industrial boilers and pressure vessels represent severe catastrophe risks capable of leveling entire industrial facilities. For this reason, standard Commercial Property insurance policies contain explicit exclusions for "explosion of steam boilers, steam pipes, or steam turbines," as well as mechanical breakdown and electrical arcing.',
      'To protect these mission-critical assets, companies purchase Equipment Breakdown coverage (historically called Boiler & Machinery or B&M insurance). Unlike standard property policies that only respond to external fires or storms, B&M covers internal forces: boiler dry-firing, metallurgical tube fatigue, low-water thermal shock, pressure vessel explosions, and burner management system computer failures.',
      'A distinctive benefit of boiler insurance is the included Jurisdictional Inspection service. In nearly every US state, operating an uninspected high-pressure steam boiler is illegal under state administrative codes enforced by the National Board of Boiler and Pressure Vessel Inspectors. Boiler insurance carriers employ commissioned National Board inspectors who perform required annual internal and external inspections, submitting certificates directly to the state on your behalf.',
      'Underwriting pricing is heavily dictated by boiler operating pressure and water chemistry records. High-pressure steam systems (>15 PSI) carry significantly higher rate multipliers than hydronic hot-water systems. Facilities with rigorous chemical deaeration, daily blowdown logs, and documented preventive maintenance enjoy up to 25% lower premiums than unmonitored vintage boiler rooms.',
    ],
    factors: [
      {
        name: 'Operating Pressure & Steam Volume',
        impact: 'High (30-60% variance)',
        detail: 'High-pressure process steam (>150 PSI) holds enormous stored kinetic energy compared to low-pressure hot water.',
      },
      {
        name: 'Vessel Age & Scale Accumulation',
        impact: 'High (20-40% surcharge for >15 yrs)',
        detail: 'Aging firetube sheets and mud drums are vulnerable to corrosion pitting and thermal stress cracking.',
      },
      {
        name: 'Backup Redundancy (N+1 Systems)',
        impact: 'Moderate (20-30% business income credit)',
        detail: 'Having a dual standby boiler prevents full facility shutdown if the primary unit trips.',
      },
      {
        name: 'National Board Jurisdictional Inspection',
        impact: 'Low ($600 to $1,200 included value)',
        detail: 'Insurers provide certified inspectors to file mandatory state operating certificates.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing facilities typically budget between $4,500 and $14,000 annually for dedicated boiler and equipment breakdown coverage, depending on steam capacity and facility reliance.',
  },
  faqs: [
    {
      question: 'Does standard Commercial Property insurance cover boiler explosions?',
      answer:
        'No. Standard ISO commercial property forms explicitly exclude internal explosions of steam boilers, steam pipes, and steam turbines. You must have dedicated Equipment Breakdown / Boiler & Machinery insurance to cover pressure vessel explosion damage to the boiler and surrounding plant.',
    },
    {
      question: 'What is a Jurisdictional Boiler Inspection and why is it mandatory?',
      answer:
        'Almost all 50 states have statutory laws requiring high-pressure steam boilers and pressure vessels to be inspected annually by a certified National Board inspector. Your boiler insurance carrier provides these inspections as part of your policy and files compliance paperwork with the state.',
    },
    {
      question: 'What is "dry-firing" and is it covered by boiler insurance?',
      answer:
        'Dry-firing occurs when a low-water fuel cut-off fails, causing the burner to continue firing without adequate water in the vessel. This melts tubes and cracks boiler shells within minutes. Equipment breakdown insurance covers repair and replacement caused by dry-fire failures.',
    },
    {
      question: 'How does emergency boiler rental coverage work?',
      answer:
        'Under the Extra Expense provision of your boiler policy, the insurer pays for the freight, temporary steam hose connections, and weekly rental fees of a mobile trailer-mounted boiler so your plant can resume production while your permanent boiler is repaired.',
    },
  ],
  relatedCalculatorIds: [
    'manufacturing-plant-insurance-calculator',
    'machinery-depreciation-hourly-rate-calculator',
    'warehouse-insurance-calculator',
  ],
};

export const confinedSpaceTrainingCalc: CalculatorDefinition = {
  id: 'confined-space-training-cost-calculator',
  slug: 'confined-space-training-cost-calculator',
  categoryId: 'compliance',
  path: '/compliance/confined-space-training-cost-calculator',
  name: 'Confined Space Training Cost Calculator',
  metaTitle: 'Confined Space Training Cost Calculator – OSHA 1910.146 Compliance',
  metaDescription:
    'Calculate OSHA 29 CFR 1910.146 Permit-Required Confined Space training costs. Estimate entrant, attendant, supervisor, and rescue team certification budgets.',
  shortDescription:
    'Estimate workforce training and certification costs for OSHA 1910.146 Permit-Required Confined Space entrants, attendants, supervisors, and rescue teams.',
  targetAudience:
    'EHS managers, safety directors, plant maintenance supervisors, and utility contractors complying with OSHA 1910.146 and 1926 Subpart AA.',
  featured: false,
  iconName: 'AlertTriangle',
  fields: [
    {
      id: 'traineeCount',
      label: 'Number of Employees Requiring Training',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 100,
      step: 1,
      unit: 'workers',
      description: 'Total active maintenance techs, tank cleaners, operators, or supervisors.',
    },
    {
      id: 'courseLevel',
      label: 'OSHA Qualification & Curriculum Level',
      type: 'select',
      defaultValue: 'entrant_supervisor',
      options: [
        { label: 'Authorized Entrant & Attendant Only (4-Hour Basic · $175/person)', value: 'entrant_basic', multiplier: 0.75 },
        { label: 'Entrant, Attendant & Entry Supervisor Combined (8-Hour · $285/person)', value: 'entrant_supervisor', multiplier: 1.0 },
        { label: 'Confined Space Rescue & Retrieval Team (16-Hour Hands-On · $550/person)', value: 'rescue_team', multiplier: 1.9 },
        { label: 'Annual Refresher & Practice Drill Exercise (3-Hour · $120/person)', value: 'refresher', multiplier: 0.5 },
      ],
      description: 'OSHA 1910.146(g) requires role-specific training before initial assignment.',
    },
    {
      id: 'deliveryMethod',
      label: 'Training Delivery Format',
      type: 'select',
      defaultValue: 'onsite_instructor',
      options: [
        { label: 'On-Site Instructor at Your Facility (Customized to your plant vessels)', value: 'onsite_instructor', multiplier: 1.0 },
        { label: 'Dedicated Off-Site Safety Training Academy (Per-student enrollment)', value: 'offsite_academy', multiplier: 1.25 },
        { label: 'Blended Learning (Online Theory + On-Site Hands-On Evaluation)', value: 'blended', multiplier: 0.75 },
      ],
      description: 'On-site training utilizes your actual permits, atmospheric monitors, and tripods.',
    },
    {
      id: 'specializedHardware',
      label: 'Atmospheric Testing & PPE Practical Rigging',
      type: 'select',
      defaultValue: 'standard_4gas',
      options: [
        { label: 'Standard 4-Gas Monitor & Harness Tripod System', value: 'standard_4gas', multiplier: 1.0 },
        { label: 'Advanced Photoionization (PID) & Forced Air Ventilation Setup', value: 'pid_ventilation', multiplier: 1.2 },
        { label: 'Supplied Air Respirator (SAR) / SCBA Atmosphere Rigging', value: 'scba', multiplier: 1.45 },
      ],
      description: 'Hands-on practical calibration, bump testing, and emergency non-entry retrieval.',
    },
  ],
  calculate: (values) => {
    const trainees = Number(values.traineeCount) || 8;

    const baseRates: Record<string, number> = {
      entrant_basic: 175,
      entrant_supervisor: 285,
      rescue_team: 550,
      refresher: 120,
    };
    const baseRate = baseRates[values.courseLevel] || 285;

    const deliveryMults: Record<string, number> = {
      onsite_instructor: 1.0,
      offsite_academy: 1.25,
      blended: 0.75,
    };
    const deliveryMult = deliveryMults[values.deliveryMethod] || 1.0;

    const hardwareMults: Record<string, number> = {
      standard_4gas: 1.0,
      pid_ventilation: 1.2,
      scba: 1.45,
    };
    const hwMult = hardwareMults[values.specializedHardware] || 1.0;

    // Per trainee cost calculation
    let costPerWorker = baseRate * deliveryMult * hwMult;
    // Volume group discount for larger classes (8+ workers)
    if (trainees >= 15) {
      costPerWorker *= 0.82;
    } else if (trainees >= 8) {
      costPerWorker *= 0.9;
    }

    const totalTuition = Math.round(costPerWorker * trainees);

    // Instructor travel & specialized equipment trailer mobilization (if on-site)
    const instructorTravel = values.deliveryMethod === 'onsite_instructor' ? 850 : 0;
    // Student OSHA compliant documentation, plastic wallet cards, and permit toolkits
    const complianceDocs = trainees * 25;

    const totalInvestment = Math.round(totalTuition + instructorTravel + complianceDocs);
    const low = Math.round(totalInvestment * 0.9);
    const high = Math.round(totalInvestment * 1.15);

    const effectiveCostPerStudent = Math.round(totalInvestment / trainees);

    return {
      primaryLabel: `Confined Space Training Program (${trainees} Employees)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInvestment,
      frequencyLabel: 'total program investment',
      breakdown: [
        {
          label: 'Course Instruction & Practical Hands-On Evaluation',
          amount: totalTuition,
          description: `Certified instructor conducting 8-hour classroom and mock entry drills for ${trainees} workers.`,
        },
        {
          label: 'Calibrated Gas Monitors & Simulator Trailer Setup',
          amount: Math.round(totalInvestment * 0.15),
          description: `Consumable calibration gases, retrieval tripod, full-body harnesses, and smoke test simulation.`,
        },
        {
          label: 'OSHA Compliance Records & Student Wallet Cards',
          amount: complianceDocs,
          description: `Formal certificates of training, employee roster logs, and audit-ready digital archives.`,
        },
        ...(instructorTravel > 0
          ? [
              {
                label: 'Instructor On-Site Travel & Facility Customization',
                amount: instructorTravel,
                description: `Reviewing facility confined space permits, reclassification procedures, and localized hazards.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Qualification Level: ${values.courseLevel.replace('_', ' ').toUpperCase()} ($${Math.round(costPerWorker)}/person base).`,
        `Effective Cost per Trainee: $${effectiveCostPerStudent.toLocaleString()} all-in per employee certified.`,
        `OSHA Risk Mitigation: Eliminates exposure to statutory Serious violations (up to $16,131 per untrained worker).`,
      ],
      costReductionTips: [
        'Group 10 to 15 maintenance and operational staff into a single on-site cohort to maximize group day-rate efficiency.',
        'Use blended learning (online theory modules completed prior to an instructor-led hands-on afternoon) to reduce lost production wages.',
        'Train two designated internal supervisors to maintain recurring entry permits and conduct annual internal drill reviews.',
      ],
      benchmarks: [
        { label: 'Cost / Student', value: `$${effectiveCostPerStudent.toLocaleString()}` },
        { label: 'OSHA Standard', value: '29 CFR 1910.146' },
        { label: 'Certification Validity', value: 'Role-based (Annual drills)' },
      ],
    };
  },
  explainer: {
    title: 'How Confined Space Training Costs Are Calculated',
    paragraphs: [
      'OSHA standard 29 CFR 1910.146 (Permit-Required Confined Spaces) is among the most heavily scrutinized safety regulations in general industry, mirrored in construction by 29 CFR 1926 Subpart AA. Because atmospheric hazards—such as oxygen deficiency, hydrogen sulfide, carbon monoxide, or toxic solvent vapors—can cause fatalities within seconds, OSHA requires verified training before any employee enters or supports a permit space.',
      'Training costs scale based on four designated functional roles defined by OSHA: Authorized Entrants (the workers entering the space), Attendants (the safety monitors stationed outside the portal), Entry Supervisors (the individuals testing the atmosphere and signing the entry permit), and Confined Space Rescue personnel.',
      'While basic 4-hour entrant/attendant courses run $150 to $200 per student, full 8-hour comprehensive programs covering Entry Supervisors cost between $250 and $350 per student. If your facility maintains an in-house rescue team rather than relying on local municipal fire departments (which often do not have the equipment or 15-minute response time required for IDLH spaces), 16 to 24-hour hands-on rescue and retrieval certification runs $500 to $700 per person.',
      'Training delivery methodology strongly influences total spend. Bringing an accredited trainer on-site with a mobile simulator trailer to train 10 to 15 employees typically costs 30% less than sending individual workers to off-site public safety academies, while tailoring procedures directly to your plant’s storage tanks, baghouses, silos, and manholes.',
    ],
    factors: [
      {
        name: 'OSHA Duty Role Designation',
        impact: 'High ($175 basic vs. $550 rescue)',
        detail: 'Entry Supervisors and Rescue Teams require advanced atmospheric monitoring and retrieval rigging practice.',
      },
      {
        name: 'On-Site Group Cohort vs. Public Academy',
        impact: 'Moderate (20-35% savings for 8+ workers)',
        detail: 'On-site delivery spreads instructor day rates across your entire maintenance team.',
      },
      {
        name: 'Rescue Team Capabilities (IDLH / SCBA)',
        impact: 'High ($4,000 to $8,000 for rescue squad)',
        detail: 'Mandatory annual practice drills rescuing anthropomorphic mannequins from representative portals.',
      },
      {
        name: 'Blended Online Theory Delivery',
        impact: 'Moderate (15-25% tuition discount)',
        detail: 'Allows employees to complete classroom modules at their own pace before in-person hands-on testing.',
      },
    ],
    industryBenchmarkNote:
      'Industrial facilities spend an average of $2,200 to $4,500 annually to train and certify an 8 to 12-person maintenance and operations confined space entry crew.',
  },
  faqs: [
    {
      question: 'How often does OSHA require Confined Space training refresher courses?',
      answer:
        'OSHA 1910.146(g) does not mandate a rigid calendar expiration (like a 3-year forklift card), but requires retraining: 1) before initial assignment, 2) whenever there is a change in assigned duties, 3) whenever a change in permit space operations presents new hazards, and 4) whenever an employer has reason to believe employee proficiency is inadequate. However, in-house rescue teams MUST practice simulated rescues at least once every 12 months.',
    },
    {
      question: 'Can municipal 911 fire departments be used as our designated rescue service?',
      answer:
        'Only if you have evaluated the fire department in advance and received written confirmation that they are equipped, trained, and capable of responding to your specific site within the critical window (usually 3 to 5 minutes for oxygen-deficient or toxic IDLH atmospheres). Many municipal departments cannot guarantee rapid confined space rescue.',
    },
    {
      question: 'What is the penalty for allowing untrained workers into a permit space?',
      answer:
        'OSHA routinely cites failure to train under 1910.146(g) as a "Serious" or "Willful" violation. Under 2026 penalty caps, Serious citations reach up to $16,131 per exposed employee, and Willful citations can reach up to $161,323 per citation.',
    },
    {
      question: 'Can an employee be trained as an Entrant, Attendant, and Supervisor simultaneously?',
      answer:
        'Yes. An 8-hour comprehensive combined course qualifies an employee in all three roles. However, on any given entry, an individual worker cannot act as both the Attendant and an Entrant simultaneously.',
    },
  ],
  relatedCalculatorIds: [
    'osha-fine-calculator',
    'forklift-certification-cost-by-state',
    'epa-compliance-cost-calculator',
  ],
};

export const forkliftCertByStateCalc: CalculatorDefinition = {
  id: 'forklift-certification-cost-by-state',
  slug: 'forklift-certification-cost-by-state',
  categoryId: 'certification',
  path: '/certification/forklift-certification-cost-by-state',
  name: 'Forklift Certification Cost by State',
  metaTitle: 'Forklift Certification Cost by State – OSHA 1910.178 Rates',
  metaDescription:
    'Calculate forklift operator certification and Train-the-Trainer costs by US state. Compare online theory, third-party on-site trainers, and in-house safety programs.',
  shortDescription:
    'Calculate OSHA 1910.178 forklift operator certification and Train-the-Trainer costs across all 50 US states and State OSHA Plans.',
  targetAudience:
    'Warehouse managers, logistics directors, EHS coordinators, and human resources teams onboarding or renewing powered industrial truck operators.',
  featured: true,
  featuredBadge: 'Workforce Essential',
  iconName: 'Award',
  fields: [
    {
      id: 'state',
      label: 'Facility State / OSHA Jurisdiction',
      type: 'select',
      defaultValue: 'CA',
      options: STATE_SELECT_OPTIONS,
      description: 'Determines Federal OSHA vs State Plan (e.g., Cal/OSHA Title 8 § 3668, WA DOSH, MIOSHA).',
    },
    {
      id: 'operatorCount',
      label: 'Number of Forklift Operators to Certify',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 150,
      step: 1,
      unit: 'operators',
      description: 'Total forklift, reach truck, order picker, or electric pallet jack drivers.',
    },
    {
      id: 'trainingApproach',
      label: 'Certification Delivery Method',
      type: 'select',
      defaultValue: 'third_party_onsite',
      options: [
        { label: 'Third-Party Safety Trainer On-Site (Full classroom + hands-on evaluation)', value: 'third_party_onsite', multiplier: 1.0 },
        { label: 'Train-the-Trainer Program (Certify 1 in-house supervisor to train all staff)', value: 'train_the_trainer', multiplier: 0.8 },
        { label: 'Hybrid: Online Theory + In-House Practical Driving Evaluation', value: 'hybrid_online', multiplier: 0.45 },
        { label: 'Off-Site Commercial Driving Academy (Send drivers to external school)', value: 'offsite_school', multiplier: 1.6 },
      ],
      description: 'OSHA strictly requires a workplace-specific hands-on driving evaluation at your facility.',
    },
    {
      id: 'truckClasses',
      label: 'Equipment Classes Covered',
      type: 'select',
      defaultValue: 'single_class',
      options: [
        { label: 'Single Class (e.g. Class 1/4/5 Standard Sit-Down Counterbalanced · 1.00×)', value: 'single_class', multiplier: 1.0 },
        { label: 'Dual Class (Sit-Down Forklift + Narrow Aisle Reach Truck · 1.30×)', value: 'dual_class', multiplier: 1.3 },
        { label: 'Multi-Class Fleet (Sit-Down, Stand-Up Reach, Order Picker, Pallet Jack · 1.65×)', value: 'multi_class', multiplier: 1.65 },
      ],
      description: 'Operators must be evaluated on each specific truck type they operate.',
    },
    {
      id: 'certCycle',
      label: 'Certification Lifecycle Type',
      type: 'select',
      defaultValue: 'initial',
      options: [
        { label: 'Initial Full Certification (Brand-new operators · Complete course)', value: 'initial', multiplier: 1.0 },
        { label: 'Triennial 3-Year Recertification (Experienced drivers · Abbreviated)', value: 'triennial', multiplier: 0.75 },
      ],
      description: 'OSHA 1910.178(l)(4)(iii) mandates formal performance evaluations every 3 years.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];
    const drivers = Number(values.operatorCount) || 6;

    // State cost multiplier (high labor cost states like CA, NY, MA, WA carry slightly higher instructor day rates)
    const stateCostFactor = stateObj.insuranceRiskMult > 1.15 ? 1.18 : stateObj.insuranceRiskMult < 0.98 ? 0.92 : 1.0;

    const approachRates: Record<string, { basePerStudent: number; fixedProgramFee: number }> = {
      third_party_onsite: { basePerStudent: 140, fixedProgramFee: 450 },
      train_the_trainer: { basePerStudent: 25, fixedProgramFee: 950 }, // $950 kit/supervisor cert + $25 materials/driver
      hybrid_online: { basePerStudent: 55, fixedProgramFee: 150 },
      offsite_school: { basePerStudent: 260, fixedProgramFee: 0 },
    };
    const approach = approachRates[values.trainingApproach] || approachRates.third_party_onsite;

    const classMults: Record<string, number> = {
      single_class: 1.0,
      dual_class: 1.3,
      multi_class: 1.65,
    };
    const classMult = classMults[values.truckClasses] || 1.0;

    const cycleMults: Record<string, number> = {
      initial: 1.0,
      triennial: 0.75,
    };
    const cycleMult = cycleMults[values.certCycle] || 1.0;

    // Variable student fee
    const variableStudentCost = Math.round(drivers * approach.basePerStudent * classMult * cycleMult * stateCostFactor);
    const fixedFee = Math.round(approach.fixedProgramFee * stateCostFactor);

    const totalCost = variableStudentCost + fixedFee;
    const perOperatorCost = Math.round(totalCost / drivers);

    const low = Math.round(totalCost * 0.88);
    const high = Math.round(totalCost * 1.16);

    return {
      primaryLabel: `Total Forklift Certification Budget (${drivers} Operators)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalCost,
      frequencyLabel: `3-year compliance certification (${stateObj.name})`,
      breakdown: [
        {
          label: 'Classroom Instruction & Theory Testing',
          amount: Math.round(totalCost * 0.45),
          description: `Vehicle dynamics, load center, stability triangle, and OSHA 1910.178 written examination.`,
        },
        {
          label: 'Workplace Hands-On Driving Evaluation',
          amount: Math.round(totalCost * 0.42),
          description: `Mandatory practical obstacle course, pallet racking stacking, and dock plate driving assessment.`,
        },
        {
          label: 'Wallet Cards, Badges & Compliance Logs',
          amount: Math.round(totalCost * 0.13),
          description: `3-year laminated OSHA wallet credentials and permanent employer training record archiving.`,
        },
      ],
      keyDrivers: [
        `State Jurisdiction: ${stateObj.name} (${stateObj.oshaPlanType === 'State Plan' ? 'State OSHA Plan Enforcement' : 'Federal OSHA'}).`,
        `Effective Cost per Operator: $${perOperatorCost.toLocaleString()} per certified driver.`,
        `Training Approach: ${values.trainingApproach === 'train_the_trainer' ? 'In-House Train-the-Trainer (Maximum long-term savings for ongoing hires)' : values.trainingApproach === 'hybrid_online' ? 'Hybrid Online + In-House Evaluation' : 'Third-Party On-Site Evaluation'}.`,
      ],
      costReductionTips: [
        'Invest in a Train-the-Trainer program ($800–$1,200 one-time) if you hire more than 10 operators per year to cut future certification costs to $25/driver.',
        'Beware of "100% Online Certification" scams: OSHA rules explicitly state that an employer or designated trainer must evaluate the driver in person on the actual equipment.',
        'Track 3-year expiration dates using a centralized spreadsheet to batch recertifications simultaneously.',
      ],
      benchmarks: [
        { label: 'Cost / Operator', value: `$${perOperatorCost.toLocaleString()}` },
        { label: 'State OSHA Plan', value: stateObj.oshaPlanType },
        { label: 'Mandatory Validity', value: '3 Years (29 CFR 1910.178)' },
      ],
    };
  },
  explainer: {
    title: 'How Forklift Certification Costs by State Are Calculated',
    paragraphs: [
      'Under Federal OSHA regulation 29 CFR 1910.178(l), every operator of a powered industrial truck—including sit-down counterbalance forklifts, stand-up order pickers, reach trucks, and electric pallet jacks—must be fully trained and certified before operating equipment in a warehouse or factory.',
      'A common compliance pitfall is the belief that employees can obtain a legitimate forklift license by simply completing a $20 online quiz. OSHA specifically mandates a three-part certification curriculum: 1) Formal Instruction (lectures, video, or online learning), 2) Practical Training (demonstrations and physical driving exercises), and 3) Operator Performance Evaluation (an in-person evaluation conducted at the employer’s jobsite). Without the on-site hands-on evaluation, the certification is legally void during an OSHA inspection.',
      'State-plan states enforce additional nuances. For example, in California, Cal/OSHA Title 8 § 3668 requires documented pre-operational inspection logs and strict operating rules regarding elevated platforms. In Washington state (DOSH) and Michigan (MIOSHA), state compliance officers regularly audit operator certificates during routine site visits.',
      'For facilities with more than 8 to 10 operators, implementing an in-house "Train-the-Trainer" program yields substantial economic savings. By certifying one plant supervisor or safety lead as an authorized instructor (a one-time $800 to $1,200 investment), all current operators and future hires can be legally trained and evaluated in-house for roughly $20 to $30 in materials per driver.',
    ],
    factors: [
      {
        name: 'Training Delivery Model',
        impact: 'High ($55 hybrid vs. $260 off-site school)',
        detail: 'Train-the-trainer and hybrid models save thousands on recurring operator onboarding.',
      },
      {
        name: 'State Plan vs. Federal OSHA Plan',
        impact: 'Moderate (10-20% regional rate difference)',
        detail: 'State-plan jurisdictions (e.g. California, Washington, Oregon) face stricter documentation audits.',
      },
      {
        name: 'Equipment Class Variety (Reach vs. Forklift)',
        impact: 'Moderate (30-65% additional time)',
        detail: 'Operators must be evaluated separately on counterbalanced trucks, narrow-aisle reach trucks, and pallet jacks.',
      },
      {
        name: 'Initial vs. Triennial Recertification',
        impact: 'Moderate (25% faster for experienced drivers)',
        detail: 'Triennial 3-year evaluations focus on practical observation and a refresher on plant-specific changes.',
      },
    ],
    industryBenchmarkNote:
      'The nationwide average cost to certify a forklift operator via a third-party safety specialist ranges from $120 to $195 per driver on-site, dropping to under $35 per driver when utilizing an internal Train-the-Trainer program.',
  },
  faqs: [
    {
      question: 'Is an online-only forklift certification legal under OSHA rules?',
      answer:
        'No. OSHA explicitly states that online-only training does NOT satisfy federal standards. While the classroom/theory portion may be completed online, OSHA 1910.178(l)(2)(ii) strictly mandates that practical training and an in-person driving evaluation must be conducted by a qualified person in the operator’s actual workplace.',
    },
    {
      question: 'How long is a forklift certification valid before expiring?',
      answer:
        'Forklift certifications are legally valid for exactly 3 years under OSHA 1910.178(l)(4)(iii). However, refresher training is mandatory earlier if: 1) the operator is observed driving unsafely, 2) the operator is involved in an accident or near-miss, 3) the operator is assigned to drive a different type of truck, or 4) workplace conditions change.',
    },
    {
      question: 'Does a forklift license transfer from one employer to another?',
      answer:
        'Technically, no. OSHA holds the current employer legally responsible for operator competence. Even if a newly hired worker holds a valid wallet card from a previous job, the new employer must evaluate their driving performance in the new facility to verify competence on the new site’s specific racks and equipment.',
    },
    {
      question: 'What are the benefits of a Train-the-Trainer program for a warehouse?',
      answer:
        'A Train-the-Trainer course teaches your internal safety lead or warehouse supervisor how to instruct, evaluate, and certify operators according to OSHA standards. Once certified, your supervisor can train and license new hires immediately without paying third-party consultants for every new worker.',
    },
  ],
  relatedCalculatorIds: [
    'forklift-insurance-cost-calculator',
    'osha-fine-calculator',
    'warehouse-insurance-calculator',
  ],
};
