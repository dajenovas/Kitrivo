import { siteConfig } from '@/config/site';

const prefix = (): string =>
  siteConfig.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'ORD';

/** Unique, human-friendly reference: PFX-YYMMDD-XXXXXX. Sent with the order so the backend can keep it. */
export const generateOrderReference = (): string => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').toUpperCase().slice(0, 6);
  return `${prefix()}-${ymd}-${rand}`;
};
