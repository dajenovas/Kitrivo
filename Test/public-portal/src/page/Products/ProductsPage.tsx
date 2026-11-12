import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '@/api/showcase';
import { useResource } from '@/hooks/useResource';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';
import type { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import QuickViewDialog from '@/components/product/QuickViewDialog';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, ErrorState, ProductGridSkeleton } from '@/components/ui/States';
import { Search } from '@mui/icons-material';

type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';

const sorters: Record<Sort, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  name: (a, b) => a.name.localeCompare(b.name),
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  'price-desc': (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
};

const ProductsPage = () => {
  useSeo({ title: 'Products', description: 'Browse the full product collection — filter by category, search and sort.' });
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const debounced = useDebounce(search, 200);
  const category = params.get('category') ?? 'all';
  const sort = (params.get('sort') as Sort) in sorters ? (params.get('sort') as Sort) : 'featured';
  const [quick, setQuick] = useState<Product | null>(null);
  const { data, error, loading, reload } = useResource(fetchProducts, 'products');

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((p) => p.category && map.set(p.category.slug, p.category.name));
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [data]);

  const results = useMemo(() => {
    if (!data) return [];
    const q = debounced.trim().toLowerCase();
    return data
      .filter((p) => category === 'all' || p.category?.slug === category)
      .filter((p) => !q || `${p.name} ${p.summary} ${p.category?.name ?? ''}`.toLowerCase().includes(q))
      .sort(sorters[sort]);
  }, [data, category, debounced, sort]);

  return (
    <section className="section page-top">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Collection</span>
          <h1>Products</h1>
          <p className="lede">Everything we make, in one place.</p>
        </header>

        <div className="toolbar">
          <label className="toolbar__search">
            <Search fontSize="small" />
            <span className="sr-only">Search products</span>
            <input
              className="input"
              type="search"
              placeholder="Search products"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                update('q', e.target.value.trim(), '');
              }}
            />
          </label>
          <label className="toolbar__sort">
            <span className="sr-only">Sort products</span>
            <select className="select" value={sort} onChange={(e) => update('sort', e.target.value, 'featured')}>
              <option value="featured">Featured first</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {categories.length > 0 && (
          <div className="chips toolbar__chips" role="group" aria-label="Filter by category">
            <button type="button" className="chip" aria-pressed={category === 'all'} onClick={() => update('category', 'all', 'all')}>All</button>
            {categories.map((c) => (
              <button key={c.slug} type="button" className="chip" aria-pressed={category === c.slug} onClick={() => update('category', c.slug, 'all')}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        <p className="result-count" aria-live="polite">{data ? `${results.length} product${results.length === 1 ? '' : 's'}` : ' '}</p>

        {loading && <ProductGridSkeleton count={8} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && results.length === 0 && (
          <EmptyState
            title={data.length === 0 ? 'No products yet' : 'No matches'}
            text={data.length === 0 ? 'Our collection will appear here once published.' : 'Try a different search or clear the filters.'}
            action={data.length > 0 ? <button type="button" className="btn" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear filters</button> : undefined}
          />
        )}
        {results.length > 0 && (
          <div className="grid-products">
            {results.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05} y={24}>
                <ProductCard product={p} mode="quick" onQuickView={setQuick} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <QuickViewDialog product={quick} onClose={() => setQuick(null)} />
    </section>
  );
};

export default ProductsPage;
