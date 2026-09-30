import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (href: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-1">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
        <li className="flex items-center">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
            title="IndustrialCalcTools Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {isLast || !item.href ? (
                <span className="text-slate-900 font-semibold truncate max-w-[240px] sm:max-w-md" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(item.href!)}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
