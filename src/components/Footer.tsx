import React from 'react';
import { Calculator, ShieldAlert, FileText, ExternalLink } from 'lucide-react';
import { CATEGORY_LIST } from '../data/categories';
import { ALL_CALCULATORS } from '../data/calculators';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-16">
      {/* Disclaimer Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3.5 text-slate-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Important Professional Advisory Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              The calculations, benchmarks, and financial projections provided across IndustrialCalcTools are intended strictly for preliminary budgeting and general informational purposes. They do not constitute formal insurance underwriting, binding quotes, legal counsel, or certified regulatory compliance advisory. Actual insurance premiums, statutory penalties, and equipment costs depend on physical surveys, formal loss histories, specific state jurisdictions, and official agency decisions. Always consult licensed commercial insurance brokers, certified safety professionals (CSP), or legal counsel for official determinations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                Industrial<span className="text-amber-400">Calc</span>Tools
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-calculator hub delivering transparent, industry-standard cost models for plant insurance, equipment budgeting, OSHA compliance, and ISO certifications.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              No registration · No paywalls · 100% Client-side
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Calculator Hubs
            </h4>
            <ul className="space-y-2">
              {CATEGORY_LIST.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(cat.path)}
                    className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Calculators Col */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Core Calculators
            </h4>
            <ul className="space-y-2">
              {ALL_CALCULATORS.slice(0, 5).map((calc) => (
                <li key={calc.id}>
                  <button
                    onClick={() => onNavigate(calc.path)}
                    className="hover:text-amber-400 transition-colors text-left truncate max-w-full block cursor-pointer"
                    title={calc.name}
                  >
                    {calc.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & SEO Col */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Standards & Data
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-400">OSHA 29 CFR 1910 Standards</span>
              </li>
              <li>
                <span className="text-slate-400">EPA 40 CFR Environmental Rules</span>
              </li>
              <li>
                <span className="text-slate-400">ISO/IEC 17021 / IAF MD 5 Tables</span>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sitemap (sitemap.xml)</span>
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Robots.txt</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} IndustrialCalcTools. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Fast, privacy-friendly static execution</span>
            <span>·</span>
            <span>Version 2.4 Industrial Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
