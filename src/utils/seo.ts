export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, any>[];
}

export function updateMetaTags(config: SeoConfig) {
  // 1. Update Title
  document.title = config.title;

  // 2. Helper to set or create meta tag
  const setMeta = (attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Standard Description
  setMeta('name', 'description', config.description);

  // 4. OpenGraph
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:type', config.type || 'website');
  const fullUrl = window.location.origin + config.canonicalPath;
  setMeta('property', 'og:url', fullUrl);
  setMeta('property', 'og:site_name', 'IndustrialCalcTools');

  // 5. Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);

  // 6. Canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // 7. Structured Data (JSON-LD)
  // Remove prior dynamic scripts
  document.querySelectorAll('script[data-dynamic-seo="true"]').forEach((s) => s.remove());

  if (config.structuredData && config.structuredData.length > 0) {
    config.structuredData.forEach((schemaObj) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-seo', 'true');
      script.textContent = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }
}
