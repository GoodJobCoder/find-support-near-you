/**
 * SEO utilities for managing meta tags and structured data
 */

interface SEOConfig {
  title?: string;
  description?: string;
  canonical?: string;
  structuredData?: object;
}

export function updateSEOTags(config: SEOConfig) {
  const { title, description, canonical, structuredData } = config;
  
  // Store original values for cleanup
  const cleanup: (() => void)[] = [];

  // Update title
  if (title) {
    const previousTitle = document.title;
    document.title = title;
    cleanup.push(() => { document.title = previousTitle; });
  }

  // Update meta description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    let prevDesc = '';
    
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    } else {
      prevDesc = metaDesc.getAttribute('content') || '';
    }
    
    metaDesc.setAttribute('content', description);
    cleanup.push(() => {
      if (prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    });
  }

  // Update canonical URL
  if (canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    let prevCanonical = '';
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    } else {
      prevCanonical = canonicalLink.getAttribute('href') || '';
    }
    
    canonicalLink.setAttribute('href', canonical);
    cleanup.push(() => {
      if (prevCanonical) {
        canonicalLink.setAttribute('href', prevCanonical);
      }
    });
  }

  // Add structured data
  if (structuredData) {
    const scriptId = `structured-data-${Date.now()}`;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    cleanup.push(() => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    });
  }

  // Return cleanup function
  return () => {
    cleanup.forEach(fn => fn());
  };
}