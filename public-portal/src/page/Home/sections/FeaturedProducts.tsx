import { Link } from 'react-router-dom';
import { fetchProducts } from '@/api/showcase';
import { useResource } from '@/hooks/useResource';
import ProductCard from '@/components/product/ProductCard';
import SectionHead from '@/components/ui/SectionHead';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, ErrorState, ProductGridSkeleton } from '@/components/ui/States';
import { ArrowForward } from '@mui/icons-material';

const FeaturedProducts = () => {
  const { data, error, loading, reload } = useResource(fetchProducts, 'products');
  const featured = data ? (data.some((p) => p.featured) ? data.filter((p) => p.featured) : data).slice(0, 4) : [];

  return (
    <section className="section" id="featured" aria-labelledby="fp-title">
      <div className="container">
        <SectionHead
          eyebrow="Featured products"
          title={<span id="fp-title">Made to be noticed</span>}
          text="A closer look at what we’re known for."
          action={<Link to="/products" className="link-arrow">All products <ArrowForward fontSize="inherit" /></Link>}
        />
        {loading && <ProductGridSkeleton count={4} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && featured.length === 0 && <EmptyState title="Products coming soon" text="We’re preparing our collection. Check back shortly." />}
        {featured.length > 0 && (
          <div className="grid-products">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} mode="order" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
