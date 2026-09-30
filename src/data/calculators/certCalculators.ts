import { CalculatorDefinition } from '../../types';
import { STATE_SELECT_OPTIONS, US_STATES } from '../usStates';

export const craneOperatorCertByStateCalc: CalculatorDefinition = {
  id: 'crane-operator-certification-cost-by-state',
  slug: 'crane-operator-certification-cost-by-state',
  categoryId: 'certification',
  path: '/certification/crane-operator-certification-cost-by-state',
  name: 'Crane Operator Certification Cost by State',
  metaTitle: 'Crane Operator Certification Cost by State – NCCCO Rates',
  metaDescription:
    'Calculate crane operator certification costs across all 50 states. Compare NCCCO exams, state crane license fees, practical tests, and prep schools.',
  shortDescription:
    'Estimate total costs for NCCCO mobile crane certification, written core/specialty exams, practical testing, and state-specific Department of Labor crane operator licenses.',
  targetAudience:
    'Heavy equipment contractors, steel erectors, rigging supervisors, safety directors, and crane operators seeking or renewing national and state credentials.',
  featured: true,
  featuredBadge: 'NCCCO Standard',
  iconName: 'Award',
  fields: [
    {
      id: 'state',
      label: 'Operating State / Licensing Jurisdiction',
      type: 'select',
      defaultValue: 'CA',
      options: STATE_SELECT_OPTIONS,
      description: 'Certain states (e.g. CA, NY, PA, WA, HI, MA, NJ, MD, CT, NV) require state/city licenses in addition to NCCCO.',
    },
    {
      id: 'craneSpecialty',
      label: 'Crane Certification Specialty Category',
      type: 'select',
      defaultValue: 'telescopic_swing_cab',
      options: [
        { label: 'Telescopic Boom - Swing Cab (TLL · Hydraulic cranes >25 tons · Most versatile)', value: 'telescopic_swing_cab', multiplier: 1.0 },
        { label: 'Telescopic Boom - Fixed Cab (TSS · Boom trucks & carry decks up to 25 tons)', value: 'telescopic_fixed_cab', multiplier: 0.88 },
        { label: 'Lattice Boom Crawler / Truck Crane (LBC / LBT · Heavy industrial / foundation)', value: 'lattice_boom', multiplier: 1.25 },
        { label: 'Tower Crane Operator (TWR · Commercial construction high-rise)', value: 'tower_crane', multiplier: 1.35 },
        { label: 'Overhead Bridge & Gantry Crane (OVR · Indoor manufacturing plant bays)', value: 'overhead_gantry', multiplier: 0.75 },
      ],
      description: 'NCCCO candidates take a Core written exam plus one or more crane specialty category exams.',
    },
    {
      id: 'operatorCount',
      label: 'Number of Operator Candidates',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 20,
      step: 1,
      unit: 'operators',
      description: 'Total candidates attending training and proctored testing.',
    },
    {
      id: 'trainingPrepScope',
      label: 'Preparatory School & Training Scope',
      type: 'select',
      defaultValue: 'full_prep_course',
      options: [
        { label: 'Full 4-Day Prep Course + Written CBT & Practical Exams Included ($2,250/operator)', value: 'full_prep_course', multiplier: 1.0 },
        { label: 'Accelerated 2-Day Refresher + Testing (Experienced operators · $1,450/operator)', value: 'refresher_course', multiplier: 0.65 },
        { label: 'Direct Exam Challenge Only (Experienced operators · No class · Testing fees only · $750)', value: 'exam_only', multiplier: 0.34 },
      ],
      description: 'Load charts, rigging math, site conditions, wire rope inspection, and obstacle course practice.',
    },
    {
      id: 'dotMedicalPhysical',
      label: 'DOT / FMCSA Medical Physical Card',
      type: 'select',
      defaultValue: 'included',
      options: [
        { label: 'Requires DOT Medical Examiner Physical Examination (+$125/operator)', value: 'included', multiplier: 125 },
        { label: 'Candidate Already Holds Active DOT Medical Card ($0)', value: 'already_have', multiplier: 0 },
      ],
      description: 'Operating commercial truck cranes on public highways requires a valid 2-year DOT medical card.',
    },
  ],
  calculate: (values) => {
    const operators = Number(values.operatorCount) || 2;
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    const specialtyMults: Record<string, number> = {
      telescopic_swing_cab: 1.0,
      telescopic_fixed_cab: 0.88,
      lattice_boom: 1.25,
      tower_crane: 1.35,
      overhead_gantry: 0.75,
    };
    const specMult = specialtyMults[values.craneSpecialty] || 1.0;

    const prepRates: Record<string, number> = {
      full_prep_course: 2250,
      refresher_course: 1450,
      exam_only: 750,
    };
    const baseRatePerOperator = prepRates[values.trainingPrepScope] || 2250;

    // State licensing fee surcharge (states requiring state licenses: CA, NY, PA, MA, HI, etc.)
    const stateLicensingStates = ['CA', 'NY', 'PA', 'WA', 'HI', 'MA', 'NJ', 'MD', 'CT', 'NV'];
    const isStateLicenseRequired = stateLicensingStates.includes(stateObj.code);
    const stateLicenseFeePerOperator = isStateLicenseRequired ? 250 : 0;

    const medicalFeePerOperator = values.dotMedicalPhysical === 'included' ? 125 : 0;

    // Tuition and testing calculation
    let tuitionPerOperator = Math.round(baseRatePerOperator * specMult);
    if (operators >= 6) {
      tuitionPerOperator = Math.round(tuitionPerOperator * 0.88); // 12% group discount
    }

    const totalTuition = tuitionPerOperator * operators;
    const totalStateLicenseFees = stateLicenseFeePerOperator * operators;
    const totalMedicalFees = medicalFeePerOperator * operators;

    // NCCCO Application & Candidate Registration ($375 Core + Specialty + Practical Scoring per operator)
    const ncccoExamRegistry = operators * 375;

    const totalInvestment = totalTuition + totalStateLicenseFees + totalMedicalFees + ncccoExamRegistry;
    const costPerOperator = Math.round(totalInvestment / operators);

    const low = Math.round(totalInvestment * 0.9);
    const high = Math.round(totalInvestment * 1.15);

    return {
      primaryLabel: `Total Crane Certification Investment (${operators} Operators)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInvestment,
      frequencyLabel: `5-year credential ($${costPerOperator.toLocaleString()}/operator)`,
      breakdown: [
        {
          label: 'Classroom Load Chart Prep & Practical Crane Seat-Time',
          amount: totalTuition,
          description: `Prep course, crane rental time on test obstacle course, and instructor guidance for ${operators} operator(s).`,
        },
        {
          label: 'Official NCCCO Written & Practical Examination Fees',
          amount: ncccoExamRegistry,
          description: `Computer-Based Testing (CBT) Core & Specialty exams plus proctored practical test administration.`,
        },
        ...(totalStateLicenseFees > 0
          ? [
              {
                label: `State Crane Operator License Fees (${stateObj.name})`,
                amount: totalStateLicenseFees,
                description: `Mandatory Department of Labor state operating certificate for ${stateObj.name}.`,
              },
            ]
          : []),
        ...(totalMedicalFees > 0
          ? [
              {
                label: 'DOT / FMCSA Medical Examiner Physicals',
                amount: totalMedicalFees,
                description: `Certified DOT medical exams verifying vision, hearing, and cardiovascular health.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Specialty Category: ${values.craneSpecialty.toUpperCase().replace('_', ' ')}.`,
        `Effective Cost per Operator: $${costPerOperator.toLocaleString()} all-in (${stateObj.name}).`,
        `State Mandate Status: ${isStateLicenseRequired ? `${stateObj.name} mandates state/city licensing in addition to NCCCO` : 'Complies under Federal OSHA standard'}.`,
        `Credential Lifespan: Valid nationwide for 5 years before recertification.`,
      ],
      costReductionTips: [
        'Experienced operators should take computerized practice tests to challenge the exams directly without a full 4-day prep school, saving up to $1,500.',
        'Bundle multiple crane specialties (e.g. Swing Cab TLL + Fixed Cab TSS) during the same testing session to share the Core exam fee.',
        'Ensure candidates possess clean DOT physical cards before class to avoid testing disqualification on practical test days.',
      ],
      benchmarks: [
        { label: 'Cost / Operator', value: `$${costPerOperator.toLocaleString()}` },
        { label: 'OSHA Standard', value: '29 CFR 1926.1427' },
        { label: 'Validity Term', value: '5 Years' },
      ],
    };
  },
  explainer: {
    title: 'How Crane Operator Certification Costs by State Are Calculated',
    paragraphs: [
      'Under OSHA 29 CFR 1926 Subpart CC (Cranes and Derricks in Construction, § 1926.1427), all mobile crane operators must be fully accredited by a nationally recognized accrediting agency (such as the National Commission for the Certification of Crane Operators, NCCCO) or an audited employer qualification program.',
      'A primary cost and compliance factor is state-level licensing. While federal OSHA sets the national baseline, over 18 states and major municipalities (including California, New York, Pennsylvania, Massachusetts, Hawaii, Washington, and New York City) maintain independent statutory crane licensing laws. In these jurisdictions, passing the NCCCO exam is merely a prerequisite; operators must also submit state Department of Labor applications, undergo state background checks, and pay separate state licensing fees.',
      'The NCCCO certification curriculum comprises three parts: the Written Core Examination (covering OSHA regulations, site conditions, power line clearances, wire rope inspection, and basic load charts), at least one Specialty Written Examination (such as Telescopic Boom Swing-Cab or Lattice Boom), and a proctored Practical Obstacle Course Examination. During the practical exam, candidates must maneuver a test weight through tight slalom poles, catch load swings, and place a ball in a barrel within strict time limits without touching boundaries.',
      'Total costs range from $750 for experienced operators challenging testing centers directly, up to $2,200 to $2,800 per student for full 4-day preparatory schools that supply crane seat-time, certified instructors, and on-site testing. All NCCCO operator certifications remain valid for 5 years.',
    ],
    factors: [
      {
        name: 'Training Prep School vs. Direct Exam Challenge',
        impact: 'High (Save $1,200-$1,500/operator)',
        detail: 'Experienced crane operators can test directly without paying for 4-day classroom schools.',
      },
      {
        name: 'State Licensing Board Mandates',
        impact: 'Moderate (Adds $150 to $350 in state fees)',
        detail: 'States like CA, NY, PA, and WA require state-issued licenses in addition to NCCCO cards.',
      },
      {
        name: 'Crane Category Specialty (Telescopic vs. Lattice)',
        impact: 'Moderate (20-35% variance)',
        detail: 'Lattice crawler cranes and tower cranes carry higher practical testing machine fees.',
      },
      {
        name: 'DOT Medical Physical Examinations',
        impact: 'Low ($100 to $150 per driver)',
        detail: 'Mandatory commercial medical card for driving mobile truck cranes on public highways.',
      },
    ],
    industryBenchmarkNote:
      'Contractors budget an average of $2,100 to $2,700 per operator for turnkey 4-day prep school and testing, fulfilling commercial and industrial site access requirements.',
  },
  faqs: [
    {
      question: 'Is an NCCCO certification valid in all 50 states?',
      answer:
        'NCCCO certification satisfies federal OSHA requirements nationwide. However, approximately 18 states and major cities (including California, New York City, Massachusetts, Washington, and Hawaii) mandate that operators also obtain a state-issued license by submitting their NCCCO credentials and paying a state fee.',
    },
    {
      question: 'What is the passing score on the NCCCO crane exams?',
      answer:
        'NCCCO written examinations use a scaled score system where 70 is the minimum passing score. The practical exam is scored based on deductions for boundary infractions, load contact, and time penalties; candidates must complete the course with fewer than the maximum allowable penalty points.',
    },
    {
      question: 'How long does a crane operator certification last?',
      answer:
        'NCCCO crane operator certifications are valid for exactly 5 years. To recertify, operators must document at least 1,000 hours of crane-related experience during the 5-year period and pass an abbreviated recertification written exam before expiration.',
    },
    {
      question: 'Can an operator certified on a boom truck operate a large all-terrain crane?',
      answer:
        'No. Telescopic boom cranes are divided into Fixed Cab (TSS) and Swing Cab (TLL). An operator certified on a Fixed Cab boom truck cannot legally operate a Swing Cab crane until they pass the specific TLL written and practical examinations.',
    },
  ],
  relatedCalculatorIds: [
    'crane-rental-cost-estimator',
    'rigging-certification-cost-guide',
    'heavy-equipment-rental-vs-buy-calculator',
  ],
};

export const hazwoperCertificationCalc: CalculatorDefinition = {
  id: 'hazwoper-certification-cost-guide',
  slug: 'hazwoper-certification-cost-guide',
  categoryId: 'certification',
  path: '/certification/hazwoper-certification-cost-guide',
  name: 'HAZWOPER Certification Cost Guide',
  metaTitle: 'HAZWOPER Certification Cost Guide – 40-Hour & 24-Hour OSHA Rates',
  metaDescription:
    'Calculate OSHA 29 CFR 1910.120 HAZWOPER certification costs. Compare 40-hour initial, 24-hour limited, 8-hour refresher courses, and respirator medical exams.',
  shortDescription:
    'Calculate OSHA 1910.120 HAZWOPER certification costs: 40-Hour initial site worker, 24-Hour limited, 8-Hour annual refreshers, and respirator medical clearance.',
  targetAudience:
    'Environmental remediation contractors, chemical plant emergency response teams, industrial hygiene managers, and safety directors complying with OSHA 1910.120.',
  featured: true,
  featuredBadge: 'Hazmat Standard',
  iconName: 'Award',
  fields: [
    {
      id: 'hazwoperTier',
      label: 'HAZWOPER Course Scope & Standard',
      type: 'select',
      defaultValue: 'hours_40_initial',
      options: [
        { label: '40-Hour HAZWOPER Initial (General site workers / Uncontrolled hazardous sites · $425)', value: 'hours_40_initial', multiplier: 1.0 },
        { label: '24-Hour HAZWOPER (Occasional site workers / Limited exposure · $265)', value: 'hours_24_limited', multiplier: 0.62 },
        { label: '8-Hour HAZWOPER Annual Refresher (Mandatory 12-month renewal · $65)', value: 'hours_8_refresher', multiplier: 0.15 },
        { label: '8-Hour HAZWOPER Supervisor Training (Management & incident command · $120)', value: 'hours_8_supervisor', multiplier: 0.28 },
        { label: 'Emergency Response Technician (24-Hour spill response team · $550)', value: 'spill_technician', multiplier: 1.3 },
      ],
      description: 'OSHA 29 CFR 1910.120(e) mandates 40 hours for general site workers and 24 hours for occasional workers.',
    },
    {
      id: 'studentCount',
      label: 'Number of Employees Being Trained',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 60,
      step: 1,
      unit: 'workers',
      description: 'Total remediation technicians, environmental engineers, or safety crew members.',
    },
    {
      id: 'deliveryFormat',
      label: 'Training Delivery Methodology',
      type: 'select',
      defaultValue: 'blended_hands_on',
      options: [
        { label: 'Blended Learning (Online theory + On-site hands-on Level A/B PPE donning drill · 1.00×)', value: 'blended_hands_on', multiplier: 1.0 },
        { label: '100% Self-Paced Online (Theory only · Employer conducts field drill internally · 0.65×)', value: 'online_only', multiplier: 0.65 },
        { label: 'Dedicated On-Site Instructor at Your Plant (Private company 5-day cohort · 1.25×)', value: 'dedicated_onsite', multiplier: 1.25 },
      ],
      description: 'OSHA strictly requires hands-on practical training with respirators and protective chemical suits.',
    },
    {
      id: 'medicalSurveillance',
      label: 'Respirator Medical Clearance & Fit-Testing',
      type: 'select',
      defaultValue: 'full_medical',
      options: [
        { label: 'Full OSHA Medical Surveillance Exam (Spirometry + ECG + Doctor clearance · $195/worker)', value: 'full_medical', multiplier: 195 },
        { label: 'Online Medical Questionnaire & Quantitative Fit-Test Only ($75/worker)', value: 'fit_test_only', multiplier: 75 },
        { label: 'Employees Already Medically Cleared ($0)', value: 'none', multiplier: 0 },
      ],
      description: 'OSHA 1910.120(f) mandates medical baseline exams for workers wearing chemical respirators >30 days/yr.',
    },
  ],
  calculate: (values) => {
    const students = Number(values.studentCount) || 4;

    const baseRates: Record<string, number> = {
      hours_40_initial: 425,
      hours_24_limited: 265,
      hours_8_refresher: 65,
      hours_8_supervisor: 120,
      spill_technician: 550,
    };
    const baseRate = baseRates[values.hazwoperTier] || 425;

    const deliveryMults: Record<string, number> = {
      blended_hands_on: 1.0,
      online_only: 0.65,
      dedicated_onsite: 1.25,
    };
    const deliveryMult = deliveryMults[values.deliveryFormat] || 1.0;

    const medCosts: Record<string, number> = {
      full_medical: 195,
      fit_test_only: 75,
      none: 0,
    };
    const medPerWorker = medCosts[values.medicalSurveillance] || 0;

    // Volume discount for larger teams
    let ratePerWorker = Math.round(baseRate * deliveryMult);
    if (students >= 15) {
      ratePerWorker = Math.round(ratePerWorker * 0.82);
    } else if (students >= 8) {
      ratePerWorker = Math.round(ratePerWorker * 0.9);
    }

    const totalTuition = ratePerWorker * students;
    const totalMedical = medPerWorker * students;

    // Official plastic laminated wallet cards and compliance records ($25/student)
    const docsFee = students * 25;

    const totalInvestment = totalTuition + totalMedical + docsFee;
    const costPerStudent = Math.round(totalInvestment / students);

    const low = Math.round(totalInvestment * 0.9);
    const high = Math.round(totalInvestment * 1.15);

    return {
      primaryLabel: `Total HAZWOPER Certification Budget (${students} Workers)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInvestment,
      frequencyLabel: `${values.hazwoperTier.replace('_', ' ').toUpperCase()} compliance ($${costPerStudent.toLocaleString()}/worker)`,
      breakdown: [
        {
          label: 'Course Tuition & Practical Hands-On Training',
          amount: totalTuition,
          description: `Accredited HAZWOPER curriculum and hands-on Level A/B suit donning/doffing for ${students} worker(s).`,
        },
        ...(totalMedical > 0
          ? [
              {
                label: 'OSHA 1910.120(f) Medical Surveillance & Fit-Tests',
                amount: totalMedical,
                description: `Spirometry lung function, physician review, and quantitative respirator fit-testing.`,
              },
            ]
          : []),
        {
          label: 'Laminated Wallet Cards & Digital Compliance Archives',
          amount: docsFee,
          description: `Permanent certificate records, training logs, and wallet credentials.`,
        },
      ],
      keyDrivers: [
        `Curriculum Scope: ${values.hazwoperTier.replace('_', ' ').toUpperCase()} ($${ratePerWorker}/student base).`,
        `Effective Cost per Worker: $${costPerStudent.toLocaleString()} all-in per certified employee.`,
        `3-Day Field Experience Rule: 40-hour students must complete 3 days of supervised field training under a qualified mentor.`,
        `Annual Refresher Mandate: 8-hour refresher required every 12 months to maintain active certification.`,
      ],
      costReductionTips: [
        'Use blended learning (online modules + 1-day practical hands-on workshop) to save 30% compared to 5 full days off-site.',
        'Track the 12-month expiration date strictly: allowing a certificate to lapse beyond a reasonable window can require retaking the entire 40-hour course.',
        'Batch group physicals with a local mobile occupational health clinic to negotiate volume medical discounts.',
      ],
      benchmarks: [
        { label: 'Cost / Worker', value: `$${costPerStudent.toLocaleString()}` },
        { label: 'OSHA Standard', value: '29 CFR 1910.120' },
        { label: 'Refresher Cycle', value: 'Annual (8 Hours)' },
      ],
    };
  },
  explainer: {
    title: 'How HAZWOPER Certification Costs and Training Tiers Are Calculated',
    paragraphs: [
      'OSHA standard 29 CFR 1910.120 (and 29 CFR 1926.65 in construction)—universally known as HAZWOPER (Hazardous Waste Operations and Emergency Response)—governs workers exposed to hazardous substances during chemical remediation, Superfund cleanups, emergency chemical spill response, and TSDF operations.',
      'A common compliance misunderstanding revolves around the distinction between the 40-Hour and 24-Hour courses. Under paragraph (e)(3)(i), the 40-Hour HAZWOPER course is legally mandatory for general site workers (such as equipment operators, laborers, and supervisors) who engage in hazardous substance removal or who are exposed to hazardous substances at or above permissible exposure limits (PELs). The 24-Hour course is reserved strictly for workers who are on site only occasionally for a specific limited task and where exposures are proven to remain below PELs.',
      'Equally vital is the 3-Day Supervised Field Experience mandate. OSHA 1910.120(e)(3)(i) explicitly states that after completing the 40-hour classroom or online coursework, the worker must complete at least three days of documented, hands-on field experience under the direct supervision of a trained, experienced supervisor before being legally certified to work independently. A certificate of course completion alone does not fulfill OSHA compliance.',
      'Under paragraph (f), workers who wear respirators for 30 days or more per year or who are exposed to toxic concentrations must undergo medical surveillance—including baseline pulmonary function tests (spirometry), audiograms, and physician clearance. All certified workers must complete an annual 8-hour HAZWOPER refresher course every 12 months to maintain their certification.',
    ],
    factors: [
      {
        name: '40-Hour vs. 24-Hour vs. 8-Hour Refresher Tier',
        impact: 'High ($65 refresher vs $425 initial 40-hr)',
        detail: 'Initial 40-hour courses cover extensive chemical toxicology, monitoring, and containment.',
      },
      {
        name: 'Hands-On Level A/B Suit Drills',
        impact: 'Moderate (Blended vs. Online only)',
        detail: 'OSHA mandates physical practice donning self-contained breathing apparatus (SCBA) and chemical suits.',
      },
      {
        name: 'Medical Surveillance Physicals & Fit-Testing',
        impact: 'Moderate ($195 per worker)',
        detail: 'Mandatory physician respirator clearance before workers can legally wear tight-fitting masks.',
      },
      {
        name: 'Group Cohort Sizing',
        impact: 'Moderate (10-18% group savings)',
        detail: 'Enrolling teams of 8 or more workers unlocks commercial corporate tuition discounts.',
      },
    ],
    industryBenchmarkNote:
      'Environmental contractors budget between $450 and $700 per technician for initial 40-hour certification and medical clearance, and approximately $90 annually for the 8-hour refresher.',
  },
  faqs: [
    {
      question: 'Can the 40-Hour HAZWOPER course be taken 100% online?',
      answer:
        'OSHA permits the cognitive/lecture portion of HAZWOPER to be taken online, but OSHA interpretation letters explicitly state that training must include hands-on practice with the personal protective equipment (PPE) and respirators that employees will actually use. An employer must conduct and document this hands-on evaluation.',
    },
    {
      question: 'What is the 3-day field experience requirement under HAZWOPER?',
      answer:
        'Under OSHA 1910.120(e)(3)(i), workers completing the 40-hour course must receive 3 days of actual field experience under the direct supervision of a qualified supervisor before they can work unsupervised on a hazardous waste site.',
    },
    {
      question: 'What happens if an employee misses the 12-month deadline for their 8-hour refresher?',
      answer:
        'OSHA allows a reasonable grace period if an employee cannot take the refresher within exactly 12 months due to scheduling. However, if substantial time has elapsed and the employee cannot demonstrate familiarity with safety protocols, OSHA requires retaking the full initial course.',
    },
    {
      question: 'What is the difference between Level A, B, C, and D PPE?',
      answer:
        'Level A provides maximum respiratory and skin protection (vapor-tight fully encapsulated suit + SCBA). Level B provides maximum respiratory but lesser skin protection (non-vapor-tight suit + SCBA). Level C uses an air-purifying respirator (gas mask) with chemical clothing. Level D is standard work coveralls and boots with no respiratory protection.',
    },
  ],
  relatedCalculatorIds: [
    'confined-space-training-cost-calculator',
    'industrial-waste-disposal-cost-by-state',
    'osha-fine-calculator',
  ],
};

export const osha30TrainingCalc: CalculatorDefinition = {
  id: 'osha-30-training-cost-calculator',
  slug: 'osha-30-training-cost-calculator',
  categoryId: 'certification',
  path: '/certification/osha-30-training-cost-calculator',
  name: 'OSHA 30 Training Cost Calculator',
  metaTitle: 'OSHA 30 Training Cost Calculator – DOL Card & Supervisor Rates',
  metaDescription:
    'Calculate OSHA 30-Hour training costs for General Industry and Construction. Compare online courses, on-site authorized trainers, and official DOL plastic cards.',
  shortDescription:
    'Calculate OSHA 30-Hour training costs for General Industry (1910) and Construction (1926), authorized Outreach trainer day rates, and official DOL wallet cards.',
  targetAudience:
    'Safety managers, plant supervisors, general contractors, human resource coordinators, and project superintendents obtaining official OSHA 30 credentials.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'industryTrack',
      label: 'OSHA Industry Standard & Track',
      type: 'select',
      defaultValue: 'general_industry',
      options: [
        { label: 'OSHA 30-Hour General Industry (Manufacturing, warehouses, logistics, plants · 1.00×)', value: 'general_industry', multiplier: 1.0 },
        { label: 'OSHA 30-Hour Construction (Commercial building, mechanical erection, civil · 1.00×)', value: 'construction', multiplier: 1.0 },
      ],
      description: 'General Industry focuses on LOTO, machine guarding, and walking-working surfaces; Construction focuses on Focus Four hazards.',
    },
    {
      id: 'deliveryMode',
      label: 'Training Delivery Format',
      type: 'select',
      defaultValue: 'online_self_paced',
      options: [
        { label: 'OSHA-Authorized Online Provider (Self-paced · 180-day completion window · $165/person)', value: 'online_self_paced', costPerStudent: 165 },
        { label: 'On-Site Private Authorized Trainer at Your Facility (4-Day Dedicated Cohort · $5,500 total)', value: 'onsite_private', costPerStudent: 0 },
        { label: 'Public Safety Council / College Classroom (In-person enrollment · $475/person)', value: 'public_classroom', costPerStudent: 475 },
      ],
      description: 'Private on-site instruction allows tailoring curriculum to your plant’s specific machinery and hazards.',
    },
    {
      id: 'traineeCount',
      label: 'Number of Supervisors & Leads to Train',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 50,
      step: 1,
      unit: 'supervisors',
      description: 'Foremen, superintendents, EHS committee members, and lead technicians.',
    },
    {
      id: 'includeWageLoss',
      label: 'Include Estimated Employee Wage Cost (30 Hours of Paid Time)',
      type: 'select',
      defaultValue: 'exclude_wages',
      options: [
        { label: 'Exclude Employee Wages (Tuition and materials only)', value: 'exclude_wages', wageRate: 0 },
        { label: 'Include Hourly Wages at $32/hr + 30% payroll burden ($1,248 per trainee)', value: 'include_wages', wageRate: 41.6 },
      ],
      description: 'Factoring in 30 hours of paid employee time provides true fully burdened organizational cost.',
    },
  ],
  calculate: (values) => {
    const students = Number(values.traineeCount) || 5;

    let tuitionTotal = 0;
    if (values.deliveryMode === 'online_self_paced') {
      let perStudent = 165;
      if (students >= 15) perStudent = 135;
      else if (students >= 6) perStudent = 148;
      tuitionTotal = perStudent * students;
    } else if (values.deliveryMode === 'onsite_private') {
      // Fixed $5,500 for trainer day rate across 4 days (max 7.5 hours per day under OSHA Outreach rules)
      tuitionTotal = 5500 + Math.max(0, students - 15) * 65;
    } else {
      tuitionTotal = 475 * students;
    }

    // Official Department of Labor (DOL) plastic wallet card processing fee
    // Included in online courses, but $15/card administration on private groups
    const dolCardFees = values.deliveryMode === 'onsite_private' ? students * 15 : 0;

    // Wage loss burden
    const hourlyBurden = values.includeWageLoss === 'include_wages' ? 41.6 : 0;
    const totalWageBurden = Math.round(hourlyBurden * 30 * students);

    const totalProgramCost = tuitionTotal + dolCardFees + totalWageBurden;
    const effectiveCostPerStudent = Math.round(totalProgramCost / students);

    const low = Math.round(totalProgramCost * 0.9);
    const high = Math.round(totalProgramCost * 1.15);

    return {
      primaryLabel: `Total OSHA 30 Training Investment (${students} Supervisors)`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalProgramCost,
      frequencyLabel: `30-hour comprehensive credential ($${effectiveCostPerStudent.toLocaleString()}/trainee)`,
      breakdown: [
        {
          label: 'Authorized OSHA Outreach Course Tuition',
          amount: tuitionTotal,
          description: `Comprehensive 30-hour curriculum delivered via ${values.deliveryMode.replace('_', ' ')}.`,
        },
        ...(totalWageBurden > 0
          ? [
              {
                label: 'Indirect Employee Wages (30 Hours per Trainee)',
                amount: totalWageBurden,
                description: `30 hours of paid time per worker at $${hourlyBurden.toFixed(2)}/hr burdened rate.`,
              },
            ]
          : []),
        {
          label: 'Official US Department of Labor (DOL) Plastic Cards',
          amount: Math.round(students * 15),
          description: `Official gold/blue plastic DOL wallet credentials issued directly by an OSHA Training Institute (OTI).`,
        },
      ],
      keyDrivers: [
        `Industry Track: OSHA 30-Hour ${values.industryTrack === 'construction' ? 'Construction (29 CFR 1926)' : 'General Industry (29 CFR 1910)'}.`,
        `Effective Cost per Trainee: $${effectiveCostPerStudent.toLocaleString()} all-in (${values.deliveryMode.replace('_', ' ')}).`,
        `Max Daily Limit: OSHA Outreach rules strictly prohibit training more than 7.5 hours per day (minimum 4 days required).`,
        `DOL Card Validity: Official cards have no federal expiration, though many general contractors mandate recertification every 3 to 5 years.`,
      ],
      costReductionTips: [
        'Utilize accredited online providers for individual supervisors to avoid scheduling 4 full days away from plant operations.',
        'If training 12 or more supervisors, hire an on-site authorized Outreach trainer to reduce per-person costs below $250.',
        'Beware of unaccredited certificates: ensure the provider issues an official plastic card from the US Department of Labor, not a generic certificate.',
      ],
      benchmarks: [
        { label: 'Cost / Student', value: `$${effectiveCostPerStudent.toLocaleString()}` },
        { label: 'Training Hours', value: '30 Contact Hours' },
        { label: 'Credential', value: 'US DOL Wallet Card' },
      ],
    };
  },
  explainer: {
    title: 'How OSHA 30-Hour Training Costs Are Calculated',
    paragraphs: [
      'The OSHA 30-Hour Outreach Training Program is the premier safety leadership credential for supervisors, superintendents, safety committee members, and lead workers across general industry (manufacturing, logistics, chemical processing) and construction. Unlike the entry-level OSHA 10-Hour course which covers basic hazard awareness, OSHA 30 provides in-depth education on hazard identification, avoidance, control, and prevention.',
      'Training delivery rules are strictly regulated by the OSHA Directorate of Training and Education. Under Outreach program guidelines, an instructor cannot teach more than 7.5 hours per day. Consequently, an OSHA 30 course must span a minimum of four days. Additionally, student attendance is strictly verified, and courses must cover mandatory core topics—such as Lockout/Tagout (LOTO), Machine Guarding, Confined Spaces, and Hazard Communication in General Industry, or the Focus Four Hazards (Falls, Caught-in/Between, Struck-By, Electrocution) in Construction.',
      'Pricing varies based on instructional delivery. Online self-paced courses ($140 to $190 per student) provide flexible 24/7 access with a mandatory 180-day completion window and biometric identity verification. For companies with 10 or more supervisors, contracting an authorized Outreach trainer for an on-site private 4-day seminar ($4,500 to $6,500 total) allows customizing curriculum examples directly to the plant’s operating machinery.',
      'While the official US Department of Labor wallet card does not carry a federal expiration date under federal law, many municipal jurisdictions (such as New York City under Local Law 196, Nevada under AB 148, and major industrial project owners) legally mandate that supervisory personnel refresh their OSHA 30 card every 3 to 5 years.',
    ],
    factors: [
      {
        name: 'Online Provider vs. On-Site Private Instructor',
        impact: 'High ($165 online vs $5,500 group)',
        detail: 'On-site training becomes economically superior when training cohorts of 12 or more staff.',
      },
      {
        name: 'Wage Loss & Production Backfill Cost',
        impact: 'High (30 hours of paid employee time)',
        detail: 'Lost productivity often exceeds tuition fees by 4× to 6× when paid wages are accounted for.',
      },
      {
        name: 'Official DOL Card Verification',
        impact: 'Low ($10 to $20/card fee)',
        detail: 'Must be issued by an authorized OSHA Training Institute Education Center (OTIEC).',
      },
      {
        name: 'Municipal & Contractual Mandates (NYC LL196 / NV)',
        impact: 'Moderate (Mandatory 5-year refreshers)',
        detail: 'Certain states require regular refresher training to access commercial jobsites.',
      },
    ],
    industryBenchmarkNote:
      'Companies spend an average of $160 to $220 per supervisor for online OSHA 30 courses, rising to approximately $1,400 per person when factoring in 30 hours of fully burdened employee payroll time.',
  },
  faqs: [
    {
      question: 'What is the difference between an OSHA 10 and an OSHA 30 card?',
      answer:
        'OSHA 10 is designed for entry-level workers and covers general hazard recognition over 2 days. OSHA 30 is designed for foremen, supervisors, safety managers, and designated competent persons, providing comprehensive regulatory training over 4 days with emphasis on employer safety responsibilities.',
    },
    {
      question: 'Does an OSHA 30 card expire?',
      answer:
        'Under federal OSHA rules, official Department of Labor (DOL) cards do not expire. However, many general contractors, state laws (such as Nevada), and municipal regulations (such as NYC Local Law 196) require cards to have been issued within the past 3 to 5 years to be valid on site.',
    },
    {
      question: 'Can the 30-hour course be completed in two long 15-hour days?',
      answer:
        'No. OSHA Outreach program rules strictly prohibit training more than 7.5 contact hours in any 24-hour period. Any course claiming to complete OSHA 30 in fewer than 4 distinct calendar days is fraudulent and will not be issued an official DOL card.',
    },
    {
      question: 'What is the difference between an official DOL card and a course certificate?',
      answer:
        'A generic "course certificate" is issued by an unverified training company and carries no official government standing. An official DOL card is printed on heavy plastic, issued directly by an OSHA Training Institute (OTI), and features a unique student barcode registered in the federal database.',
    },
  ],
  relatedCalculatorIds: [
    'osha-fine-calculator',
    'confined-space-training-cost-calculator',
    'hazwoper-certification-cost-guide',
  ],
};

export const masterElectricianLicenseCalc: CalculatorDefinition = {
  id: 'master-electrician-license-cost-by-state',
  slug: 'master-electrician-license-cost-by-state',
  categoryId: 'certification',
  path: '/certification/master-electrician-license-cost-by-state',
  name: 'Master Electrician License Cost by State',
  metaTitle: 'Master Electrician License Cost by State – Exam & Board Fees',
  metaDescription:
    'Calculate Master Electrician license costs by state. Compare state licensing board fees, NEC exam prep courses, contractor surety bonds, and CEU renewal budgets.',
  shortDescription:
    'Calculate complete Master Electrician licensing costs across all 50 states: state board fees, National Electrical Code (NEC) prep seminars, contractor bonds, and CEU renewals.',
  targetAudience:
    'Journeyman electricians, electrical contractors, industrial plant maintenance managers, and business owners obtaining Master Electrician credentials.',
  featured: false,
  iconName: 'Award',
  fields: [
    {
      id: 'state',
      label: 'Licensing State Board Jurisdiction',
      type: 'select',
      defaultValue: 'TX',
      options: STATE_SELECT_OPTIONS,
      description: 'State electrical licensing board (e.g. TDLR in Texas, PSI in Ohio, C-10 in California).',
    },
    {
      id: 'licenseScope',
      label: 'License Designation & Business Scope',
      type: 'select',
      defaultValue: 'master_personal',
      options: [
        { label: 'Master Electrician Personal License Only (Qualifies individual as supervisor · 1.00×)', value: 'master_personal', multiplier: 1.0 },
        { label: 'Electrical Contractor Business License (Permit-pulling entity + Surety bond required · 1.85×)', value: 'electrical_contractor', multiplier: 1.85 },
        { label: 'State License Reciprocity Application (Transferring existing license from partner state · 0.65×)', value: 'reciprocity', multiplier: 0.65 },
      ],
      description: 'Contractor licenses require commercial surety bonds, business entity registration, and general liability.',
    },
    {
      id: 'prepCourseScope',
      label: 'Exam Preparation & National Electrical Code (NEC) Books',
      type: 'select',
      defaultValue: 'full_prep_seminar',
      options: [
        { label: 'Complete Prep Seminar + Tabbed NFPA 70 NEC Code Book & Calculations ($850)', value: 'full_prep_seminar', cost: 850 },
        { label: 'Self-Study Software & Practice Exam Simulator ($285)', value: 'self_study_software', cost: 285 },
        { label: 'Direct Exam Challenge (Code book only · No prep school · $145)', value: 'code_book_only', cost: 145 },
      ],
      description: 'Master exams cover complex box-fill formulas, transformer sizing, and commercial motor feeder calculations.',
    },
    {
      id: 'suretyBondRequirement',
      label: 'Contractor Compliance Surety Bond',
      type: 'select',
      defaultValue: 'bond_needed',
      options: [
        { label: 'Requires $10,000 to $25,000 State Electrical Contractor Surety Bond ($185/year)', value: 'bond_needed', cost: 185 },
        { label: 'No Bond Required (Personal Master license only · $0)', value: 'no_bond', cost: 0 },
      ],
      description: 'State boards require surety bonds ensuring compliance with building codes and tax obligations.',
    },
  ],
  calculate: (values) => {
    const stateObj = US_STATES.find((s) => s.code === values.state) || US_STATES[0];

    const prepCosts: Record<string, number> = {
      full_prep_seminar: 850,
      self_study_software: 285,
      code_book_only: 145,
    };
    const prepFee = prepCosts[values.prepCourseScope] || 850;

    const bondFee = values.suretyBondRequirement === 'bond_needed' ? 185 : 0;

    // State Board Application & Computer-Based Testing Fees (PSI / Pearson VUE / Prometric)
    // Application fee ($120–$250) + Trade exam ($85–$140) + Business law exam ($80)
    const stateBoardAppFee = Math.round(180 * (values.licenseScope === 'electrical_contractor' ? 1.6 : 1.0));
    const testingCenterFee = values.licenseScope === 'reciprocity' ? 0 : 165;

    // Initial 2-year license registration fee
    const initialLicenseFee = 220;

    // Biennial Continuing Education Units (CEU) requirement (8 to 16 hours every 2 years ≈ $140 amortized)
    const ceuRenewalBudget = 140;

    const totalInitialInvestment = prepFee + stateBoardAppFee + testingCenterFee + initialLicenseFee + bondFee;

    const low = Math.round(totalInitialInvestment * 0.9);
    const high = Math.round(totalInitialInvestment * 1.15);

    return {
      primaryLabel: `Master Electrician Licensing Investment (${stateObj.name})`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalInitialInvestment,
      frequencyLabel: `initial licensure & first 2-year cycle`,
      breakdown: [
        {
          label: 'NEC Exam Prep Course & Tabbed Code Books',
          amount: prepFee,
          description: `NFPA 70 National Electrical Code book, calculation guides, and master level exam simulators.`,
        },
        {
          label: `State Board Application & Examination Fees (${stateObj.name})`,
          amount: stateBoardAppFee + testingCenterFee,
          description: `State Department of Licensing application fee plus proctored PSI/Pearson VUE trade exam.`,
        },
        {
          label: 'Initial 2-Year Master License Certificate Issuance',
          amount: initialLicenseFee,
          description: `State board credential issuance and entry into state official electrical registry.`,
        },
        ...(bondFee > 0
          ? [
              {
                label: 'State Electrical Contractor Surety Bond',
                amount: bondFee,
                description: `Mandatory compliance surety bond satisfying local municipal building department codes.`,
              },
            ]
          : []),
      ],
      keyDrivers: [
        `Jurisdiction: ${stateObj.name} (${stateObj.code}) Electrical Licensing Board.`,
        `License Scope: ${values.licenseScope.replace('_', ' ').toUpperCase()}.`,
        `Prerequisites: Most states require 8,000 to 12,000 hours (4–6 years) of documented electrical experience.`,
        `Renewal Obligation: Biennial license renewal plus mandatory continuing education on current NEC code updates.`,
      ],
      costReductionTips: [
        'Check state reciprocity agreements: if you already hold a Master license in another state, you may waive the trade examination.',
        'Purchase the official NFPA 70 softbound book with pre-printed index tabs to save valuable minutes during open-book testing.',
        'Bundle contractor general liability with your surety bond through an independent commercial broker to secure package discounts.',
      ],
      benchmarks: [
        { label: 'Initial Investment', value: `$${totalInitialInvestment.toLocaleString()}` },
        { label: 'Biennial Renewal', value: `$${(initialLicenseFee + ceuRenewalBudget).toLocaleString()}/2-yrs` },
        { label: 'Exam Format', value: 'Open Book (NFPA 70)' },
      ],
    };
  },
  explainer: {
    title: 'How Master Electrician License Costs by State Are Calculated',
    paragraphs: [
      'Attaining a Master Electrician license represents the pinnacle of the trade, granting professionals the legal authority to design complex electrical distribution systems, pull commercial building permits, and establish an independent electrical contracting business. Unlike a Journeyman license, which qualifies a technician to perform physical electrical installations under supervision, a Master Electrician assumes full legal and financial responsibility for code compliance.',
      'Licensing standards are governed at the state level (or county level in states like New York, Pennsylvania, and Illinois). Most state licensing boards—such as the Texas Department of Licensing and Regulation (TDLR) or the California Contractors State License Board (CSLB)—require candidates to demonstrate at least 8,000 to 12,000 hours of documented on-the-job electrical experience, typically including at least two to four years as an active licensed Journeyman.',
      'The examination is renowned for its rigor. Administered by authorized computerized testing agencies (such as PSI, Pearson VUE, or Prometric), the open-book examination tests mastery of the National Electrical Code (NFPA 70). Candidates are tested on complex branch circuit voltage drops, motor feeder overload protection, transformer taps, hazardous location Class/Division classifications, and healthcare life-safety systems. Many states also require a separate Business Law and Project Management examination.',
      'For professionals launching an Electrical Contractor business, state boards mandate proof of financial security. This includes purchasing a State Electrical Contractor Surety Bond (typically $10,000 to $25,000 face value, costing $150 to $250 annually) and maintaining minimum Commercial General Liability limits ($500,000 to $1,000,000).',
    ],
    factors: [
      {
        name: 'Personal Master vs. Electrical Contractor Entity',
        impact: 'High (Contractor requires bond & insurance)',
        detail: 'Contractor licenses require state surety bonds, business entity registration, and liability filings.',
      },
      {
        name: 'Prep Seminars & Code Tab Systems',
        impact: 'Moderate ($145 books vs $850 seminar)',
        detail: 'Comprehensive prep schools dramatically increase first-time pass rates on complex calculation questions.',
      },
      {
        name: 'State Reciprocity Fast-Tracking',
        impact: 'Moderate (Waives examination fees)',
        detail: 'Reciprocal state agreements allow transferring credentials without retaking the 4-hour trade test.',
      },
      {
        name: 'Continuing Education Units (CEU)',
        impact: 'Low ($100 to $200 every 2-3 years)',
        detail: 'Mandatory code update courses covering new 3-year NEC triennial revisions.',
      },
    ],
    industryBenchmarkNote:
      'Electricians budget between $1,200 and $1,800 to obtain a Master Electrician license, with biennial renewal and CEU costs averaging $180 to $350 every two years.',
  },
  faqs: [
    {
      question: 'What is the difference between a Journeyman and a Master Electrician?',
      answer:
        'A Journeyman Electrician is certified to install, connect, and troubleshoot electrical systems under general supervision. A Master Electrician has demonstrated advanced knowledge of electrical engineering, load calculations, and building codes; they can design electrical plans, pull municipal permits, and supervise multiple journeymen.',
    },
    {
      question: 'Can I use an older edition of the National Electrical Code for the exam?',
      answer:
        'No. Testing centers test strictly against the specific NEC edition currently adopted by your state licensing board (typically the 2020 or 2023 edition). Using an incorrect code year will result in failing answers on revised calculation tables and article numbering.',
    },
    {
      question: 'What is state licensing reciprocity and how does it work?',
      answer:
        'Reciprocity is an agreement between two states where one state board honors the examination and qualifications of another state. For example, Texas maintains electrical reciprocity with states like Alaska, Arkansas, Idaho, and Wyoming, allowing licensed masters to obtain credentials without retesting.',
    },
    {
      question: 'What is an Electrical Contractor Surety Bond and why is it needed?',
      answer:
        'A contractor surety bond is a financial guarantee required by state licensing boards that protects consumers and municipalities. If an electrical contractor abandons a permitted job or violates local electrical codes, the surety pays the municipality or consumer up to the bond amount to correct the defective work.',
    },
  ],
  relatedCalculatorIds: [
    'industrial-electrician-salary-by-state',
    'manufacturing-overhead-cost-calculator',
    'osha-30-training-cost-calculator',
  ],
};

export const industrialCertRenewalCalc: CalculatorDefinition = {
  id: 'industrial-certification-renewal-cost-calculator',
  slug: 'industrial-certification-renewal-cost-calculator',
  categoryId: 'certification',
  path: '/certification/industrial-certification-renewal-cost-calculator',
  name: 'Industrial Certification Renewal Cost Calculator',
  metaTitle: 'Industrial Certification Renewal Cost Calculator – Compliance Rates',
  metaDescription:
    'Calculate recurring annual industrial certification renewal budgets across your workforce. Model Forklift, HAZWOPER, Rigging, CPR, and Welding continuity.',
  shortDescription:
    'Calculate multi-credential renewal budgets across plant workforces: forklift cards, annual HAZWOPER, NCCCO rigging, CPR/First Aid, and welding continuity.',
  targetAudience:
    'Plant EHS directors, operations VPs, safety coordinators, and training managers managing multi-credential expiration calendars across manufacturing sites.',
  featured: true,
  featuredBadge: 'Workforce Planning',
  iconName: 'Award',
  fields: [
    {
      id: 'forkliftOperators',
      label: 'Forklift & Powered Industrial Truck Operators (3-Year Renewal)',
      type: 'number',
      defaultValue: 12,
      min: 0,
      max: 200,
      step: 1,
      unit: 'operators',
      description: 'OSHA 1910.178 mandates formal practical performance evaluations every 3 years ($45/yr amortized).',
    },
    {
      id: 'hazwoperWorkers',
      label: 'HAZWOPER Chemical / Remediation Workers (Annual Refresher)',
      type: 'number',
      defaultValue: 6,
      min: 0,
      max: 100,
      step: 1,
      unit: 'workers',
      description: 'OSHA 1910.120 mandates an annual 8-hour refresher course every 12 months ($75/yr/worker).',
    },
    {
      id: 'craneRiggingTechs',
      label: 'Certified Crane Operators & Riggers (5-Year NCCCO Cycle)',
      type: 'number',
      defaultValue: 4,
      min: 0,
      max: 50,
      step: 1,
      unit: 'technicians',
      description: 'NCCCO credentials require written recertification exams every 5 years ($180/yr amortized).',
    },
    {
      id: 'firstAidResponders',
      label: 'First Aid / CPR / AED Designated Responders (2-Year Cycle)',
      type: 'number',
      defaultValue: 8,
      min: 0,
      max: 100,
      step: 1,
      unit: 'responders',
      description: 'American Red Cross / AHA cards expire every 24 months ($45/yr amortized).',
    },
    {
      id: 'certifiedWelders',
      label: 'Certified Welders (6-Month Continuity Log + 3-Year Re-test)',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 50,
      step: 1,
      unit: 'welders',
      description: 'AWS / ASME code standards require continuous 6-month log archiving ($110/yr amortized).',
    },
    {
      id: 'trackingSystem',
      label: 'Credential Tracking & Safety Management System',
      type: 'select',
      defaultValue: 'digital_ehs_software',
      options: [
        { label: 'Automated Digital EHS Compliance Software (Automated alerts & wallet badge QR · $1,200/yr)', value: 'digital_ehs_software', cost: 1200 },
        { label: 'Internal In-House Spreadsheet Tracking (Manual HR coordination · $350 admin)', value: 'manual_spreadsheet', cost: 350 },
        { label: 'Turnkey Outsourced Safety Consulting Retainer ($3,600/yr all-inclusive)', value: 'outsourced_retainer', cost: 3600 },
      ],
      description: 'Automated tracking prevents expired credentials from triggering OSHA citations during audits.',
    },
  ],
  calculate: (values) => {
    const forklifts = Number(values.forkliftOperators) || 0;
    const hazwoper = Number(values.hazwoperWorkers) || 0;
    const craneRigging = Number(values.craneRiggingTechs) || 0;
    const firstAid = Number(values.firstAidResponders) || 0;
    const welders = Number(values.certifiedWelders) || 0;

    const totalHeadcount = forklifts + hazwoper + craneRigging + firstAid + welders;

    // Annualized renewal costs per credential type
    // Forklift: $135 every 3 years = $45/yr
    const forkliftAnnual = forklifts * 45;
    // HAZWOPER: $75 every year = $75/yr
    const hazwoperAnnual = hazwoper * 75;
    // Crane / Rigging: $900 recertification every 5 years = $180/yr
    const craneAnnual = craneRigging * 180;
    // First Aid: $90 every 2 years = $45/yr
    const firstAidAnnual = firstAid * 45;
    // Welders: Continuity maintenance & periodic test coupon = $110/yr
    const welderAnnual = welders * 110;

    const trackingCosts: Record<string, number> = {
      digital_ehs_software: 1200,
      manual_spreadsheet: 350,
      outsourced_retainer: 3600,
    };
    const softwareAdminCost = trackingCosts[values.trackingSystem] || 1200;

    const totalAnnualBudget =
      forkliftAnnual + hazwoperAnnual + craneAnnual + firstAidAnnual + welderAnnual + softwareAdminCost;

    const costPerEmployee = totalHeadcount > 0 ? Math.round(totalAnnualBudget / totalHeadcount) : 0;

    const low = Math.round(totalAnnualBudget * 0.9);
    const high = Math.round(totalAnnualBudget * 1.15);

    return {
      primaryLabel: `Total Annual Workforce Certification Renewal Budget`,
      estimatedLow: low,
      estimatedHigh: high,
      pointEstimate: totalAnnualBudget,
      frequencyLabel: `annual recurring budget (${totalHeadcount} certified credentials)`,
      breakdown: [
        {
          label: `Forklift Operator Recertification (${forklifts} Units · 3-Yr Cycle)`,
          amount: forkliftAnnual,
          description: `Triennial OSHA 1910.178 practical evaluation amortized across ${forklifts} drivers ($${forkliftAnnual.toLocaleString()}/yr).`,
        },
        {
          label: `HAZWOPER 8-Hour Refresher Training (${hazwoper} Workers · Annual)`,
          amount: hazwoperAnnual,
          description: `Mandatory annual OSHA 1910.120 8-hour refresher courses ($${hazwoperAnnual.toLocaleString()}/yr).`,
        },
        {
          label: `NCCCO Crane & Rigging Recertification (${craneRigging} Techs · 5-Yr Cycle)`,
          amount: craneAnnual,
          description: `Written recertification exam fees and candidate card renewal amortized ($${craneAnnual.toLocaleString()}/yr).`,
        },
        {
          label: `First Aid / CPR / AED Emergency Team (${firstAid} Workers · 2-Yr Cycle)`,
          amount: firstAidAnnual,
          description: `Biennial American Red Cross / AHA cards amortized ($${firstAidAnnual.toLocaleString()}/yr).`,
        },
        {
          label: `Welder Continuity & Performance Verification (${welders} Welders)`,
          amount: welderAnnual,
          description: `6-month process continuity tracking and periodic ASME/AWS coupon test verification.`,
        },
        {
          label: 'Compliance Software Tracking & Digital Records',
          amount: softwareAdminCost,
          description: `${values.trackingSystem.replace('_', ' ')} management system and expiration badge notifications.`,
        },
      ],
      keyDrivers: [
        `Portfolio Scale: Managing ${totalHeadcount} active certified personnel across plant operations.`,
        `Effective Annual Cost: $${costPerEmployee.toLocaleString()} per certified worker per year.`,
        `OSHA Citation Prevention: Prevents expired worker violations under 29 CFR 1910 ($16,131/violation).`,
        `Staggered Cycles: Balances annual HAZWOPER, 2-year CPR, 3-year forklift, and 5-year NCCCO expirations into predictable cash flow.`,
      ],
      costReductionTips: [
        'Batch forklift recertifications into a single semi-annual workshop rather than paying for individual one-off trainer visits.',
        'Adopt an automated EHS tracking system with 60-day advance email warnings to eliminate expired credential site-access shutdowns.',
        'Train an in-house supervisor to handle CPR and Forklift renewals internally to eliminate recurring vendor tuition.',
      ],
      benchmarks: [
        { label: 'Annual Total', value: `$${totalAnnualBudget.toLocaleString()}/yr` },
        { label: 'Cost / Worker', value: `$${costPerEmployee.toLocaleString()}/yr` },
        { label: 'Monthly Accrual', value: `$${Math.round(totalAnnualBudget / 12).toLocaleString()}/mo` },
      ],
    };
  },
  explainer: {
    title: 'How Workforce Certification Renewal Budgets Are Calculated',
    paragraphs: [
      'Industrial plants operate with an extensive matrix of regulatory, statutory, and contractual employee credentials. Because different regulatory bodies enforce completely different expiration timelines—from annual refreshers to 5-year cycles—managing recertification on an ad-hoc basis creates administrative chaos and severe regulatory exposure.',
      'The legal and commercial consequences of lapsed certifications are severe. If an uncertified forklift operator is involved in an incident, OSHA issues immediate Serious or Willful citations starting at $16,131, and commercial liability insurance carriers may attempt to deny coverage based on policy safety warranties. Furthermore, prime contractors and chemical facility owners routinely scan digital worker badges at the front gate, immediately ejecting contractors with expired HAZWOPER or NCCCO cards.',
      'Our financial model amortizes multi-year recertification obligations into a predictable annual operating budget. Triennial forklift evaluations (every 3 years under OSHA 1910.178) cost roughly $135 every three years ($45/year). In contrast, HAZWOPER requires an 8-hour refresher every single calendar year ($75/year). Rigging and crane credentials (NCCCO) require written exams every 5 years ($180/year amortized), while First Aid/CPR cards expire every 24 months ($45/year).',
      'Deploying an automated digital EHS tracking platform with QR-coded worker badges and automated 60-day and 30-day expiration alerts prevents accidental certificate lapses. It also enables plant managers to batch upcoming renewals into single group training cohorts, saving 20% to 35% on third-party instructor travel fees.',
    ],
    factors: [
      {
        name: 'Staggered Expiration Timelines (1 to 5 Years)',
        impact: 'High (Core cash flow smoothing driver)',
        detail: 'Annual HAZWOPER refreshers occur yearly, while NCCCO crane recertifications occur every 5 years.',
      },
      {
        name: 'In-House Trainers vs. Third-Party Vendors',
        impact: 'High (Save up to 60% on recurring renewals)',
        detail: 'In-house Train-the-Trainer programs eliminate third-party vendor fees for forklift and CPR renewals.',
      },
      {
        name: 'Batch Renewal Scheduling',
        impact: 'Moderate (20-30% group savings)',
        detail: 'Renewing cohorts simultaneously spreads instructor mobilization fees across the workforce.',
      },
      {
        name: 'Automated EHS Credential Software',
        impact: 'Moderate ($350 to $1,500/year)',
        detail: 'Digital tracking eliminates human spreadsheet errors and gate-access work stoppages.',
      },
    ],
    industryBenchmarkNote:
      'Mid-sized manufacturing facilities budget $6,500 to $18,000 annually for recurring workforce safety credential renewals, continuing education units, and compliance record archiving.',
  },
  faqs: [
    {
      question: 'What happens if an employee operates machinery with an expired certification?',
      answer:
        'Operating industrial machinery (such as a forklift or crane) with an expired card is an immediate violation of federal OSHA regulations. During an OSHA inspection, citations start at $16,131 for Serious violations. In the event of an accident, commercial insurance underwriters may dispute liability claims, and facility owners can ban the contractor from the site.',
    },
    {
      question: 'How do we track staggered certification expiration dates efficiently?',
      answer:
        'Facilities should avoid manual spreadsheets, which are prone to human oversight. Modern digital EHS platforms issue QR-coded plastic ID badges to workers and automatically send email alerts to supervisors 60, 30, and 15 days before any credential expires, allowing ample time for scheduling.',
    },
    {
      question: 'Can all recertification courses be done online?',
      answer:
        'It depends on the standard. While 8-hour HAZWOPER refreshers and NCCCO written recertifications can be taken via accredited computer testing, forklift recertifications legally require an in-person workplace practical driving evaluation under OSHA 1910.178.',
    },
    {
      question: 'How does an in-house Train-the-Trainer program reduce renewal costs?',
      answer:
        'By investing $800 to $1,200 once to certify an internal safety lead as a trainer, your plant can conduct unlimited recurring forklift and CPR evaluations in-house for roughly $15 to $25 in wallet card materials, rather than paying $150+ to external consultants for every worker.',
    },
  ],
  relatedCalculatorIds: [
    'forklift-certification-cost-by-state',
    'hazwoper-certification-cost-guide',
    'osha-30-training-cost-calculator',
  ],
};
