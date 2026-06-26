import { useEffect } from 'react';
import siteConfig from '../config/siteConfig';

export function useSEO({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  structuredData
} = {}) {
  useEffect(() => {
    const finalTitle = title ? `${title} | ${siteConfig.shortName}` : siteConfig.seo.defaultTitle;
    document.title = finalTitle;

    const setMeta = (name, property, content) => {
      if (!content) return;
      let selector = '';
      if (name) selector = `meta[name="${name}"]`;
      if (property) selector = `meta[property="${property}"]`;
      
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (name) el.setAttribute('name', name);
        if (property) el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', null, description || siteConfig.seo.defaultDescription);
    setMeta('keywords', null, keywords || siteConfig.seo.defaultKeywords);
    
    setMeta(null, 'og:title', title || siteConfig.companyName);
    setMeta(null, 'og:description', description || siteConfig.seo.defaultDescription);
    setMeta(null, 'og:image', ogImage || siteConfig.seo.defaultOgImage);
    setMeta(null, 'og:url', ogUrl || siteConfig.seo.siteUrl);
    setMeta(null, 'og:type', 'website');

    setMeta('twitter:card', null, 'summary_large_image');
    setMeta('twitter:title', null, title || siteConfig.companyName);
    setMeta('twitter:description', null, description || siteConfig.seo.defaultDescription);
    setMeta('twitter:image', null, ogImage || siteConfig.seo.defaultOgImage);

    // JSON-LD structured data script
    let scriptEl = document.getElementById('jsonld-seo');
    if (scriptEl) {
      scriptEl.remove();
    }

    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': siteConfig.companyName,
      'url': siteConfig.seo.siteUrl,
      'logo': `${siteConfig.seo.siteUrl}/favicon.svg`,
      'description': siteConfig.description,
      'sameAs': Object.values(siteConfig.socials).filter(Boolean)
    };

    const finalStructuredData = structuredData || defaultStructuredData;

    scriptEl = document.createElement('script');
    scriptEl.id = 'jsonld-seo';
    scriptEl.type = 'application/ld+json';
    scriptEl.innerHTML = JSON.stringify(finalStructuredData);
    document.head.appendChild(scriptEl);

    return () => {
      const scriptToRemove = document.getElementById('jsonld-seo');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, ogImage, ogUrl, structuredData]);
}

export default useSEO;
