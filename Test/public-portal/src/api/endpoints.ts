/**
 * >>> SINGLE PLACE TO ALIGN WITH THE EXISTING BACKEND <<<
 * Change these paths to match the real API. Response-shape differences
 * (field names, wrappers, pagination envelopes) are absorbed in normalizers.ts.
 */
export const endpoints = {
  products: '/products',
  product: (idOrSlug: string) => `/products/${encodeURIComponent(idOrSlug)}`,
  categories: '/categories',
  projects: '/projects',
  project: (idOrSlug: string) => `/projects/${encodeURIComponent(idOrSlug)}`,
  orders: '/orders',
  inquiries: '/inquiries',
} as const;
