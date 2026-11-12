import { siteConfig } from '@/config/site';
import type { Category, InquiryRequest, OrderRequest, Product, Project } from '@/types';
import { generateOrderReference } from '@/utils/orderRef';
import { http } from './http';
import { endpoints } from './endpoints';
import {
  isPublished,
  normalizeCategory,
  normalizeProduct,
  normalizeProject,
  toList,
  toRecord,
} from './normalizers';

/* ---------- tiny in-memory GET cache (smooth navigation, fewer requests) ---------- */
const TTL = 60_000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();
const cached = <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as Promise<T>;
  const value = load().catch((e) => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, { at: Date.now(), value });
  return value;
};

const loadMock = () =>
  import.meta.env.DEV ? import('./mock/mockData') : Promise.reject(new Error('Mock data is only available in development.'));

const compact = <T>(xs: (T | null)[]): T[] => xs.filter((x): x is T => x !== null);

/* ---------- reads (public, published content only) ---------- */
export const fetchProducts = (): Promise<Product[]> =>
  cached('products', async () => {
    if (siteConfig.useMock) return (await loadMock()).mockProducts;
    const { data } = await http.get(endpoints.products);
    return compact(toList(data).filter(isPublished).map(normalizeProduct));
  });

export const fetchProduct = async (idOrSlug: string): Promise<Product | null> => {
  const key = decodeURIComponent(idOrSlug);
  // Resolve from the already-loaded list first (instant), then fall back to the detail endpoint.
  try {
    const all = await fetchProducts();
    const found = all.find((p) => p.slug === key || p.id === key);
    if (found) return found;
  } catch {
    /* fall through to detail endpoint */
  }
  if (siteConfig.useMock) return null;
  return cached(`product:${key}`, async () => {
    const { data } = await http.get(endpoints.product(key));
    const raw = toRecord(data);
    return raw && isPublished(raw) ? normalizeProduct(raw) : null;
  });
};

export const fetchCategories = (): Promise<Category[]> =>
  cached('categories', async () => {
    if (siteConfig.useMock) return (await loadMock()).mockCategories;
    try {
      const { data } = await http.get(endpoints.categories);
      const list = compact(toList(data).filter(isPublished).map(normalizeCategory));
      if (list.length) return list;
    } catch {
      /* derive from products below */
    }
    const products = await fetchProducts();
    const map = new Map<string, Category>();
    products.forEach((p) => p.category && map.set(p.category.id, p.category));
    return Array.from(map.values());
  });

export const fetchProjects = (): Promise<Project[]> =>
  cached('projects', async () => {
    if (siteConfig.useMock) return (await loadMock()).mockProjects;
    const { data } = await http.get(endpoints.projects);
    return compact(toList(data).filter(isPublished).map(normalizeProject));
  });

export const fetchProject = async (idOrSlug: string): Promise<Project | null> => {
  const key = decodeURIComponent(idOrSlug);
  try {
    const all = await fetchProjects();
    const found = all.find((p) => p.slug === key || p.id === key);
    if (found) return found;
  } catch {
    /* fall through */
  }
  if (siteConfig.useMock) return null;
  return cached(`project:${key}`, async () => {
    const { data } = await http.get(endpoints.project(key));
    const raw = toRecord(data);
    return raw && isPublished(raw) ? normalizeProject(raw) : null;
  });
};

/* ---------- writes (public submissions only; no payment handling) ---------- */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const submitOrder = async (order: OrderRequest): Promise<{ reference: string }> => {
  if (siteConfig.useMock) {
    await wait(700);
    return { reference: order.reference };
  }
  const { data } = await http.post(endpoints.orders, order);
  const raw = toRecord(data);
  const ref = raw && (raw.reference ?? raw.orderNumber ?? raw.order_number ?? raw.orderId ?? raw.order_id ?? raw.id);
  return { reference: typeof ref === 'string' || typeof ref === 'number' ? String(ref) : order.reference };
};

export const submitInquiry = async (inquiry: InquiryRequest): Promise<{ reference: string }> => {
  const reference = generateOrderReference().replace(/^[A-Z]+/, 'INQ');
  if (siteConfig.useMock) {
    await wait(600);
    return { reference };
  }
  await http.post(endpoints.inquiries, { ...inquiry, reference });
  return { reference };
};
