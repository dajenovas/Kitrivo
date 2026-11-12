import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

interface Seo {
  title?: string;
  description?: string;
  image?: string | null;
  jsonLd?: Record<string, unknown> | null;
}

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/** Per-page title / description / Open Graph / JSON-LD. */
export function useSeo({ title, description, image, jsonLd }: Seo) {
  const jsonKey = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const full = title ? `${title} · ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
    document.title = full;
    const desc = description ?? siteConfig.tagline;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteConfig.name);
    if (image && !image.startsWith('data:')) setMeta('meta[property="og:image"]', 'property', 'og:image', image);

    let script: HTMLScriptElement | null = null;
    if (jsonKey) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = jsonKey;
      document.head.appendChild(script);
    }
    return () => {
      script?.remove();
    };
  }, [title, description, image, jsonKey]);
}
