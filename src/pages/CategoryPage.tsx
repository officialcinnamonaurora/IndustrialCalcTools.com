import React from 'react';
import { CategoryInfo } from '../types';
import { getCalculatorsByCategory } from '../data/calculators';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ArrowRight, Sliders, ShieldCheck, Wrench, AlertTriangle, Award } from 'lucide-react';

interface CategoryPageProps {
  category: CategoryInfo;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category, onNavigate }) => {
  const calculators = getCalculatorsByCategory(category.id);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'insurance':
        return <ShieldCheck className="w-8 h-8 text-amber-500" />;
      case 'equipment-cost':
        return <Wrench className="w-8 h-8 text-amber-500" />;
      case 'compliance':
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'certification':
        return <Award className="w-8 h-8 text-amber-500" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb nav */}
      <Breadcrumbs
        items={[{ label: category.name, isCurrent: true }]}
        onNavigate={onNavigate}
      />

      {/* Category Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(category.id)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <span>Industrial Division</span>
              <span aria-hidden="true">·</span>
              <span>{calculators.length} Interactive Tools</span>
              <span aria-hidden="true">·</span>
              <span>{category.primaryMetric}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Category Calculators List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Available {category.name}
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Showing {calculators.length} Models
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <div
              key={calc.id}
              onClick={() => onNavigate(calc.path)}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <span className="uppercase">{category.id}</span>
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

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>{calc.fields.length} Input Variables</span>
                  </div>
                  <p className="line-clamp-1 italic text-slate-500">
                    Audience: {calc.targetAudience}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-600">
                <span>Start Calculation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Division Explanatory Notes */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Underwriting & Regulatory Methodology Note
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Calculations in the {category.name} module are calibrated against standard commercial insurance actuarial tables, federal statutory penalty maximums, and equipment accounting practices. Results are generated completely in-memory on your device without transmitting proprietary company figures over the network.
        </p>
      </div>
    </div>
  );
};
