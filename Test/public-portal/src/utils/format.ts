import { siteConfig } from '@/config/site';

export const formatPrice = (value: number, currency: string = siteConfig.currency): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
};

export const formatMonthYear = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

export const slugify = (v: string): string =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const truncate = (v: string, max: number): string =>
  v.length <= max ? v : `${v.slice(0, max - 1).trimEnd()}…`;
