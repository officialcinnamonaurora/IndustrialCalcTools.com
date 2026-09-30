import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { CalculatorTemplate } from './components/CalculatorTemplate';
import { CATEGORIES } from './data/categories';
import { ALL_CALCULATORS, getCalculatorBySlug } from './data/calculators';
import { updateMetaTags } from './utils/seo';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Navigate handler that pushes to history
  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept click on links with relative paths
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.getAttribute('download') &&
        target.target !== '_blank' &&
        !target.getAttribute('rel')?.includes('external')
      ) {
        const path = target.pathname + target.search;
        if (
          !path.endsWith('.xml') &&
          !path.endsWith('.txt') &&
          !path.endsWith('.json')
        ) {
          e.preventDefault();
          navigate(path);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [currentPath]);

  // Route resolution
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';

  // Check if Home
  const isHome = normalizedPath === '/' || normalizedPath === '';

  // Check if Category Page
  let matchingCategoryKey = Object.keys(CATEGORIES).find((catKey) => {
    const catPath = CATEGORIES[catKey].path.replace(/\/+$/, '');
    return normalizedPath === catPath;
  });

  const matchingCategory = matchingCategoryKey ? CATEGORIES[matchingCategoryKey] : undefined;

  // Check if Calculator Page
  const matchingCalculator = getCalculatorBySlug(normalizedPath);

  // Sync SEO metadata whenever route updates
  useEffect(() => {
    if (isHome) {
      updateMetaTags({
        title: 'IndustrialCalcTools – Free Industrial Calculators for Insurance, Equipment, Compliance & Certification',
        description:
          'Free industrial calculators for manufacturing plant insurance, forklift and warehouse coverage, OSHA fines, EPA compliance, equipment costs, and certifications.',
        canonicalPath: '/',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'IndustrialCalcTools',
            url: window.location.origin,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'All',
            description:
              'Free multi-calculator hub for industrial manufacturing plant insurance, forklift coverage, OSHA statutory penalties, EPA environmental budgets, and equipment depreciation.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        ],
      });
    } else if (matchingCalculator) {
      const category = CATEGORIES[matchingCalculator.categoryId];
      updateMetaTags({
        title: `${matchingCalculator.metaTitle} | IndustrialCalcTools`,
        description: matchingCalculator.metaDescription,
        canonicalPath: matchingCalculator.path,
        type: 'article',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: matchingCalculator.name,
            url: window.location.origin + matchingCalculator.path,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'All',
            description: matchingCalculator.metaDescription,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: window.location.origin + '/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: window.location.origin + category.path,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: matchingCalculator.name,
                item: window.location.origin + matchingCalculator.path,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: matchingCalculator.faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          },
        ],
      });
    } else if (matchingCategory) {
      updateMetaTags({
        title: `${matchingCategory.metaTitle} | IndustrialCalcTools`,
        description: matchingCategory.metaDescription,
        canonicalPath: matchingCategory.path,
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: matchingCategory.name,
            url: window.location.origin + matchingCategory.path,
            description: matchingCategory.metaDescription,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: window.location.origin + '/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: matchingCategory.name,
                item: window.location.origin + matchingCategory.path,
              },
            ],
          },
        ],
      });
    } else {
      updateMetaTags({
        title: 'Page Not Found | IndustrialCalcTools',
        description: 'The requested industrial calculator or division was not found.',
        canonicalPath: currentPath,
      });
    }
  }, [currentPath, isHome, matchingCalculator, matchingCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">
        {isHome && <HomePage onNavigate={navigate} />}

        {matchingCategory && !matchingCalculator && (
          <CategoryPage category={matchingCategory} onNavigate={navigate} />
        )}

        {matchingCalculator && (
          <CalculatorTemplate calculator={matchingCalculator} onNavigate={navigate} />
        )}

        {!isHome && !matchingCategory && !matchingCalculator && (
          <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Calculator Not Found
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We couldn't locate a calculator matching "{currentPath}". It may have moved or been updated in our 2026 directory.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to All Calculators Hub</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
