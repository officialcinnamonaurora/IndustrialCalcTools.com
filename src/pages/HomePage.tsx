import React, { useState } from 'react';
import { CATEGORY_LIST, CATEGORIES } from '../data/categories';
import { ALL_CALCULATORS } from '../data/calculators';
import {
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<'featured' | 'all' | 'insurance' | 'equipment-cost' | 'compliance' | 'certification'>('featured');

  // Curated 12-tool premier benchmark mix across all 4 categories (3 per division)
  const curatedFeaturedIds = [
    // Insurance
    'manufacturing-plant-insurance-calculator',
    'industrial-property-insurance-calculator',
    'product-liability-insurance-calculator-manufacturers',
    // Equipment Cost
    'crane-rental-cost-estimator',
    'industrial-pump-selection-cost-guide',
    'air-compressor-rental-cost-calculator',
    // Compliance
    'osha-fine-calculator',
    'industrial-air-quality-permit-cost-by-state',
    'epa-hazardous-waste-compliance-cost-calculator',
    // Certification & Workforce
    'crane-operator-certification-cost-by-state',
    'forklift-certification-cost-by-state',
    'osha-30-training-cost-calculator',
  ];

  const filteredCalculators =
    selectedFilter === 'featured'
      ? ALL_CALCULATORS.filter((c) => curatedFeaturedIds.includes(c.id))
      : selectedFilter === 'all'
      ? ALL_CALCULATORS
      : ALL_CALCULATORS.filter((c) => c.categoryId === selectedFilter);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'insurance':
        return <ShieldCheck className="w-6 h-6 text-amber-500" />;
      case 'equipment-cost':
        return <Wrench className="w-6 h-6 text-amber-500" />;
      case 'compliance':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'certification':
        return <Award className="w-6 h-6 text-amber-500" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-16 sm:py-20 relative overflow-hidden">
        {/* Subtle industrial blueprint grid background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Unboxed metadata line with typographic separator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-3">
              <span>Industrial Cost Engineering</span>
              <span aria-hidden="true">·</span>
              <span>100% Client-Side Free Tools</span>
              <span aria-hidden="true">·</span>
              <span>Updated for 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
              Free Industrial Calculators for Insurance, Equipment, Compliance & Certification
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Instant, actuarially and regulatory-grounded estimation models for plant managers, CFOs, EHS directors, and manufacturing estimators. No sign-up, no hidden fees, and zero external API dependencies.
            </p>

            {/* Quick jump highlights representing all 4 categories */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/insurance/manufacturing-plant-insurance-calculator')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Plant Insurance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('/equipment-cost/crane-rental-cost-estimator')}
                className="bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Crane Rental</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => onNavigate('/compliance/osha-fine-calculator')}
                className="bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>OSHA Fines</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => onNavigate('/certification/forklift-certification-cost-by-state')}
                className="bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Forklift Cert by State</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 Category Cards Linking to Category Pages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Industrial Calculator Hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select an industrial operational domain to explore specialized estimation models
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">4 Core Divisions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_LIST.map((cat) => {
            const count = ALL_CALCULATORS.filter((c) => c.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate(cat.path)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mb-1">
                    <span>{count} Calculators</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-semibold">{cat.primaryMetric}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-amber-600">
                  <span>Browse Category</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Grid of Featured / Popular Calculators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>Interactive Decision Engines</span>
              <span aria-hidden="true">·</span>
              <span>Client-Side Estimators</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured & Popular Industrial Calculators
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedFilter('featured')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'featured'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured Mix (12)
            </button>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tools ({ALL_CALCULATORS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('insurance')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'insurance'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Insurance
            </button>
            <button
              onClick={() => setSelectedFilter('equipment-cost')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'equipment-cost'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Equipment
            </button>
            <button
              onClick={() => setSelectedFilter('compliance')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'compliance'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setSelectedFilter('certification')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'certification'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Certification
            </button>
          </div>
        </div>

        {/* Calculators Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calc) => {
            const cat = CATEGORIES[calc.categoryId];
            return (
              <div
                key={calc.id}
                onClick={() => onNavigate(calc.path)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span className="font-semibold text-slate-700">{cat.name.replace(' Calculators', '')}</span>
                    {calc.featuredBadge && (
                      <span className="text-amber-600 font-bold">{calc.featuredBadge}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {calc.name}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {calc.shortDescription}
                  </p>

                  {/* Input parameters count & target */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{calc.fields.length} Configurable Factors</span>
                    <span>State Multipliers Supported</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-600">
                  <span>Open Interactive Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Industry Methodology & Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              Why Transparent Industrial Benchmarks Matter
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Commercial insurance quotes and regulatory compliance exposures are frequently shrouded in opaque underwriting spreadsheets. IndustrialCalcTools pulls standard industry formulas—including ISO COPE property factors, OSHA Chapter 6 FOM discount schedules, EPA permit models, and IAF MD 5 auditor tables—directly into your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Harvested</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                All math executes client-side in your local browser JavaScript engine. No facility financials or payroll data leave your machine.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Realistic Sensitivities</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Models adjust dynamically for state risk environments, sprinkler densities, employee size tiers, and machine utilization shifts.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                <span>Clear Itemized Breakdown</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Never settle for a single lump sum. View line-item costs for property, liability, inland marine, and surveillance audits.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
