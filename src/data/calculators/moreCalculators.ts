import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const freightBrokerBondCalc: CalculatorDefinition = {
  id: 'freight-broker-bond-cost-calculator',
  slug: 'freight-broker-bond-cost-calculator',
  categoryId: 'insurance',
  path: '/insurance/freight-broker-bond-cost-calculator',
  name: 'Freight Broker Bond Cost Calculator',
  metaTitle: 'Freight Broker Bond Cost Calculator – BMC-84 Surety Rates',
  metaDescription:
    'Calculate BMC-84 freight broker surety bond costs ($75,000 FMCSA requirement). Estimate annual premiums based on personal credit scores and brokerage experience.',
  shortDescription:
    'Calculate annual premiums for the mandatory $75,000 FMCSA BMC-84 freight broker surety bond based on credit tier, brokerage track record, and multi-year terms.',
  targetAudience:
    'Freight brokers, 3PL logistics startups, freight forwarders, and transportation intermediaries obtaining or renewing FMCSA operating authority.',
  featured: true,
  featuredBadge: 'Logistics Standard',
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'creditScore',
      label: 'Applicant Personal Credit Score Tier (FICO)',
      type: 'select',
      defaultValue: 'good',
      options: [
        { label: 'Excellent (740+ FICO · 1.25% - 2.0% bond rate)', value: 'excellent', multiplier: 0.015 },
        { label: 'Good (680 to 739 FICO · 2.5% - 4.0% bond rate)', value: 'good', multiplier: 0.03 },
        { label: 'Fair (620 to 679 FICO · 5.0% - 7.5% bond rate)', value: 'fair', multiplier: 0.06 },
        { label: 'Challenged / Rebuilding (550 to 619 FICO · 9.0% - 13.0%)', value: 'poor', multiplier: 0.11 },
      ],
      description: 'Sureties underwrite freight broker bonds primarily on the principal owner’s personal creditworthiness.',
    },
    {
      id: 'industryExperience',
      label: 'Logistics Industry Track Record & Business Age',
      type: 'select',
      defaultValue: 'established',
      options: [
        { label: '3+ Years Established Brokerage / Strong Financials (0.85×)', value: 'veteran', multiplier: 0.85 },
        { label: '1 to 3 Years Operating History (1.00× standard rate)', value: 'established', multiplier: 1.0 },
        { label: 'New Brokerage Startup / Under 1 Year in Business (1.25×)', value: 'startup', multiplier: 1.25 },
      ],
      description: 'Underwriters review past carrier payment track records and freight volume continuity.',
    },
    {
      id: 'financialDocumentation',
      label: 'Financial Statement Disclosure',
      type: 'select',
      defaultValue: 'standard_bank',
      options: [
        { label: 'CPA Reviewed / Audited Business Financials (0.90× discount)', value: 'audited_cpa', multiplier: 0.9 },
        { label: 'Standard Business Bank Statements (1.00× standard)', value: 'standard_bank', multiplier: 1.0 },
        { label: 'Application-Only / No Financials Disclosed (1.20× surcharge)', value: 'app_only', multiplier: 1.2 },
      ],
      description: 'Providing verified liquid working capital demonstrates capability to honor freight claims.',
    },
    {
      id: 'bondTerm',
      label: 'Surety Bond Term Duration',
      type: 'select',
      defaultValue: '1_year',
      options: [
        { label: '1-Year Annual Bond Term', value: '1_year', multiplier: 1.0 },
        { label: '2-Year Prepaid Bond Term (12% multi-year discount)', value: '2_year', multiplier: 0.88 },
        { label: '3-Year Prepaid Bond Term (20% multi-year discount)', value: '3_year', multiplier: 0.8 },
      ],
      description: 'Prepaying multi-year coverage locks in low rates and eliminates annual renewal filings.',
    },
    {
      id: 'collateralPledge',
      label: 'Collateral Pledge Option',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'No Collateral Required (Standard surety execution)', value: 'none', multiplier: 1.0 },
        { label: '$5,000 Cash or Irrevocable Letter of Credit (ILOC) (0.85×)', value: 'low_collateral', multiplier: 0.85 },
        { label: '$15,000 Cash Collateral (0.70× discount · Ideal for credit rebuild)', value: 'high_collateral', multiplier: 0.7 },
      ],
      description: 'Pledging collateral lowers bond risk and can cut premiums for borderline credit profiles.',
    },
  ],
  calculate: (values) => {
    const BOND_FACE_VALUE = 75000;

    const rateMap: Record<string, number> = {
      excellent: 0.015,
      good: 0.03,
      fair: 0.06,
      poor: 0.11,
    };
    const baseRate = rateMap[values.creditScore] || 0.03;

    const expMap: Record<string, number> = {
      veteran: 0.85,
      established: 1.0,
      startup: 1.25,
    };
    const expMult = expMap[values.industryExperience] || 1.0;

    const finMap: Record<string, number> = {
      audited_cpa: 0.9,
      standard_bank: 1.0,
      app_only: 1.2,
    };
    const finMult = finMap[values.financialDocumentation] || 1.0;

    const termMap: Record<string, { mult: number; years: number }> = {
      '1_year': { mult: 1.0, years: 1 },
      '2_year': { mult: 0.88, years: 2 },
      '3_year': { mult: 0.8, years: 3 },
    };
    const termInfo = termMap[values.bondTerm] || termMap['1_year'];

    const colMap: Record<string, number> = {
      none: 1.0,
      low_collateral: 0.85,
      high_collateral: 0.7,
    };
    const colMult = colMap[values.collateralPledge] || 1.0;

    // Annualized premium calculation
    const annualBasePremium = Math.round(
      BOND_FACE_VALUE * baseRate * expMult * finMult * colMult
    );

    // Total premium based on term length
    const totalTermPremium = Math.round(
      annualBasePremium * termInfo.years * termInfo.mult
    );

    const fmcsaFilingFee = 75; // Standard electronic filing to FMCSA registry
    const totalPayable = totalTermPremium + fmcsaFilingFee;

    const effectiveAnnualCost = Math.round(totalTermPremium / termInfo.years);
    const effectivePct = Number(((effectiveAnnualCost / BOND_FACE_VALUE) * 100).toFixed(2));

    const low = Math.round(totalPayable * 0.88);
    const high = Math.round(totalPayable * 1.18);

    // Comparison against BMC-85 Trust Fund
    const trustOpportunityCost = Math.round(BOND_FACE_VALUE * 0.05); // 5% yield forgone on $75k tied up

    return {
      primaryLabel: `Estimated ${termInfo.years}-Year BMC-84 Surety Bond Premium`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalPayable,
      frequencyLabel: `${termInfo.years}-year term ($${effectiveAnnualCost.toLocaleString()}/year)`,
      breakdown: [
        {
          label: 'Surety Underwriting Base Premium',
          amount: totalTermPremium,
          description: `Covers the full $75,000 FMCSA financial responsibility requirement for ${termInfo.years} year(s).`,
        },
        {
          label: 'FMCSA Electronic Registry Filing Fee',
          amount: fmcsaFilingFee,
          description: `Direct electronic filing of Form BMC-84 to the FMCSA Licensing and Insurance database.`,
        },
        {
          label: 'BMC-85 Trust Comparison (Cash Saved)',
          amount: BOND_FACE_VALUE - totalPayable,
          description: `Working capital preserved vs. locking $75,000 cash in a BMC-85 trust fund account.`,
        },
      ],
      keyDrivers: [
        `Effective Rate: ${effectivePct}% of the $75,000 bond requirement per year.`,
        `Credit Rating Tier: ${values.creditScore.toUpperCase()} (Base factor: ${(baseRate * 100).toFixed(1)}%).`,
        `Brokerage Track Record: ${expMult < 1 ? '15% established broker discount' : expMult > 1 ? '+25% startup load' : 'Standard baseline'}.`,
        `Working Capital Advantage: Frees up $75,000 in cash flow that would otherwise sit frozen in an escrow bank trust.`,
      ],
      costReductionTips: [
        'Improve owner personal credit score above 720 prior to bond renewal to slash premium rates by up to 50%.',
        'Opt for a 2-year or 3-year term to lock in rates and save 12% to 20% on overall surety fees.',
        'Provide strong business balance sheets showing positive working capital to eliminate "application-only" underwriting surcharges.',
      ],
      benchmarks: [
        { label: 'Annual Rate %', value: `${effectivePct}% / yr` },
        { label: 'FMCSA Bond Limit', value: '$75,000' },
        { label: 'Trust vs Bond Savings', value: `+$${(trustOpportunityCost - effectiveAnnualCost).toLocaleString()}/yr` },
      ],
    };
  },
  explainer: {
    title: 'How Freight Broker Bond (BMC-84) Premiums Are Calculated',
    paragraphs: [
      'Under the Moving Ahead for Progress in the 21st Century Act (MAP-21), the Federal Motor Carrier Safety Administration (FMCSA) mandates that all licensed property freight brokers and freight forwarders maintain a minimum financial security limit of $75,000. This regulation was established to protect motor carriers and shippers against non-payment or fraudulent intermediary operations.',
      'Brokers fulfill this requirement using either a BMC-84 Surety Bond or a BMC-85 Trust Fund Agreement. With a BMC-85 trust, the broker must deposit the entire $75,000 in cash or an irrevocable letter of credit into an escrow account—freezing substantial operational working capital. With a BMC-84 surety bond, the broker pays an annual fee (typically 1.25% to 4% for applicants with good credit) without locking up cash reserves.',
      'Surety bond pricing is underwritten based on three core parameters: personal credit score of the managing owners, years in freight brokerage operations, and verifiable business liquid assets. Unlike standard insurance where the insurer expects to pay claims, a surety bond is a credit instrument: if a carrier files a valid non-payment claim against the bond, the surety pays the carrier but legally pursues the broker for full reimbursement under the General Indemnity Agreement (GIA).',
      'Brokers with FICO scores above 720 typically qualify for prime rates ranging from $950 to $1,500 annually. Brokers with lower scores (under 620) or prior tax liens can still secure coverage through specialty non-standard surety markets, with rates ranging from $5,000 to $9,000 per year, which can be mitigated by offering partial cash collateral.',
    ],
    factors: [
      {
        name: 'Personal FICO Credit Score',
        impact: 'High (1.25% to 12% variance)',
        detail: 'The single largest determinant of bond tier; personal credit indicates financial responsibility.',
      },
      {
        name: 'Years in Business & Freight Experience',
        impact: 'Moderate (15-25% credit/debit)',
        detail: 'Experienced brokers with established carrier payment histories receive preferred rating schedules.',
      },
      {
        name: 'Financial Statement Transparency',
        impact: 'Moderate (10-20% discount)',
        detail: 'Providing CPA-reviewed financials proves liquid working capital to cover carrier claims.',
      },
      {
        name: 'Multi-Year Prepaid Discounts',
        impact: 'Moderate (12-20% savings)',
        detail: 'Two and three-year prepaid terms lock in rates and waive recurring annual administrative fees.',
      },
    ],
    industryBenchmarkNote:
      'Approximately 85% of US freight brokerages utilize a BMC-84 surety bond rather than a BMC-85 trust, with average prime annual premiums ranging between $1,100 and $1,800.',
  },
  faqs: [
    {
      question: 'What is the difference between a BMC-84 bond and a BMC-85 trust?',
      answer:
        'A BMC-84 is a surety bond issued by an authorized insurance surety company. You pay an annual percentage premium ($950–$3,000) and keep your working capital. A BMC-85 is a trust fund where you must place the entire $75,000 in cash into a designated bank trust account where it remains tied up indefinitely.',
    },
    {
      question: 'What happens if a trucking carrier files a claim against my freight broker bond?',
      answer:
        'When a carrier files a non-payment claim, the surety conducts an investigation. If valid, the surety pays the carrier up to the bond limit. However, because a surety bond includes an Indemnity Agreement, you and your business are legally required to reimburse the surety company for every dollar paid out plus legal fees.',
    },
    {
      question: 'Can I get a freight broker bond with bad credit?',
      answer:
        'Yes. Many surety underwriters specialize in high-risk or rebuilding credit programs. While applicants with credit scores under 620 pay higher annual rates (typically 7% to 12% of the bond amount), coverage is approved in most cases without requiring the full $75,000 in cash.',
    },
    {
      question: 'How fast does the surety file the BMC-84 with the FMCSA?',
      answer:
        'Reputable surety providers file Form BMC-84 electronically directly to the FMCSA Licensing & Insurance (L&I) portal within 24 to 48 hours of approval, enabling immediate operating authority activation.',
    },
  ],
  relatedCalculatorIds: [
    'warehouse-insurance-calculator',
    'manufacturing-plant-insurance-calculator',
    'heavy-equipment-financing-calculator',
  ],
};

export const industrialGeneratorSizingCalc: CalculatorDefinition = {
  id: 'industrial-generator-sizing-calculator',
  slug: 'industrial-generator-sizing-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/industrial-generator-sizing-calculator',
  name: 'Industrial Generator Sizing Calculator',
  metaTitle: 'Industrial Generator Sizing Calculator – kW & kVA Power Estimator',
  metaDescription:
    'Size industrial standby and prime backup generators. Calculate running kW, locked-rotor starting kVA, voltage dip thresholds, and fuel consumption.',
  shortDescription:
    'Calculate backup electrical generator capacity (kW / kVA), motor starting inrush requirements, fuel burn rates, and capital purchase costs.',
  targetAudience:
    'Plant engineers, electrical contractors, facility directors, cold storage operators, and data center managers planning emergency backup power systems.',
  featured: false,
  iconName: 'Zap',
  fields: [
    {
      id: 'runningBaseKw',
      label: 'Continuous Running Electrical Base Load (kW)',
      type: 'number',
      defaultValue: 250,
      min: 15,
      max: 3000,
      step: 10,
      unit: 'kW',
      description: 'Total continuous power demand for lighting, HVAC chillers, process pumps, and machinery.',
    },
    {
      id: 'largestMotorHp',
      label: 'Largest Electric Motor Starting Load (HP)',
      type: 'number',
      defaultValue: 75,
      min: 5,
      max: 800,
      step: 5,
      unit: 'HP',
      description: 'Single largest electric motor that starts while the generator is supporting the base load.',
    },
    {
      id: 'motorStartingType',
      label: 'Motor Starter Configuration / Inrush Limiter',
      type: 'select',
      defaultValue: 'dol',
      options: [
        { label: 'Direct-on-Line (DOL / Across-the-Line · 6.0× Inrush Multiplier)', value: 'dol', multiplier: 6.0 },
        { label: 'Star-Delta / Wye-Delta Starter (3.0× Inrush Multiplier)', value: 'star_delta', multiplier: 3.0 },
        { label: 'Solid-State Soft Starter (2.5× Inrush Multiplier)', value: 'soft_start', multiplier: 2.5 },
        { label: 'Variable Frequency Drive (VFD · 1.25× Inrush Multiplier)', value: 'vfd', multiplier: 1.25 },
      ],
      description: 'Across-the-line starting creates enormous locked-rotor current that can cause generator voltage collapse.',
    },
    {
      id: 'dutyRating',
      label: 'Generator Application & Duty Cycle',
      type: 'select',
      defaultValue: 'standby',
      options: [
        { label: 'Emergency Standby Power (ESP · 80% Max Average Load Factor)', value: 'standby', multiplier: 1.0 },
        { label: 'Prime Power (PRP · Off-Grid Continuous / 70% Load Factor)', value: 'prime', multiplier: 1.2 },
        { label: 'Mission-Critical / Continuous (N+1 Redundant Tier)', value: 'mission_critical', multiplier: 1.45 },
      ],
      description: 'ISO 8528 generator rating standards dictating sustained load capacity and overhaul intervals.',
    },
    {
      id: 'fuelType',
      label: 'Generator Fuel Source',
      type: 'select',
      defaultValue: 'diesel',
      options: [
        { label: 'Diesel Generator (Highest torque, on-site fuel tank storage · 1.00×)', value: 'diesel', multiplier: 1.0 },
        { label: 'Natural Gas Generator (Pipeline supply, no diesel aging/delivery · 1.15×)', value: 'natural_gas', multiplier: 1.15 },
        { label: 'Bi-Fuel System (Dual-fuel diesel with natural gas injection · 1.30×)', value: 'bi_fuel', multiplier: 1.3 },
      ],
      description: 'Natural gas engines require slightly larger displacement blocks to match diesel block-load acceptance.',
    },
  ],
  calculate: (values) => {
    const runningKw = Number(values.runningBaseKw) || 250;
    const motorHp = Number(values.largestMotorHp) || 75;

    const inrushMap: Record<string, number> = {
      dol: 6.0,
      star_delta: 3.0,
      soft_start: 2.5,
      vfd: 1.25,
    };
    const inrushMult = inrushMap[values.motorStartingType] || 6.0;

    const dutyMap: Record<string, number> = {
      standby: 1.0,
      prime: 1.2,
      mission_critical: 1.45,
    };
    const dutyMult = dutyMap[values.dutyRating] || 1.0;

    // 1 HP ≈ 0.746 kW (running), running kVA at 0.85 motor PF ≈ 0.88 kVA/HP
    const motorRunningKw = motorHp * 0.746;
    const motorStartingKva = motorHp * 0.88 * inrushMult;

    // Sizing formula: Generator must support running base kW AND accommodate motor starting kVA
    // Generator transient capacity: standard industrial alternators accommodate ~1.8× rated kVA during motor start
    const kvaFromMotorStart = motorStartingKva / 1.8;
    const totalRequiredKw = Math.max(
      runningKw * 1.25, // 25% safety headroom
      (runningKw + motorRunningKw) * 1.15,
      kvaFromMotorStart * 0.8
    ) * dutyMult;

    // Standard commercial generator sizes (kW tiers)
    const standardKwTiers = [
      30, 45, 60, 80, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600, 750, 800, 1000, 1250, 1500, 2000, 2500,
    ];
    let recommendedKw = standardKwTiers.find((t) => t >= totalRequiredKw) || Math.ceil(totalRequiredKw / 250) * 250;

    // Standard industrial 0.8 power factor: kVA = kW / 0.8
    const recommendedKva = Math.round(recommendedKw / 0.8);

    // Fuel consumption estimation (Diesel: approx 0.07 gallons per hour per kW at 75% load)
    const dieselGallonsPerHour = Number((recommendedKw * 0.052).toFixed(1));

    // Capital cost: generator set, sound attenuated weather enclosure, automatic transfer switch (ATS)
    // Approximately $380 – $520 per kW installed
    const capitalCost = recommendedKw * 440;
    const low = Math.round(capitalCost * 0.88);
    const high = Math.round(capitalCost * 1.18);

    // ATS sizing (Amps at 480V 3-phase = kW * 1000 / (480 * 1.732 * 0.8))
    const fullLoadAmps480V = Math.round((recommendedKw * 1000) / (480 * 1.732 * 0.8));

    return {
      primaryLabel: `Recommended Industrial Generator Size`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: capitalCost,
      frequencyLabel: `${recommendedKw} kW / ${recommendedKva} kVA turn-key equipment estimate`,
      breakdown: [
        {
          label: `Generator Set (${recommendedKw} kW / ${recommendedKva} kVA)`,
          amount: Math.round(capitalCost * 0.65),
          description: `Industrial engine-generator package, Tier 4 / stationary emergency certified, with sub-base fuel tank.`,
        },
        {
          label: `Automatic Transfer Switch (ATS) & Electrical Rigging`,
          amount: Math.round(capitalCost * 0.18),
          description: `Service entrance rated ATS (~${fullLoadAmps480V}A at 480V/3-phase) with NEMA 3R enclosure.`,
        },
        {
          label: 'Sound Attenuated Weather Enclosure & Pad',
          amount: Math.round(capitalCost * 0.17),
          description: `Concrete foundation pad, Level 2 sound attenuated housing (70 dBA at 23 ft), and exhaust silencer.`,
        },
      ],
      keyDrivers: [
        `Recommended Capacity: ${recommendedKw} kW (${recommendedKva} kVA at 0.8 PF).`,
        `Motor Inrush Surge: Starting ${motorHp} HP motor requires ~${Math.round(motorStartingKva)} starting kVA (${values.motorStartingType.toUpperCase()}).`,
        `Estimated Fuel Burn: ~${dieselGallonsPerHour} gal/hr diesel at 75% prime load.`,
        `Electrical Full Load: Rated for ${fullLoadAmps480V} Amps at 480V 3-Phase.`,
      ],
      costReductionTips: [
        'Install a Variable Frequency Drive (VFD) or soft starter on your largest motor to reduce inrush current from 6× down to 1.3×, dropping required generator size by a full tier.',
        'Sequence motor startup timers so large motors never start simultaneously, preventing voltage dips.',
        'Implement automated non-essential load shedding (shutting down non-critical warehouse HVAC during outages) to right-size the standby generator.',
      ],
      benchmarks: [
        { label: 'Recommended kW', value: `${recommendedKw} kW` },
        { label: 'Alternator kVA', value: `${recommendedKva} kVA` },
        { label: 'Fuel Burn (75%)', value: `${dieselGallonsPerHour} gal/hr` },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Generator Sizing and Motor Inrush Are Calculated',
    paragraphs: [
      'Sizing an industrial backup generator involves far more than simply tallying up continuous utility bills. While electric utilities supply near-infinite instantaneous grid capacity, an engine-generator set has limited rotating kinetic inertia and magnetic alternator headroom. Sizing an undersized generator will result in severe voltage collapse and engine stalling the moment a major motor cycles on.',
      'The engineering sizing calculation hinges on two distinct requirements: steady-state Running kW and transient Starting kVA (SkVA). Electric induction motors typically draw 600% of their full-load running current during across-the-line (direct-on-line) starts. This locked-rotor inrush creates an instantaneous voltage dip on the generator bus. If voltage drops by more than 15% to 20%, sensitive facility PLCs, electronic relays, and motor starters will trip out.',
      'Our model evaluates the starting method used on your largest motor load. Upgrading from basic across-the-line starters to Solid-State Soft Starters (2.5× inrush) or Variable Frequency Drives (1.25× inrush) drastically flattens transient SkVA spikes, often allowing plant engineers to select a generator that is 20% to 35% smaller, saving tens of thousands in capital expenditure.',
      'Under ISO 8528 standards, generator sets are categorized into Emergency Standby Power (ESP), Prime Power (PRP), and Continuous Power (COP). Standby generators are designed to supply power during utility outages for a maximum average load factor of 80% without sustained overload capability. Off-grid prime applications require derating by 20% to accommodate continuous operating loads.',
    ],
    factors: [
      {
        name: 'Electric Motor Starting Method (DOL vs. VFD)',
        impact: 'High (Up to 40% size difference)',
        detail: 'Across-the-line motors draw 6× normal current during startup, demanding a significantly larger alternator.',
      },
      {
        name: 'Transient Voltage Dip Tolerance',
        impact: 'High (15-20% standard threshold)',
        detail: 'Automated CNC lines and server equipment cannot tolerate voltage dips exceeding 15%.',
      },
      {
        name: 'ISO 8528 Duty Rating (ESP vs. Prime)',
        impact: 'Moderate (20% capacity adjustment)',
        detail: 'Standby ratings allow maximum short-duration output; prime units are sized for indefinite continuous operation.',
      },
      {
        name: 'Diesel vs. Natural Gas Displacement',
        impact: 'Moderate (10-15% sizing variance)',
        detail: 'Natural gas generators have lower step-load acceptance than high-torque diesel turbo engines.',
      },
    ],
    industryBenchmarkNote:
      'Turnkey installed industrial generator systems average $400 to $550 per kW, including generator, sub-base fuel tank, concrete pad, automatic transfer switch (ATS), and rigging.',
  },
  faqs: [
    {
      question: 'What is the difference between kW and kVA on an industrial generator?',
      answer:
        'kW (Kilowatts) is the actual working power that produces heat, light, and mechanical work. kVA (Kilovolt-Amperes) is apparent power, which accounts for both working power and reactive power (power required to energize motor windings). Industrial generators are rated at a standard 0.8 power factor, meaning a 500 kW generator produces 625 kVA.',
    },
    {
      question: 'Why did our generator stall when the air compressor kicked on?',
      answer:
        'When large electric motors start across-the-line, they demand 5 to 7 times their running current for 2 to 5 seconds. If the generator does not have sufficient transient motor starting kVA (SkVA) or the engine lacks rapid turbo boost response, the resulting voltage dip and frequency drop will trip the generator circuit breaker or stall the engine.',
    },
    {
      question: 'How many hours of on-site fuel storage does a backup generator need?',
      answer:
        'Most industrial manufacturing and warehouse facilities design sub-base diesel tanks for 24 to 72 hours of continuous run time at 75% load. Mission-critical data centers and healthcare life-safety facilities often require 72 to 96 hours of on-site fuel capacity.',
    },
    {
      question: 'What is an Automatic Transfer Switch (ATS) and do I need one?',
      answer:
        'An ATS monitors utility grid voltage. When utility power fails or drops below acceptable levels (brownout), the ATS signals the generator to start, waits for voltage and frequency to stabilize (usually 10 seconds), and safely switches the facility electrical load to generator power. An ATS is mandatory for automated backup power.',
    },
  ],
  relatedCalculatorIds: [
    'machinery-depreciation-hourly-rate-calculator',
    'heavy-equipment-financing-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const fireSuppressionSystemCostCalc: CalculatorDefinition = {
  id: 'fire-suppression-system-cost-calculator',
  slug: 'fire-suppression-system-cost-calculator',
  categoryId: 'equipment-cost',
  path: '/equipment-cost/fire-suppression-system-cost-calculator',
  name: 'Fire Suppression System Cost Calculator',
  metaTitle: 'Fire Suppression System Cost Calculator – ESFR & Industrial Sprinklers',
  metaDescription:
    'Calculate industrial fire sprinkler and suppression system costs. Model NFPA 13 wet pipe, dry pipe, ESFR high-density warehouse systems, and diesel fire pumps.',
  shortDescription:
    'Estimate commercial fire sprinkler installation costs ($/sq ft), ESFR high-bay systems, diesel fire pumps, and annual NFPA 25 inspection fees.',
  targetAudience:
    'Warehouse developers, plant engineers, commercial general contractors, and facility directors retrofitting or budgeting complete fire protection systems.',
  featured: false,
  iconName: 'ShieldCheck',
  fields: [
    {
      id: 'facilitySqFt',
      label: 'Facility Footprint to Protect (Square Feet)',
      type: 'number',
      defaultValue: 45000,
      min: 3000,
      max: 1000000,
      step: 2500,
      unit: 'sq ft',
      description: 'Total interior warehouse, manufacturing, or commercial clear-span floor area.',
    },
    {
      id: 'systemTechnology',
      label: 'Fire Suppression Technology / Hazard Class',
      type: 'select',
      defaultValue: 'esfr',
      options: [
        { label: 'Standard Wet Pipe Sprinkler (Light / Ordinary Hazard · $4.80/sq ft)', value: 'wet_pipe', multiplier: 4.8 },
        { label: 'Dry Pipe System for Unheated / Freezers (Freeze-protected · $7.20/sq ft)', value: 'dry_pipe', multiplier: 7.2 },
        { label: 'ESFR High-Density Warehouse System (Rack storage to 40 ft · $8.50/sq ft)', value: 'esfr', multiplier: 8.5 },
        { label: 'Pre-Action Double Interlock (Data cleanroom / High value · $11.00/sq ft)', value: 'pre_action', multiplier: 11.0 },
        { label: 'Clean Agent Gas / Novec 1230 System (Special hazard rooms · $16.50/sq ft)', value: 'clean_agent', multiplier: 16.5 },
      ],
      description: 'NFPA 13 system design classification determined by combustible fuel loading.',
    },
    {
      id: 'ceilingClearHeight',
      label: 'Ceiling Clear Height & Riser Complexity',
      type: 'select',
      defaultValue: 'high_bay',
      options: [
        { label: 'Low Clear Height (Under 20 ft clear · 0.90× labor multiplier)', value: 'low_bay', multiplier: 0.9 },
        { label: 'Standard Industrial (20 ft to 32 ft clear · 1.00× standard)', value: 'standard', multiplier: 1.0 },
        { label: 'High Bay / Automated Logistics (32+ ft clear · 1.25× scissor lift work)', value: 'high_bay', multiplier: 1.25 },
      ],
      description: 'Higher elevations require high-capacity boom lifts, seismic bracing, and specialized K-factor heads.',
    },
    {
      id: 'waterSupplyPump',
      label: 'Municipal Water Pressure & Fire Pump Requirement',
      type: 'select',
      defaultValue: 'adequate_city',
      options: [
        { label: 'Adequate Municipal Water Pressure & Flow (No fire pump needed)', value: 'adequate_city', multiplier: 0 },
        { label: 'Inadequate Pressure: Requires 1,000 GPM Electric Fire Pump (+$68,000)', value: 'electric_pump', multiplier: 68000 },
        { label: 'Inadequate Flow: Requires 1,500 GPM Diesel Fire Pump & Controller (+$92,000)', value: 'diesel_pump', multiplier: 92000 },
        { label: 'Rural / Dedicated 100,000 Gal Water Storage Tank + Diesel Pump (+$185,000)', value: 'storage_tank_pump', multiplier: 185000 },
      ],
      description: 'ESFR and industrial high-density systems demand high static water pressures (50 to 75+ PSI at roof).',
    },
    {
      id: 'projectType',
      label: 'Installation Context / Building Type',
      type: 'select',
      defaultValue: 'new_construction',
      options: [
        { label: 'New Construction Shell (Clear open bays · 1.00×)', value: 'new_construction', multiplier: 1.0 },
        { label: 'Retrofit / Tenant Improvement in Existing Operating Plant (1.30×)', value: 'retrofit', multiplier: 1.3 },
      ],
      description: 'Working around active equipment, overhead ductwork, and lighting conduits increases installation labor.',
    },
  ],
  calculate: (values) => {
    const sqFt = Number(values.facilitySqFt) || 45000;

    const techRates: Record<string, number> = {
      wet_pipe: 4.8,
      dry_pipe: 7.2,
      esfr: 8.5,
      pre_action: 11.0,
      clean_agent: 16.5,
    };
    const baseRatePerSqFt = techRates[values.systemTechnology] || 8.5;

    const heightMults: Record<string, number> = {
      low_bay: 0.9,
      standard: 1.0,
      high_bay: 1.25,
    };
    const heightMult = heightMults[values.ceilingClearHeight] || 1.25;

    const projMults: Record<string, number> = {
      new_construction: 1.0,
      retrofit: 1.3,
    };
    const projMult = projMults[values.projectType] || 1.0;

    const pumpCosts: Record<string, number> = {
      adequate_city: 0,
      electric_pump: 68000,
      diesel_pump: 92000,
      storage_tank_pump: 185000,
    };
    const pumpFixedCost = pumpCosts[values.waterSupplyPump] || 0;

    // Base piping, branch lines, and sprinkler heads
    const pipingLaborMaterials = Math.round(sqFt * baseRatePerSqFt * heightMult * projMult);

    // Engineering hydraulic calculations, 3D BIM coordination, and city fire marshal permits
    const engineeringPermits = Math.round(Math.max(4500, pipingLaborMaterials * 0.08));

    // Backflow preventer, main riser check valves, and waterflow alarm bells
    const riserHardware = Math.round(12500 * (sqFt > 50000 ? 1.8 : 1.0));

    const totalSystemInvestment = Math.round(
      pipingLaborMaterials + engineeringPermits + riserHardware + pumpFixedCost
    );

    const costPerSqFt = Number((totalSystemInvestment / sqFt).toFixed(2));
    const annualNfpa25Maintenance = Math.round(Math.max(1200, sqFt * 0.045));

    const low = Math.round(totalSystemInvestment * 0.9);
    const high = Math.round(totalSystemInvestment * 1.16);

    return {
      primaryLabel: `Total Fire Suppression System Investment`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalSystemInvestment,
      frequencyLabel: `$${costPerSqFt}/sq ft complete installed budget`,
      breakdown: [
        {
          label: 'Overhead Piping, Riser Mains & Sprinkler Heads',
          amount: pipingLaborMaterials,
          description: `Schedule 10/40 steel distribution mains, branch lines, and quick-response heads for ${sqFt.toLocaleString()} sq ft.`,
        },
        ...(pumpFixedCost > 0
          ? [
              {
                label: 'Dedicated Fire Pump & Flow Controller',
                amount: pumpFixedCost,
                description: `UL listed / FM approved fire pump package to meet required hydraulic head pressure.`,
              },
            ]
          : []),
        {
          label: 'Hydraulic Engineering, BIM & Fire Marshal Permits',
          amount: engineeringPermits,
          description: `Professional Engineer (PE) hydraulic flow modeling, plan submittals, and hydrostatic testing.`,
        },
        {
          label: 'Backflow Preventer & Main Riser Assemblies',
          amount: riserHardware,
          description: `Double-detector backflow assembly, OS&Y control valves, water motor gong, and tamper switches.`,
        },
      ],
      keyDrivers: [
        `Installed Cost per Sq Ft: $${costPerSqFt}/sq ft for ${sqFt.toLocaleString()} sq ft facility.`,
        `Suppression Type: ${values.systemTechnology.toUpperCase().replace('_', ' ')} (${values.ceilingClearHeight.replace('_', ' ')}).`,
        `Water Infrastructure: ${pumpFixedCost > 0 ? `Requires dedicated pump ($${pumpFixedCost.toLocaleString()})` : 'Adequate municipal city pressure'}.`,
        `Annual NFPA 25 Inspection Budget: ~$${annualNfpa25Maintenance.toLocaleString()} / year.`,
      ],
      costReductionTips: [
        'Perform an early fire hydrant flow test with the city water authority to confirm if a $70k+ fire pump can be avoided.',
        'Choose Early Suppression Fast Response (ESFR) heads to avoid requiring expensive in-rack piping inside warehouse pallet racks.',
        'Coordinate overhead sprinkler design with lighting and HVAC duct plans before framing to prevent costly field pipe relocations.',
      ],
      benchmarks: [
        { label: 'Unit Cost / Sq Ft', value: `$${costPerSqFt}/sq ft` },
        { label: 'Annual NFPA 25 Test', value: `$${annualNfpa25Maintenance.toLocaleString()}/yr` },
        { label: 'Insurance Credit', value: '15% – 30% reduction' },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Fire Suppression System Costs Are Calculated',
    paragraphs: [
      'Commercial fire suppression pricing is governed by the rigorous engineering formulas set forth in NFPA 13 (Standard for the Installation of Sprinkler Systems). The cost to protect an industrial facility is not simply a matter of running steel pipes across the rafters; it is dictated by the combustible fire load density, stored commodity classification, ceiling clear height, and municipal water supply hydraulics.',
      'For standard warehouses and manufacturing spaces, Early Suppression Fast Response (ESFR) wet-pipe systems have become the global logistics standard. Unlike traditional sprinklers that merely control and contain fires until firefighters arrive, ESFR heads discharge massive, high-velocity water droplets (using K-factor orifices from K-14 to K-25) designed to penetrate the intense updraft of a plastics fire and extinguish it at the seat.',
      'The single largest budget variance often comes from municipal water supply pressures. ESFR systems require high hydraulic pressure—frequently requiring 50 to 75 PSI at the furthest sprinkler head with flows exceeding 1,200 to 1,500 gallons per minute (GPM). If the municipal water main at the street cannot deliver this volume, an electric or diesel fire pump package must be added, increasing the project budget by $65,000 to $95,000.',
      'Installing fire suppression in new construction typically costs $4.50 to $8.50 per square foot. Retrofitting an existing operating plant increases labor costs by 25% to 35% because pipe fitters must maneuver scissor lifts around active production lines, electrical conduits, and ductwork while performing daily cleanups to maintain clean manufacturing environments.',
    ],
    factors: [
      {
        name: 'Suppression Technology (Wet vs. ESFR vs. Gas)',
        impact: 'High ($4.80 to $16.50/sq ft)',
        detail: 'Special hazard clean agent gas systems for control rooms cost significantly more per sq ft than wet-pipe sprinklers.',
      },
      {
        name: 'Municipal Water Pressure & Fire Pump Needs',
        impact: 'High (Adds $65,000 to $95,000+)',
        detail: 'Inadequate street water flow necessitates a dedicated high-pressure fire pump and controller.',
      },
      {
        name: 'Ceiling Clear Height & High-Bay Racking',
        impact: 'Moderate (20-30% labor multiplier)',
        detail: 'Working at heights above 32 feet requires specialized heavy lifts, seismic drop braces, and larger diameter riser mains.',
      },
      {
        name: 'New Construction vs. Plant Retrofit',
        impact: 'Moderate (25-35% variance)',
        detail: 'Retrofitting piping above existing active machinery requires extensive staging and off-hours night labor.',
      },
    ],
    industryBenchmarkNote:
      'Installing an ESFR sprinkler system reduces property insurance premiums by 15% to 30%, typically achieving full capital cost payback within 5 to 8 years on commercial warehouse buildings.',
  },
  faqs: [
    {
      question: 'Why do high-ceiling warehouses need ESFR sprinklers instead of standard heads?',
      answer:
        'Standard sprinkler heads produce a fine spray mist that gets evaporated by the intense thermal updraft of a high-bay warehouse fire before reaching the burning pallets. ESFR (Early Suppression Fast Response) heads release heavy, large-droplet water streams at high velocity that blast through heat plumes directly to the fire base, eliminating the need for in-rack sprinkler pipes.',
    },
    {
      question: 'How do I know if my building requires a fire pump?',
      answer:
        'A fire protection engineer performs a hydraulic flow test on the closest city fire hydrant. If the water pressure and flow volume are insufficient to meet the required pressure at the hydraulically most remote sprinkler head (plus a 10 PSI safety buffer), a dedicated stationary fire pump is mandatory.',
    },
    {
      question: 'What is a double-interlock pre-action system and where is it used?',
      answer:
        'A double-interlock pre-action system keeps pipes dry until two separate events occur: an electronic smoke detector trips AND a sprinkler head melts open. This prevents accidental water leaks and is standard in high-value cleanrooms, server facilities, and archives.',
    },
    {
      question: 'What ongoing maintenance is required under NFPA 25?',
      answer:
        'NFPA 25 mandates quarterly waterflow alarm inspections, semi-annual valve checks, annual main drain flow tests, annual fire pump performance churn tests, and periodic 5-year internal pipe corrosion inspections.',
    },
  ],
  relatedCalculatorIds: [
    'warehouse-insurance-calculator',
    'manufacturing-plant-insurance-calculator',
    'industrial-generator-sizing-calculator',
  ],
};

export const weldingCertificationCostGuide: CalculatorDefinition = {
  id: 'welding-certification-cost-guide',
  slug: 'welding-certification-cost-guide',
  categoryId: 'certification',
  path: '/certification/welding-certification-cost-guide',
  name: 'Welding Certification Cost Guide',
  metaTitle: 'Welding Certification Cost Guide – AWS D1.1 & ASME Section IX Rates',
  metaDescription:
    'Calculate industrial welding certification and test coupon costs. Estimate fees for AWS D1.1, ASME Section IX, 6G pipe tests, CWI witnessing, and X-ray NDT inspection.',
  shortDescription:
    'Estimate welder qualification test costs (WPQR), CWI inspector witnessing fees, radiographic X-ray testing, and ASME/AWS code compliance budgets.',
  targetAudience:
    'Fabrication shop owners, quality managers, structural steel erectors, mechanical piping contractors, and professional welders certifying to industry codes.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'weldingCode',
      label: 'Governing Welding Code & Standard',
      type: 'select',
      defaultValue: 'aws_d1_1',
      options: [
        { label: 'AWS D1.1: Structural Steel (Most common industrial standard · 1.00×)', value: 'aws_d1_1', multiplier: 1.0 },
        { label: 'ASME Section IX: Pressure Vessels, Boilers & Process Piping (1.25×)', value: 'asme_sec_ix', multiplier: 1.25 },
        { label: 'API 1104: Pipeline & Cross-Country Gas Piping (1.30×)', value: 'api_1104', multiplier: 1.3 },
        { label: 'AWS D1.2: Structural Aluminum (Argon purge / Specialized · 1.35×)', value: 'aws_d1_2', multiplier: 1.35 },
        { label: 'AWS D1.6: Structural Stainless Steel (Passivation / Dual coupon · 1.40×)', value: 'aws_d1_6', multiplier: 1.4 },
        { label: 'AWS Certified Welding Inspector (CWI Seminar & 3-Part Exam)', value: 'aws_cwi_exam', multiplier: 3.2 },
      ],
      description: 'The construction code dictates coupon thickness, testing protocol, and inspector credentials.',
    },
    {
      id: 'testPosition',
      label: 'Test Position & Coupon Geometry',
      type: 'select',
      defaultValue: 'position_3g_4g',
      options: [
        { label: 'Plate: 1G / 2G (Flat and Horizontal only · 0.80×)', value: 'position_1g_2g', multiplier: 0.8 },
        { label: 'Plate: 3G + 4G Combo (Vertical Up + Overhead · Unlimited plate · 1.00×)', value: 'position_3g_4g', multiplier: 1.0 },
        { label: 'Pipe: 6G Fixed 45° Angle (All-position plate & pipe qualification · 1.45×)', value: 'position_6g', multiplier: 1.45 },
      ],
      description: 'Passing a 6G pipe test qualifies the welder for all plate and pipe positions under most codes.',
    },
    {
      id: 'welderCount',
      label: 'Number of Welders Being Tested / Certified',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 30,
      step: 1,
      unit: 'welders',
      description: 'Total welding operators testing to the Welding Procedure Specification (WPS).',
    },
    {
      id: 'testingMethod',
      label: 'Test Evaluation & Non-Destructive Examination',
      type: 'select',
      defaultValue: 'guided_bend',
      options: [
        { label: 'Destructive Guided Bend Test (Root & Face or 4 Side Bends · $180/coupon)', value: 'guided_bend', multiplier: 1.0 },
        { label: 'Radiographic Examination (Full X-Ray Testing · $285/coupon)', value: 'xray_ndt', multiplier: 1.35 },
        { label: 'Ultrasonic Testing (Phased Array UT Examination · $310/coupon)', value: 'ultrasonic_ndt', multiplier: 1.45 },
      ],
      description: 'Code-mandated quality verification of internal weld fusion and lack of porosity.',
    },
    {
      id: 'testingLocation',
      label: 'Testing Venue & CWI Inspection Service',
      type: 'select',
      defaultValue: 'accredited_atf',
      options: [
        { label: 'Accredited Testing Facility (ATF) / Commercial Metallurgy Lab ($350 base fee)', value: 'accredited_atf', multiplier: 1.0 },
        { label: 'In-House Shop Testing (Contract Certified Welding Inspector on-site)', value: 'in_house_cwi', multiplier: 0.85 },
      ],
      description: 'Contracting an on-site CWI allows multiple welders to test concurrently in their familiar shop booths.',
    },
  ],
  calculate: (values) => {
    const welders = Number(values.welderCount) || 4;

    const codeMults: Record<string, number> = {
      aws_d1_1: 1.0,
      asme_sec_ix: 1.25,
      api_1104: 1.3,
      aws_d1_2: 1.35,
      aws_d1_6: 1.4,
      aws_cwi_exam: 3.2,
    };
    const codeMult = codeMults[values.weldingCode] || 1.0;

    const posMults: Record<string, number> = {
      position_1g_2g: 0.8,
      position_3g_4g: 1.0,
      position_6g: 1.45,
    };
    const posMult = posMults[values.testPosition] || 1.0;

    const testEvalMults: Record<string, number> = {
      guided_bend: 1.0,
      xray_ndt: 1.35,
      ultrasonic_ndt: 1.45,
    };
    const evalMult = testEvalMults[values.testingMethod] || 1.0;

    const locMults: Record<string, number> = {
      accredited_atf: 1.0,
      in_house_cwi: 0.85,
    };
    const locMult = locMults[values.testingLocation] || 1.0;

    // Special handling for AWS CWI exam
    if (values.weldingCode === 'aws_cwi_exam') {
      const cwiExamTuition = 2950 * welders;
      const studyKits = 450 * welders;
      const totalCwi = cwiExamTuition + studyKits;
      return {
        primaryLabel: `AWS CWI Inspector Exam & Seminar (${welders} Candidate${welders > 1 ? 's' : ''})`,
        estimatedLow: Math.round(totalCwi * 0.95),
        estimatedHigh: Math.round(totalCwi * 1.1),
        pointEstimate: totalCwi,
        frequencyLabel: 'AWS Certified Welding Inspector credential',
        breakdown: [
          {
            label: 'AWS Official 1-Week Seminar & 3-Part Exam Fee',
            amount: cwiExamTuition,
            description: `Parts A (Fundamentals), B (Practical visual), and C (Code book) official testing fees.`,
          },
          {
            label: 'Reference Code Books & Plastic Replica Kit',
            amount: studyKits,
            description: `AWS Book of Specifications, weld gauges, sample plastic test coupons, and study materials.`,
          },
        ],
        keyDrivers: [
          `Credential: AWS Certified Welding Inspector (CWI) national professional registration.`,
          `Cost per Candidate: $${Math.round(totalCwi / welders).toLocaleString()} all-in.`,
        ],
        costReductionTips: [
          'Take the online preparatory modules 60 days before the in-person seminar to increase first-time pass rates.',
          'Verify prior qualifying experience requirements (e.g. 5+ years with high school diploma) before registering.',
        ],
      };
    }

    // Standard welder qualification testing (WPQR)
    // Base test fee per welder (coupons, saw cutting, machining straps, bend test/X-ray)
    const baseTestPerWelder = Math.round(420 * codeMult * posMult * evalMult * locMult);

    // Group volume discount
    const groupDiscount = welders >= 8 ? 0.85 : welders >= 4 ? 0.92 : 1.0;
    const totalCouponTesting = Math.round(baseTestPerWelder * welders * groupDiscount);

    // CWI inspector witnessing and certified documentation stamp
    const cwiWitnessFee = values.testingLocation === 'in_house_cwi' ? 950 : 350;

    // Metal test coupon materials (A36 plate backing bars or Schedule 80 carbon pipe)
    const couponSteelCost = Math.round(welders * 65 * posMult);

    const totalInvestment = totalCouponTesting + cwiWitnessFee + couponSteelCost;
    const costPerWelder = Math.round(totalInvestment / welders);

    const low = Math.round(totalInvestment * 0.88);
    const high = Math.round(totalInvestment * 1.15);

    return {
      primaryLabel: `Total Welder Qualification Budget (${welders} Welders)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInvestment,
      frequencyLabel: `certified test qualification ($${costPerWelder.toLocaleString()}/welder)`,
      breakdown: [
        {
          label: 'Lab Coupon Machining & Mechanical/NDT Testing',
          amount: totalCouponTesting,
          description: `Milling coupon straps, guided bend testing or radiographic X-ray examinations for ${welders} welders.`,
        },
        {
          label: 'Certified Welding Inspector (CWI) Witnessing',
          amount: cwiWitnessFee,
          description: `AWS QC1 certified inspector overseeing parameters (amperage, voltage, travel speed, interpass temp).`,
        },
        {
          label: 'Certified Test Coupon Steel & Consumables',
          amount: couponSteelCost,
          description: `Mill-certified test plates/pipes with traceable heat numbers and certified filler metal.`,
        },
      ],
      keyDrivers: [
        `Code Standard: ${values.weldingCode.toUpperCase().replace('_', ' ')} (${values.testPosition.replace('_', ' ').toUpperCase()}).`,
        `Effective Cost per Welder: $${costPerWelder.toLocaleString()} per certified operator.`,
        `Testing Method: ${values.testingMethod === 'xray_ndt' ? 'Radiographic X-Ray NDT' : 'Mechanical Guided Bend Tests'}.`,
        `Continuity Requirement: Valid indefinitely provided the welder uses the process at least once every 6 months.`,
      ],
      costReductionTips: [
        'Test welders on a single 6G pipe coupon: this automatically qualifies them for all flat, horizontal, vertical, and overhead positions on both plate and pipe.',
        'Have a qualified CWI visit your shop to test 4 to 8 welders in a single morning shift to spread inspector day rates.',
        'Maintain a strict 6-month Welder Continuity Log to prevent certification expiration, avoiding expensive re-testing.',
      ],
      benchmarks: [
        { label: 'Cost / Welder', value: `$${costPerWelder.toLocaleString()}` },
        { label: 'Position', value: values.testPosition === 'position_6g' ? '6G Pipe' : '3G/4G Plate' },
        { label: 'Continuity Cycle', value: 'Every 6 Months' },
      ],
    };
  },
  explainer: {
    title: 'How Industrial Welding Certification Costs Are Calculated',
    paragraphs: [
      'In structural fabrication, pressure vessel manufacturing, and industrial piping, having certified welders is a non-negotiable legal and contractual requirement. General contractors, structural engineers, and ASME code authorities strictly prohibit uncertified operators from depositing production welds.',
      'A fundamental concept in industrial welding is the distinction between a Welding Procedure Specification (WPS) and a Welder Performance Qualification Record (WPQR). The WPS is the company’s recipe (specifying amperage, voltage, shielding gas, wire feed speed, and bevel geometry). The WPQR certifies that a specific individual welder has the manual dexterity to execute that recipe soundly.',
      'Pricing is driven by the test position and the examination method. Testing in the 1G (flat) position is inexpensive ($250 to $350), but only qualifies the welder to weld flat. In contrast, certifying on a 6G pipe coupon (a pipe fixed at a 45-degree angle) requires intense technical skill but qualifies the welder for all positions (flat, horizontal, vertical, and overhead) on both structural plate and pipe down to specific diameter limits.',
      'Once test coupons are welded under the watchful eye of an AWS Certified Welding Inspector (CWI), they undergo non-destructive examination (such as radiographic X-ray or phased-array ultrasonic testing) or destructive guided bend testing, where coupons are saw-cut, machined, and bent around a mandrel to 180 degrees. Any crack exceeding 1/8 inch constitutes a failure, requiring a retest.',
    ],
    factors: [
      {
        name: 'Position Geometry (Plate 3G/4G vs. Pipe 6G)',
        impact: 'High (40-60% variance)',
        detail: '6G pipe requires bevel prep, tacking, and purging; qualifies the welder for all positions.',
      },
      {
        name: 'Destructive Bend Test vs. Radiographic X-Ray',
        impact: 'Moderate ($180 vs $285 per test)',
        detail: 'X-ray inspection provides permanent digital film records without destroying physical test samples.',
      },
      {
        name: 'Governing Construction Code',
        impact: 'Moderate (20-40% difference)',
        detail: 'ASME Section IX pressure piping and aerospace D17.1 carry tighter acceptance criteria than structural D1.1.',
      },
      {
        name: 'Lab Testing vs. In-House Batch Testing',
        impact: 'Moderate (15-25% savings for groups)',
        detail: 'Testing multiple welders concurrently in your own shop spreads the CWI inspector’s day-rate.',
      },
    ],
    industryBenchmarkNote:
      'Standard AWS D1.1 structural plate certification averages $400 to $650 per welder, while ASME Section IX 6G high-pressure pipe certification averages $650 to $950 per operator.',
  },
  faqs: [
    {
      question: 'Does a welding certification belong to the welder or to the employer?',
      answer:
        'Under AWS D1.1 and ASME Section IX, the certification belongs to the EMPLOYER who tested the welder and sponsored the test under their specific Welding Procedure Specification (WPS). If the welder leaves the company, the certification does not automatically transfer to a new employer unless specified under an independent union card agreement.',
    },
    {
      question: 'How long does a welder certification remain valid?',
      answer:
        'A welder certification remains valid indefinitely, provided the welder continues to use the certified welding process (e.g. SMAW, GMAW, or GTAW) at least once every six months and maintains a signed Welder Continuity Log. If six months elapse without documented use, the certification lapses.',
    },
    {
      question: 'What is a 6G pipe test and why is it preferred?',
      answer:
        'In a 6G test, a pipe coupon is tilted at a permanent 45-degree angle and cannot be rotated. Because the welder must manipulate the torch around horizontal, vertical, and overhead positions on both sides, passing a 6G test qualifies the welder for ALL positions on plate, pipe, and structural tubing.',
    },
    {
      question: 'What is the difference between a CWI and a certified welder?',
      answer:
        'A certified welder is a craftsman qualified to deposit sound welds. A Certified Welding Inspector (CWI) is an accredited visual quality auditor certified by the American Welding Society who verifies procedure compliance, witnesses tests, interprets X-ray films, and legally signs inspection reports.',
    },
  ],
  relatedCalculatorIds: [
    'rigging-certification-cost-guide',
    'machinery-depreciation-hourly-rate-calculator',
    'manufacturing-plant-insurance-calculator',
  ],
};

export const riggingCertificationCostGuide: CalculatorDefinition = {
  id: 'rigging-certification-cost-guide',
  slug: 'rigging-certification-cost-guide',
  categoryId: 'certification',
  path: '/certification/rigging-certification-cost-guide',
  name: 'Rigging Certification Cost Guide',
  metaTitle: 'Rigging Certification Cost Guide – NCCCO & OSHA 1926.1400 Rates',
  metaDescription:
    'Calculate industrial rigger and signalperson certification costs. Compare NCCCO Rigger Level I, Level II, and employer-qualified training budgets.',
  shortDescription:
    'Calculate training and examination costs for NCCCO Certified Rigger Level I, Level II, and OSHA-compliant crane signalperson credentials.',
  targetAudience:
    'Safety directors, rigging superintendents, millwrights, ironworkers, plant maintenance supervisors, and heavy industrial contractors.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'credentialTier',
      label: 'Accreditation Level & Scope',
      type: 'select',
      defaultValue: 'rigger_level_1',
      options: [
        { label: 'NCCCO Certified Rigger Level I (Slings, hardware, basic hitching · $1,350)', value: 'rigger_level_1', multiplier: 1.0 },
        { label: 'NCCCO Certified Rigger Level II (Multi-crane, center of gravity, custom · $1,950)', value: 'rigger_level_2', multiplier: 1.45 },
        { label: 'NCCCO Certified Signalperson (Hand/voice signals under OSHA · $750)', value: 'signalperson', multiplier: 0.55 },
        { label: 'Combined Package: Rigger Level I + Signalperson ($1,850)', value: 'rigger_signal_combo', multiplier: 1.35 },
        { label: 'In-House Qualified Rigger (OSHA 1926.1401 employer designation · $450)', value: 'in_house_qualified', multiplier: 0.35 },
      ],
      description: 'National Commission for the Certification of Crane Operators (NCCCO) accredited credentials.',
    },
    {
      id: 'candidateCount',
      label: 'Number of Candidates to Certify',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 25,
      step: 1,
      unit: 'riggers',
      description: 'Total millwrights, ironworkers, technicians, or safety crew members testing.',
    },
    {
      id: 'trainingPrep',
      label: 'Preparatory Training Course',
      type: 'select',
      defaultValue: 'full_3day_prep',
      options: [
        { label: 'Full 3-Day Prep Course + Written & Practical Exams Included (1.00×)', value: 'full_3day_prep', multiplier: 1.0 },
        { label: 'Accelerated 1-Day Refresher + Exams (Experienced riggers · 0.75×)', value: 'refresher_1day', multiplier: 0.75 },
        { label: 'Exams Only / Direct Challenge (No prep course · Testing fees only · 0.40×)', value: 'exams_only', multiplier: 0.4 },
      ],
      description: 'Rigging math, D/d ratios, sling tension angle formulas, and hardware reject criteria.',
    },
    {
      id: 'testingVenue',
      label: 'Testing Location & Examination Logistics',
      type: 'select',
      defaultValue: 'open_enrollment',
      options: [
        { label: 'Dedicated Open-Enrollment Testing Center (Per-student tuition)', value: 'open_enrollment', multiplier: 1.0 },
        { label: 'On-Site Private Group Testing at Your Plant (Instructor & testing kit travel)', value: 'private_onsite', multiplier: 0.88 },
      ],
      description: 'Private on-site testing requires certified test weights, load cells, and an approved test course.',
    },
  ],
  calculate: (values) => {
    const candidates = Number(values.candidateCount) || 4;

    const baseRates: Record<string, number> = {
      rigger_level_1: 1350,
      rigger_level_2: 1950,
      signalperson: 750,
      rigger_signal_combo: 1850,
      in_house_qualified: 450,
    };
    const baseRate = baseRates[values.credentialTier] || 1350;

    const prepMults: Record<string, number> = {
      full_3day_prep: 1.0,
      refresher_1day: 0.75,
      exams_only: 0.4,
    };
    const prepMult = prepMults[values.trainingPrep] || 1.0;

    const venueMults: Record<string, number> = {
      open_enrollment: 1.0,
      private_onsite: 0.88,
    };
    const venueMult = venueMults[values.testingVenue] || 1.0;

    // Per-candidate cost
    let ratePerPerson = Math.round(baseRate * prepMult * venueMult);
    if (candidates >= 8) {
      ratePerPerson = Math.round(ratePerPerson * 0.88); // 12% group discount
    }

    const totalTuition = ratePerPerson * candidates;

    // NCCCO Official Application & Scoring Fees ($225 written + $110 practical per candidate)
    const isNccco = values.credentialTier !== 'in_house_qualified';
    const ncccoExamFees = isNccco ? candidates * 335 : candidates * 45;

    // Travel surcharge if private on-site testing for small groups
    const travelSetup = values.testingVenue === 'private_onsite' ? 1200 : 0;

    const totalInvestment = totalTuition + ncccoExamFees + travelSetup;
    const costPerCandidate = Math.round(totalInvestment / candidates);

    const low = Math.round(totalInvestment * 0.9);
    const high = Math.round(totalInvestment * 1.15);

    return {
      primaryLabel: `Total Rigging Certification Investment (${candidates} Candidates)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInvestment,
      frequencyLabel: `5-year nationally accredited credential ($${costPerCandidate.toLocaleString()}/rigger)`,
      breakdown: [
        {
          label: 'Classroom Instruction & Practical Rigging Drills',
          amount: totalTuition,
          description: `Sling angle stress calculations, center of gravity determination, and hardware inspection protocols.`,
        },
        {
          label: 'Official NCCCO Examination & Scoring Fees',
          amount: ncccoExamFees,
          description: `Computer-Based Testing (CBT) written exam and proctored practical examination scoring.`,
        },
        ...(travelSetup > 0
          ? [
              {
                label: 'On-Site Practical Test Course Setup & Travel',
                amount: travelSetup,
                description: `Transporting calibrated test weights, obstacle poles, and accredited examiner travel.`,
              },
            ]
          : []),
        {
          label: 'Official Photo ID Wallet Cards & Compliance Records',
          amount: candidates * 45,
          description: `5-year laminated credentials and online verification database registry.`,
        },
      ],
      keyDrivers: [
        `Qualification Level: ${values.credentialTier.toUpperCase().replace('_', ' ')}.`,
        `Effective Cost per Candidate: $${costPerCandidate.toLocaleString()} all-in per rigger.`,
        `Accreditation Validity: 5-year nationwide recognition across federal, petrochemical, and power generation sites.`,
        `OSHA Standard: Complies with 29 CFR 1926.1404 and ASME B30.5 standards.`,
      ],
      costReductionTips: [
        'Combine Rigger Level I and Signalperson certifications into a single 4-day course to save up to $450 per candidate.',
        'Have experienced riggers take online practice exams to challenge the test directly without paying for a 3-day prep school.',
        'Host an accredited practical examiner at your facility if certifying 6 or more workers to eliminate travel per-diems.',
      ],
      benchmarks: [
        { label: 'Cost / Candidate', value: `$${costPerCandidate.toLocaleString()}` },
        { label: 'OSHA Standard', value: '29 CFR 1926.1400' },
        { label: 'Credential Term', value: '5 Years' },
      ],
    };
  },
  explainer: {
    title: 'How Rigging Certification Costs and NCCCO Standards Are Calculated',
    paragraphs: [
      'In heavy industrial construction, plant maintenance, and crane operations, improper rigging is one of the leading causes of catastrophic load drops and fatalities. Under OSHA 29 CFR 1926.1404 and 1926.1425, employers are legally required to use a "qualified rigger" during all crane assembly/disassembly operations and whenever workers are within the fall zone of a suspended load.',
      'The gold standard in North American industrial rigging is third-party certification through the National Commission for the Certification of Crane Operators (NCCCO). Unlike an informal company-issued certificate, an NCCCO credential proves that a candidate has passed rigorous psychometrically validated written and practical examinations administered by an accredited proctor.',
      'NCCCO offers two distinct rigger tiers: Rigger Level I and Rigger Level II. A Level I rigger demonstrates basic knowledge of rigging hardware inspection, hitch configurations (vertical, choker, basket), and sling angle stress multipliers. A Level II rigger is qualified for non-routine, complex lifts, including multi-crane tandem picks, irregular centers of gravity, winching drifting loads, and selecting custom engineered lifting beams.',
      'Total costs include preparatory classroom training (typically 2 to 3 days), practical crane time to rehearse test courses, and official NCCCO candidate testing fees. Programs typically range from $1,200 to $1,800 for Level I, and $1,800 to $2,500 for combined Rigger and Signalperson certifications. Certified credentials remain valid nationwide for 5 years.',
    ],
    factors: [
      {
        name: 'Rigger Level I vs. Level II Scope',
        impact: 'High ($1,350 vs. $1,950)',
        detail: 'Level II covers complex engineering picks, custom spreader bars, and center of gravity calculations.',
      },
      {
        name: 'Full 3-Day Prep vs. Exam-Only Challenge',
        impact: 'High (Save up to 60% on exam-only)',
        detail: 'Experienced union millwrights and ironworkers can challenge written and practical exams directly.',
      },
      {
        name: 'Combined Rigger + Signalperson Bundle',
        impact: 'Moderate (Save $300-$500 per person)',
        detail: 'Bundling crane hand signal qualification with rigging training optimizes examiner scheduling.',
      },
      {
        name: 'On-Site Host Testing vs. Public Academy',
        impact: 'Moderate (12-20% group savings)',
        detail: 'Hosting test courses at your plant eliminates employee travel, hotel, and meal expenses.',
      },
    ],
    industryBenchmarkNote:
      'Industrial contractors spend an average of $1,400 to $1,900 per technician for full NCCCO Rigger Level I and Signalperson certification, fulfilling major petrochemical and utility project requirements.',
  },
  faqs: [
    {
      question: 'What is the legal difference between a "Qualified Rigger" and a "Certified Rigger"?',
      answer:
        'Under OSHA 1926.1401, a "Qualified Rigger" is someone who has met employer-determined qualifications through experience or training. A "Certified Rigger" holds a formal credential from an accredited independent certification organization like NCCCO. Many major refineries, general contractors, and government projects mandate third-party certified riggers exclusively.',
    },
    {
      question: 'What does the NCCCO practical exam involve?',
      answer:
        'The practical exam tests physical skills: inspecting damaged slings and shackles against reject criteria, selecting the correct hitch for a specific load, tying four required rigging knots (bowline, clove hitch, sheet bend, square knot), and guiding a suspended load through a slalom obstacle course.',
    },
    {
      question: 'How long does an NCCCO rigger certification last?',
      answer:
        'NCCCO rigger and signalperson certifications are valid for 5 years. Prior to expiration, riggers must take a recertification written exam to demonstrate up-to-date knowledge of evolving ASME B30 safety standards.',
    },
    {
      question: 'Does a certified crane operator automatically qualify as a certified rigger?',
      answer:
        'No. Crane operator certification and rigging certification are separate credentials. While crane operators understand basic load charts, rigging requires specialized knowledge of hardware inspection, sling angles, center of gravity, and shackle load limits.',
    },
  ],
  relatedCalculatorIds: [
    'crane-rental-cost-estimator',
    'welding-certification-cost-guide',
    'confined-space-training-cost-calculator',
  ],
};
