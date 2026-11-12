import type { Availability, Product } from '@/types';

export const defaultOptions = (p: Product): Record<string, string> =>
  Object.fromEntries(p.variants.map((v) => [v.name, v.options[0]]));

export const availabilityLabel: Record<Availability, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  made_to_order: 'Made to order',
  unknown: 'Ask for availability',
};

export const isOrderable = (p: Product) => p.availability !== 'out_of_stock';
