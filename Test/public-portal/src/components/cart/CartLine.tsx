import { Link } from 'react-router-dom';
import type { CartItem } from '@/types';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import QuantitySelector from '@/components/ui/QuantitySelector';
import SafeImage from '@/components/ui/SafeImage';
import { DeleteOutline } from '@mui/icons-material';

const CartLine = ({ item }: { item: CartItem }) => {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const options = Object.entries(item.options);

  return (
    <li className="cart-line">
      <Link to={`/products/${encodeURIComponent(item.slug)}`} className="cart-line__img">
        <SafeImage src={item.image} alt={item.name} seed={item.productId} label={item.name} />
      </Link>
      <div className="cart-line__info">
        <h3><Link to={`/products/${encodeURIComponent(item.slug)}`}>{item.name}</Link></h3>
        {options.length > 0 && <p className="fine">{options.map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>}
        {item.customization && <p className="fine">Custom: {item.customization}</p>}
        <p className="fine">{item.unitPrice !== null ? `${formatPrice(item.unitPrice, item.currency)} each` : 'Price on request'}</p>
      </div>
      <QuantitySelector value={item.quantity} onChange={(n) => setQuantity(item.lineId, n)} label={`Quantity of ${item.name}`} />
      <div className="cart-line__total price">{item.unitPrice !== null ? formatPrice(item.unitPrice * item.quantity, item.currency) : '—'}</div>
      <button type="button" className="icon-btn" aria-label={`Remove ${item.name}`} onClick={() => remove(item.lineId)}>
        <DeleteOutline fontSize="small" />
      </button>
    </li>
  );
};

export default CartLine;
