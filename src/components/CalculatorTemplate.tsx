import React, { useState, useMemo, useEffect } from 'react';
import {
  CalculatorDefinition,
  CalculationResult,
} from '../types';
import { CATEGORIES } from '../data/categories';
import { getRelatedCalculators } from '../data/calculators';
import { Breadcrumbs } from './Breadcrumbs';
import {
  Calculator as CalcIcon,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface CalculatorTemplateProps {
  calculator: CalculatorDefinition;
  onNavigate: (path: string) => void;
}

export const CalculatorTemplate: React.FC<CalculatorTemplateProps> = ({
  calculator,
  onNavigate,
}) => {
  // Initialize form state from default values
  const initialFormValues = useMemo(() => {
    const init: Record<string, any> = {};
    calculator.fields.forEach((field) => {
      init[field.id] = field.defaultValue;
    });
    return init;
  }, [calculator]);

  const [formValues, setFormValues] = useState<Record<string, any>>(initialFormValues);
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(() =>
    calculator.calculate(initialFormValues)
  );
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Re-initialize if calculator changes
  useEffect(() => {
    setFormValues(initialFormValues);
    setCalculationResult(calculator.calculate(initialFormValues));
    setActiveFaq(null);
    setCopied(false);
  }, [calculator, initialFormValues]);

  const category = CATEGORIES[calculator.categoryId];
  const relatedCalculators = useMemo(() => getRelatedCalculators(calculator), [calculator]);

  // Handle field change
  const handleFieldChange = (id: string, value: any) => {
    const updated = { ...formValues, [id]: value };
    setFormValues(updated);
    // Real-time calculation update
    setCalculationResult(calculator.calculate(updated));
  };

  const handleReset = () => {
    setFormValues(initialFormValues);
    setCalculationResult(calculator.calculate(initialFormValues));
  };

  const handleManualCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculationResult(calculator.calculate(formValues));
  };

  const handleCopySummary = () => {
    const summaryText = `[IndustrialCalcTools] ${calculator.name} Estimate:
Point Estimate: $${calculationResult.pointEstimate.toLocaleString()} (${calculationResult.frequencyLabel})
Range: $${calculationResult.estimatedLow.toLocaleString()} – $${calculationResult.estimatedHigh.toLocaleString()}
Breakdown:
${calculationResult.breakdown.map((b) => `- ${b.label}: $${b.amount.toLocaleString()}`).join('\n')}
Calculated at: ${window.location.href}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Breadcrumb nav */}
      <Breadcrumbs
        items={[
          { label: category.name, href: category.path },
          { label: calculator.name, isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* 2. Page Title + Short Intro Paragraph */}
      <div className="mt-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>{category.name}</span>
          <span aria-hidden="true">·</span>
          <span>Industrial Standard Benchmark</span>
          {calculator.featuredBadge && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 font-bold">{calculator.featuredBadge}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {calculator.name}
        </h1>

        <p className="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed">
          {calculator.shortDescription}
        </p>

        {/* Target Audience Note */}
        <div className="mt-3.5 flex items-start gap-2 text-xs text-slate-500 bg-slate-100/80 p-3 rounded-lg border border-slate-200/80 max-w-3xl">
          <Info className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 font-medium">Who this is for: </strong>
            <span>{calculator.targetAudience}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Calculator Grid (Inputs Column + Result Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
        {/* Form Inputs (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Input Parameters</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset parameters to industry defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <form onSubmit={handleManualCalculate} className="space-y-5">
            {calculator.fields.map((field) => {
              const value = formValues[field.id] ?? field.defaultValue;

              return (
                <div key={field.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={field.id}
                      className="block text-xs font-semibold text-slate-800"
                    >
                      {field.label}
                    </label>
                    {field.unit && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {field.unit}
                      </span>
                    )}
                  </div>

                  {/* Field description / underwriting note */}
                  {field.description && (
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {field.description}
                    </p>
                  )}

                  {/* Input Rendering */}
                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-medium cursor-pointer"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === 'slider' ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-800">
                        <span>{field.min} {field.unit}</span>
                        <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {value} {field.unit}
                        </span>
                        <span>{field.max} {field.unit}</span>
                      </div>
                      <input
                        type="range"
                        id={field.id}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-md">
                      <input
                        type="number"
                        id={field.id}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-mono font-medium"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Calculate Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-lg shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalcIcon className="w-4 h-4" />
                <span>Calculate & Recalibrate Estimate</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Column (5 cols on desktop, sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 overflow-hidden">
            {/* Top result header */}
            <div className="p-6 border-b border-slate-800 bg-linear-to-b from-slate-850 to-slate-900">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                <span>{calculationResult.primaryLabel}</span>
                <span className="text-[11px] font-mono text-amber-400">Live Estimate</span>
              </div>

              {/* Big primary number */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  ${calculationResult.pointEstimate.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {calculationResult.frequencyLabel}
                </span>
              </div>

              {/* Range representation */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <span>Underwriting Range:</span>
                <span className="font-mono text-amber-300 font-medium">
                  ${calculationResult.estimatedLow.toLocaleString()} – ${calculationResult.estimatedHigh.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Itemized Line-Item Breakdown Table */}
            <div className="p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Itemized Cost Component Breakdown
              </h3>

              <div className="space-y-3">
                {calculationResult.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
                      <span>{item.label}</span>
                      <span className="font-mono text-amber-400">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Benchmark Quick Stats */}
              {calculationResult.benchmarks && calculationResult.benchmarks.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {calculationResult.benchmarks.map((b, i) => (
                      <div key={i} className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">{b.label}</span>
                        <span className="text-xs font-bold text-slate-200 font-mono mt-0.5 block">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy / Export Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Estimate Summary Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Estimate Summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Key Cost Drivers & Actionable Levers */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Cost Optimization Recommendations</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {calculationResult.costReductionTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Below Calculator: 300-400 Word Explainer Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-12 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4">
          {calculator.explainer.title}
        </h2>

        <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4 leading-relaxed">
          {calculator.explainer.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Cost Factors Table */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Critical Underwriting & Regulatory Cost Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculator.explainer.factors.map((factor, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-900">{factor.name}</h4>
                  <span className="text-[11px] font-mono text-amber-700 font-semibold">{factor.impact}</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">{factor.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Note */}
        <div className="mt-6 p-4 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="text-slate-900">Industry Standard Benchmark: </strong>
            {calculator.explainer.industryBenchmarkNote}
          </p>
        </div>
      </section>

      {/* 5. FAQ Section (3-4 domain questions) */}
      <section className="mb-14">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Common Questions on {calculator.name.replace(' Calculator', '')}
          </h2>
        </div>

        <div className="space-y-3">
          {calculator.faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. "Related Calculators" section at bottom (3 calculators in same category) */}
      <section className="pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Related Industrial Calculators
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore complementary tools in the {category.name} collection
            </p>
          </div>
          <button
            onClick={() => onNavigate(category.path)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View all in {category.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedCalculators.map((rel) => (
            <div
              key={rel.id}
              onClick={() => onNavigate(rel.path)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  <span>{CATEGORIES[rel.categoryId].name.replace(' Calculators', '')}</span>
                  {rel.featured && <span className="text-amber-600 font-semibold">Featured</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                  {rel.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {rel.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-amber-600">
                <span>Launch Calculator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
