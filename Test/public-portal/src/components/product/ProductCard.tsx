import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { isQuoteMode } from '@/config/site';
import { useCartStore } from '@/store/cartStore';
import SafeImage from '@/components/ui/SafeImage';
import Tilt from '@/components/ui/Tilt';
import AvailabilityBadge from './AvailabilityBadge';
import PriceTag from './PriceTag';
import { defaultOptions, isOrderable } from './helpers';
import { ArrowForward, OpenInFull } from '@mui/icons-material';

interface Props {
  product: Product;
  /** "order": View Details + Place Order · "quick": View Details + Quick View */
  mode?: 'order' | 'quick';
  onQuickView?: (p: Product) => void;
}

const ProductCard = ({ product, mode = 'order', onQuickView }: Props) => {
  const add = useCartStore((s) => s.add);
  const navigate = useNavigate();
  const orderable = isOrderable(product);

  const placeOrder = () => {
    add(product, 1, defaultOptions(product));
    navigate('/checkout');
  };

  return (
    <article className="product-card">
      <Tilt className="product-card__tilt">
        <div className="product-card__media">
          <SafeImage src={product.images[0]} alt={product.name} seed={product.id} label={product.name} />
        </div>
        <div className="product-card__badges">
          <AvailabilityBadge value={product.availability} />
          {product.modelUrl && <span className="badge">3D</span>}
        </div>
        {onQuickView && (
          <button type="button" className="icon-btn product-card__quick" aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}>
            <OpenInFull fontSize="small" />
          </button>
        )}
        <div className="product-card__body">
          {product.category && <span className="product-card__cat">{product.category.name}</span>}
          <h3 className="product-card__title">
            <Link to={`/products/${encodeURIComponent(product.slug)}`}>{product.name}</Link>
          </h3>
          {product.summary && <p className="product-card__sum">{product.summary}</p>}
          <div className="product-card__foot">
            <PriceTag product={product} />
            <div className="product-card__actions">
              <Link className="link-arrow" to={`/products/${encodeURIComponent(product.slug)}`} aria-label={`View details of ${product.name}`}>
                Details <ArrowForward fontSize="inherit" />
              </Link>
              {mode === 'order' ? (
                <button type="button" className="btn btn--primary btn--sm" disabled={!orderable} onClick={placeOrder}>
                  {isQuoteMode ? 'Get Quote' : 'Place Order'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="product-card__glare" />
      </Tilt>
    </article>
  );
};

export default ProductCard;
