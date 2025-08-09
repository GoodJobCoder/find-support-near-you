import { useEffect } from 'react';
import { updateSEOTags } from '@/utils/seo';

interface SEOConfig {
  title?: string;
  description?: string;
  canonical?: string;
  structuredData?: object;
}

/**
 * Hook to manage SEO meta tags and structured data
 * Automatically cleans up on component unmount
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const cleanup = updateSEOTags(config);
    return cleanup;
  }, [config.title, config.description, config.canonical, config.structuredData]);
}