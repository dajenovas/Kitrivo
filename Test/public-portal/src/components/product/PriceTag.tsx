import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';

const PriceTag = ({ product }: { product: Pick<Product, 'price' | 'currency'> }) =>
  product.price !== null ? (
    <span className="price">{formatPrice(product.price, product.currency)}</span>
  ) : (
    <span className="price price--muted">Price on request</span>
  );

export default PriceTag;
