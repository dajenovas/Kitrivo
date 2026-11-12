import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { fetchProduct, fetchProducts } from '@/api/showcase';
import { isQuoteMode, siteConfig } from '@/config/site';
import { useResource } from '@/hooks/useResource';
import { useSeo } from '@/hooks/useSeo';
import { hasWebGL } from '@/hooks/useWebGL';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';
import AvailabilityBadge from '@/components/product/AvailabilityBadge';
import PriceTag from '@/components/product/PriceTag';
import ProductCard from '@/components/product/ProductCard';
import VariantPicker from '@/components/product/VariantPicker';
import { defaultOptions, isOrderable } from '@/components/product/helpers';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Reveal from '@/components/ui/Reveal';
import SafeImage from '@/components/ui/SafeImage';
import { BlockSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { ChevronRight } from '@mui/icons-material';

const ModelViewer = lazy(() => import('@/components/three/ModelViewer'));

const Gallery = ({ product }: { product: Product }) => {
  const reduce = useReducedMotion() ?? false;
  const canModel = Boolean(product.modelUrl) && hasWebGL();
  const [mode, setMode] = useState<'3d' | 'photos'>(canModel ? '3d' : 'photos');
  const [index, setIndex] = useState(0);
  const images = product.images.length ? product.images : [null];
  const photoFallback = <SafeImage src={images[index]} alt={product.name} seed={product.id} label={product.name} eager />;

  return (
    <div className="gallery">
      <div className="gallery__main glass">
        {mode === '3d' && canModel && product.modelUrl ? (
          <ErrorBoundary fallback={photoFallback}>
            <Suspense fallback={<div className="skeleton" style={{ position: 'absolute', inset: 0 }} aria-busy />}>
              <ModelViewer url={product.modelUrl} reduceMotion={reduce} />
            </Suspense>
            <span className="gallery__hint">Drag to rotate</span>
          </ErrorBoundary>
        ) : (
          photoFallback
        )}
      </div>
      {(canModel || images.length > 1) && (
        <div className="gallery__thumbs" role="group" aria-label="Product views">
          {canModel && (
            <button type="button" className="thumb thumb--3d" aria-pressed={mode === '3d'} onClick={() => setMode('3d')}>
              3D
            </button>
          )}
          {images.length > 1 &&
            images.map((src, i) => (
              <button key={i} type="button" className="thumb" aria-pressed={mode === 'photos' && index === i} aria-label={`Photo ${i + 1}`} onClick={() => { setMode('photos'); setIndex(i); }}>
                <SafeImage src={src} alt="" seed={`${product.id}-${i}`} label="" />
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

const ProductBody = ({ product, related }: { product: Product; related: Product[] }) => {
  const add = useCartStore((s) => s.add);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState(() => defaultOptions(product));
  const [custom, setCustom] = useState('');
  const [added, setAdded] = useState(false);
  const orderable = isOrderable(product);

  useSeo({
    title: product.name,
    description: product.summary || product.description.slice(0, 160),
    image: product.images[0],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.summary || product.description,
      ...(product.images.length && { image: product.images.filter((i) => !i.startsWith('data:')) }),
      ...(product.category && { category: product.category.name }),
      ...(product.price !== null && {
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.availability === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        },
      }),
    },
  });

  const addToCart = () => {
    add(product, qty, options, custom);
    setAdded(true);
  };

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/products">Products</Link>
        <ChevronRight fontSize="inherit" />
        {product.category && (<><Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link><ChevronRight fontSize="inherit" /></>)}
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pdp">
        <Gallery product={product} key={product.id} />
        <div className="pdp__info">
          <div className="pdp__badges">
            <AvailabilityBadge value={product.availability} />
            {product.category && <span className="product-card__cat">{product.category.name}</span>}
          </div>
          <h1>{product.name}</h1>
          <PriceTag product={product} />
          {product.summary && <p className="lede">{product.summary}</p>}

          {product.variants.length > 0 && <VariantPicker groups={product.variants} value={options} onChange={setOptions} />}

          <label className="field">
            <span className="field__label">Customization requirements (optional)</span>
            <textarea className="textarea" rows={3} maxLength={600} placeholder="Size, finish, colour or anything else you need" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </label>

          <div className="pdp__buy">
            <QuantitySelector value={qty} onChange={setQty} />
            <button type="button" className="btn btn--primary btn--lg" disabled={!orderable} onClick={addToCart}>
              {added ? 'Added to cart ✓' : 'Add to Cart'}
            </button>
          </div>
          <div className="pdp__buy">
            <button
              type="button"
              className="btn btn--lg btn--block"
              disabled={!orderable}
              onClick={() => {
                add(product, qty, options, custom);
                navigate('/checkout');
              }}
            >
              {isQuoteMode ? 'Request a Quote' : 'Place Order'}
            </button>
          </div>
          {!orderable && <p className="form-note">This product is currently out of stock. <Link to="/contact?type=product" className="link-arrow">Ask about availability</Link></p>}
          {added && <p className="form-note" role="status">Added. <Link to="/cart" className="link-arrow">View cart</Link></p>}
          {isQuoteMode && <p className="fine">No online payment — we’ll confirm pricing and timelines with you.</p>}
        </div>
      </div>

      <div className="pdp__details">
        <Reveal>
          <h2>About this product</h2>
          <p className="lede pdp__desc">{product.description || product.summary || `Contact ${siteConfig.name} for details.`}</p>
        </Reveal>
        {product.specs.length > 0 && (
          <Reveal delay={0.1}>
            <h2>Specifications</h2>
            <dl className="specs">
              {product.specs.map((s) => (
                <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>

      {related.length > 0 && (
        <div className="pdp__related">
          <Reveal><h2>You may also like</h2></Reveal>
          <div className="grid-products">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}><ProductCard product={p} mode="order" /></Reveal>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const { data, error, loading, reload } = useResource(() => fetchProduct(slug), `product:${slug}`);
  const all = useResource(fetchProducts, 'products').data;

  const related = useMemo(() => {
    if (!data || !all) return [];
    const others = all.filter((p) => p.id !== data.id);
    const same = others.filter((p) => p.category?.id === data.category?.id);
    return [...same, ...others.filter((p) => !same.includes(p))].slice(0, 4);
  }, [data, all]);

  return (
    <section className="section page-top">
      <div className="container">
        {loading && <BlockSkeleton height={560} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && !data && (
          <EmptyState title="Product not found" text="It may have been removed or is no longer available." action={<Link to="/products" className="btn btn--primary">Back to products</Link>} />
        )}
        {data && <ProductBody key={data.id} product={data} related={related} />}
      </div>
    </section>
  );
};

export default ProductDetailPage;
