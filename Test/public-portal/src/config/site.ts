const env = import.meta.env;

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export const siteConfig = {
  name: clean(env.VITE_BRAND_NAME) || 'Kitrivo',
  tagline: clean(env.VITE_BRAND_TAGLINE) || 'Crafted with precision. Built to last.',
  email: clean(env.VITE_CONTACT_EMAIL),
  phone: clean(env.VITE_CONTACT_PHONE),
  address: clean(env.VITE_CONTACT_ADDRESS),
  socials: [
    { id: 'instagram', label: 'Instagram', url: clean(env.VITE_SOCIAL_INSTAGRAM) },
    { id: 'linkedin', label: 'LinkedIn', url: clean(env.VITE_SOCIAL_LINKEDIN) },
    { id: 'facebook', label: 'Facebook', url: clean(env.VITE_SOCIAL_FACEBOOK) },
    { id: 'x', label: 'X', url: clean(env.VITE_SOCIAL_X) },
    { id: 'youtube', label: 'YouTube', url: clean(env.VITE_SOCIAL_YOUTUBE) },
  ].filter((s) => s.url),
  orderMode: (clean(env.VITE_ORDER_MODE) === 'order' ? 'order' : 'quote') as 'order' | 'quote',
  currency: clean(env.VITE_CURRENCY) || 'INR',
  apiBaseUrl: clean(env.VITE_API_BASE_URL) || '/api',
  assetBaseUrl: clean(env.VITE_ASSET_BASE_URL),
  useMock: Boolean(env.DEV) && clean(env.VITE_USE_MOCK) === 'true',
} as const;

export const isQuoteMode = siteConfig.orderMode === 'quote';
