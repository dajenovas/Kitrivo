import { siteConfig } from '@/config/site';
import { slugify, truncate } from '@/utils/format';
import type {
  Availability,
  Category,
  Product,
  Project,
  SpecItem,
  VariantGroup,
} from '@/types';

/**
 * Tolerant mappers: accept the common field-name variants and list envelopes
 * (plain array, { data }, { items }, { results }, Spring-style { content }).
 * If your backend uses other names, add them to the key lists below.
 */
type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

const pick = (raw: Raw, keys: string[]): unknown => {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

const num = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const truthy = (v: unknown): boolean =>
  v === true || v === 1 || v === '1' || (typeof v === 'string' && ['true', 'yes'].includes(v.toLowerCase()));

export const toList = (payload: unknown): Raw[] => {
  if (Array.isArray(payload)) return payload.filter(isObj);
  if (isObj(payload)) {
    for (const k of ['data', 'items', 'results', 'content', 'rows', 'records']) {
      const v = payload[k];
      if (Array.isArray(v)) return v.filter(isObj);
      if (isObj(v)) {
        const nested = toList(v);
        if (nested.length) return nested;
      }
    }
  }
  return [];
};

export const toRecord = (payload: unknown): Raw | null => {
  if (!isObj(payload)) return null;
  for (const k of ['data', 'item', 'result']) {
    if (isObj(payload[k])) return payload[k] as Raw;
  }
  return payload;
};

export const resolveAsset = (url: string): string => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = siteConfig.assetBaseUrl || (/^https?:\/\//i.test(siteConfig.apiBaseUrl) ? new URL(siteConfig.apiBaseUrl).origin : '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const toImages = (raw: Raw): string[] => {
  const out: string[] = [];
  const push = (v: unknown) => {
    const s = isObj(v) ? str(pick(v, ['url', 'src', 'path', 'image_url', 'imageUrl'])) : str(v);
    if (s) out.push(resolveAsset(s));
  };
  const list = pick(raw, ['images', 'gallery', 'photos', 'media']);
  if (Array.isArray(list)) list.forEach(push);
  ['image', 'imageUrl', 'image_url', 'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'cover', 'coverImage', 'cover_image'].forEach((k) => {
    if (raw[k]) push(raw[k]);
  });
  return Array.from(new Set(out));
};

const toCategory = (raw: Raw): Category | null => {
  const c = pick(raw, ['category', 'categoryName', 'category_name', 'type']);
  if (isObj(c)) {
    const name = str(pick(c, ['name', 'title', 'label']));
    if (!name) return null;
    return { id: str(pick(c, ['id', '_id', 'categoryId'])) || slugify(name), name, slug: str(c.slug) || slugify(name) };
  }
  const name = str(c);
  if (!name) return null;
  const id = str(pick(raw, ['categoryId', 'category_id'])) || slugify(name);
  return { id, name, slug: slugify(name) };
};

const toSpecs = (v: unknown): SpecItem[] => {
  if (Array.isArray(v)) {
    return v
      .map((s): SpecItem | null => {
        if (!isObj(s)) return null;
        const label = str(pick(s, ['label', 'name', 'key', 'title']));
        const value = str(pick(s, ['value', 'val', 'description']));
        return label && value ? { label, value } : null;
      })
      .filter((s): s is SpecItem => s !== null);
  }
  if (isObj(v)) {
    return Object.entries(v)
      .map(([label, value]) => ({ label, value: str(value) }))
      .filter((s) => s.value);
  }
  return [];
};

const toStringList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => (isObj(x) ? str(pick(x, ['name', 'title', 'label', 'value'])) : str(x))).filter(Boolean);
  if (typeof v === 'string') return v.split(/\n|;|,(?=\s)/).map((s) => s.trim()).filter(Boolean);
  return [];
};

const toVariants = (v: unknown): VariantGroup[] => {
  if (!Array.isArray(v)) return [];
  return v
    .map((g): VariantGroup | null => {
      if (!isObj(g)) return null;
      const name = str(pick(g, ['name', 'label', 'title']));
      const options = toStringList(pick(g, ['options', 'values', 'choices']));
      return name && options.length ? { name, options } : null;
    })
    .filter((g): g is VariantGroup => g !== null);
};

const toAvailability = (raw: Raw): Availability => {
  const s = str(pick(raw, ['availability', 'stockStatus', 'stock_status', 'status'])).toLowerCase().replace(/[\s-]+/g, '_');
  if (s) {
    if (['in_stock', 'available', 'instock'].includes(s)) return 'in_stock';
    if (['low_stock', 'limited'].includes(s)) return 'low_stock';
    if (['out_of_stock', 'unavailable', 'sold_out', 'outofstock'].includes(s)) return 'out_of_stock';
    if (['made_to_order', 'on_request', 'custom', 'pre_order', 'preorder'].includes(s)) return 'made_to_order';
  }
  const qty = num(pick(raw, ['stock', 'quantity', 'stockQuantity', 'stock_quantity', 'inventory']));
  if (qty !== null) return qty <= 0 ? 'out_of_stock' : qty <= 5 ? 'low_stock' : 'in_stock';
  const flag = pick(raw, ['inStock', 'in_stock', 'isAvailable', 'is_available', 'available']);
  if (flag !== undefined) return truthy(flag) ? 'in_stock' : 'out_of_stock';
  return 'unknown';
};

/** Showcase must only expose published content. */
export const isPublished = (raw: Raw): boolean => {
  const status = str(pick(raw, ['status', 'state'])).toLowerCase();
  if (['draft', 'archived', 'inactive', 'unpublished', 'deleted', 'disabled'].includes(status)) return false;
  for (const k of ['published', 'isPublished', 'is_published', 'active', 'isActive', 'is_active', 'visible']) {
    if (raw[k] === false || raw[k] === 0 || raw[k] === 'false') return false;
  }
  if (raw.deleted === true || raw.isDeleted === true || raw.is_deleted === true) return false;
  return true;
};

export const normalizeCategory = (raw: Raw): Category | null => {
  const name = str(pick(raw, ['name', 'title', 'label']));
  if (!name) return null;
  return { id: str(pick(raw, ['id', '_id', 'categoryId', 'uuid'])) || slugify(name), name, slug: str(raw.slug) || slugify(name) };
};

export const normalizeProduct = (raw: Raw): Product | null => {
  const name = str(pick(raw, ['name', 'title', 'productName', 'product_name']));
  const id = str(pick(raw, ['id', '_id', 'productId', 'product_id', 'uuid']));
  if (!name || !id) return null;
  const description = str(pick(raw, ['description', 'details', 'longDescription', 'long_description']));
  const summary = str(pick(raw, ['shortDescription', 'short_description', 'summary', 'tagline'])) || truncate(description, 140);
  const model = str(pick(raw, ['modelUrl', 'model_url', 'model3d', 'model3D', 'glbUrl', 'glb_url', 'glb', 'model']));
  return {
    id,
    slug: str(raw.slug) || id,
    name,
    summary,
    description,
    price: num(pick(raw, ['price', 'unitPrice', 'unit_price', 'sellingPrice', 'selling_price', 'amount', 'mrp'])),
    currency: str(raw.currency) || siteConfig.currency,
    images: toImages(raw),
    modelUrl: model ? resolveAsset(model) : null,
    category: toCategory(raw),
    availability: toAvailability(raw),
    specs: toSpecs(pick(raw, ['specifications', 'specs', 'attributes', 'features'])),
    variants: toVariants(pick(raw, ['variants', 'options', 'customizations', 'customisations'])),
    featured: truthy(pick(raw, ['featured', 'isFeatured', 'is_featured', 'highlight'])),
  };
};

export const normalizeProject = (raw: Raw): Project | null => {
  const title = str(pick(raw, ['title', 'name', 'projectName', 'project_name']));
  const id = str(pick(raw, ['id', '_id', 'projectId', 'project_id', 'uuid']));
  if (!title || !id) return null;
  const overview = str(pick(raw, ['overview', 'description', 'details', 'longDescription', 'long_description']));
  return {
    id,
    slug: str(raw.slug) || id,
    title,
    summary: str(pick(raw, ['shortDescription', 'short_description', 'summary', 'tagline'])) || truncate(overview, 150),
    overview,
    objectives: toStringList(pick(raw, ['objectives', 'goals', 'objective'])),
    category: toCategory(raw),
    images: toImages(raw),
    completedOn: str(pick(raw, ['completedOn', 'completed_on', 'completionDate', 'completion_date', 'completedAt', 'completed_at', 'date', 'year'])) || null,
    location: str(pick(raw, ['location', 'site', 'city'])) || null,
    client: str(pick(raw, ['client', 'clientName', 'client_name'])) || null,
    services: toStringList(pick(raw, ['services', 'technologies', 'materials', 'tags', 'tech'])),
    specs: toSpecs(pick(raw, ['specifications', 'specs', 'attributes', 'details_list'])),
    featured: truthy(pick(raw, ['featured', 'isFeatured', 'is_featured', 'highlight'])),
  };
};
