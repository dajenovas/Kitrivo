import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import type { Product } from '@/types';
import { isQuoteMode } from '@/config/site';
import { useCartStore } from '@/store/cartStore';
import SafeImage from '@/components/ui/SafeImage';
import QuantitySelector from '@/components/ui/QuantitySelector';
import AvailabilityBadge from './AvailabilityBadge';
import PriceTag from './PriceTag';
import VariantPicker from './VariantPicker';
import { defaultOptions, isOrderable } from './helpers';
import { Close } from '@mui/icons-material';

const QuickViewBody = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const add = useCartStore((s) => s.add);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState(() => defaultOptions(product));
  const [added, setAdded] = useState(false);
  const orderable = isOrderable(product);

  return (
    <div className="quick">
      <button type="button" className="icon-btn quick__close" aria-label="Close quick view" onClick={onClose}>
        <Close fontSize="small" />
      </button>
      <div className="quick__media">
        <SafeImage src={product.images[0]} alt={product.name} seed={product.id} label={product.name} eager />
      </div>
      <div className="quick__info" data-lenis-prevent>
        {product.category && <span className="eyebrow">{product.category.name}</span>}
        <h2 id="quick-title">{product.name}</h2>
        <div className="quick__row">
          <PriceTag product={product} />
          <AvailabilityBadge value={product.availability} />
        </div>
        <p>{product.summary || product.description}</p>
        {product.variants.length > 0 && <VariantPicker groups={product.variants} value={options} onChange={setOptions} />}
        <div className="quick__row">
          <QuantitySelector value={qty} onChange={setQty} />
          <button
            type="button"
            className="btn btn--primary"
            disabled={!orderable}
            onClick={() => {
              add(product, qty, options);
              setAdded(true);
            }}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
        {added && (
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/cart')}>
            View cart
          </button>
        )}
        {orderable && (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => {
              add(product, qty, options);
              navigate('/checkout');
            }}
          >
            {isQuoteMode ? 'Request a Quote' : 'Place Order'}
          </button>
        )}
        <Link className="link-arrow" to={`/products/${encodeURIComponent(product.slug)}`} onClick={onClose}>
          Full details & gallery
        </Link>
      </div>
    </div>
  );
};

const QuickViewDialog = ({ product, onClose }: { product: Product | null; onClose: () => void }) => (
  <Dialog
    open={Boolean(product)}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    aria-labelledby="quick-title"
    PaperProps={{ className: 'dialog-paper' }}
  >
    {product && <QuickViewBody key={product.id} product={product} onClose={onClose} />}
  </Dialog>
);

export default QuickViewDialog;
