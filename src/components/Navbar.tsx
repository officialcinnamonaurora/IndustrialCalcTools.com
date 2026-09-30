import React, { useState } from 'react';
import { Search, Calculator, Menu, X, ShieldCheck, Wrench, AlertTriangle, Award, ArrowRight } from 'lucide-react';
import { CATEGORY_LIST } from '../data/categories';
import { ALL_CALCULATORS } from '../data/calculators';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalcs = searchQuery.trim()
    ? ALL_CALCULATORS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLinkClick('/')}
                className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              >
                <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm group-hover:bg-amber-400 transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                    Industrial<span className="text-amber-400">Calc</span>Tools
                  </span>
                  <span className="hidden sm:block text-[11px] text-slate-400 leading-none">
                    Cost & Compliance Benchmarks
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => handleLinkClick('/insurance/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentPath.startsWith('/insurance')
                    ? 'text-amber-400 bg-slate-800/80 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Insurance
              </button>
              <button
                onClick={() => handleLinkClick('/equipment-cost/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentPath.startsWith('/equipment-cost')
                    ? 'text-amber-400 bg-slate-800/80 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Equipment Cost
              </button>
              <button
                onClick={() => handleLinkClick('/compliance/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentPath.startsWith('/compliance')
                    ? 'text-amber-400 bg-slate-800/80 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Compliance
              </button>
              <button
                onClick={() => handleLinkClick('/certification/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentPath.startsWith('/certification')
                    ? 'text-amber-400 bg-slate-800/80 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Certification
              </button>
            </nav>

            {/* Actions: Search & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-750 hover:text-white transition-colors cursor-pointer"
                title="Search calculators"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Search calculators...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded border border-slate-700">
                  Ctrl+K
                </kbd>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => handleLinkClick('/')}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              All Hub Calculators
            </button>
            {CATEGORY_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleLinkClick(cat.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  currentPath.startsWith(cat.path)
                    ? 'text-amber-400 bg-slate-850 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search calculators (e.g., OSHA, plant insurance, forklift, CNC, EPA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-4 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-2">Popular Calculators:</p>
                  <div className="space-y-1">
                    {ALL_CALCULATORS.slice(0, 5).map((calc) => (
                      <button
                        key={calc.id}
                        onClick={() => handleLinkClick(calc.path)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-slate-200 text-xs flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                          {calc.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredCalcs.length > 0 ? (
                <div className="space-y-1">
                  {filteredCalcs.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => handleLinkClick(calc.path)}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-800 text-slate-200 text-xs flex flex-col gap-1 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          {calc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                          {calc.categoryId}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">
                        {calc.shortDescription}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">
                  No calculators found matching "{searchQuery}".
                </div>
              )}
            </div>

            <div className="p-2 bg-slate-950/60 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press ESC to close</span>
              <span>10 Free Industrial Calculators</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
