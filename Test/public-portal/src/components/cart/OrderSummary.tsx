import { formatPrice } from '@/utils/format';

interface Props {
  subtotal: number;
  currency: string;
  hasUnpricedItems: boolean;
  count: number;
}

const OrderSummary = ({ subtotal, currency, hasUnpricedItems, count }: Props) => (
  <dl className="summary">
    <div><dt>Items</dt><dd>{count}</dd></div>
    <div><dt>Subtotal</dt><dd>{formatPrice(subtotal, currency)}{hasUnpricedItems && ' +'}</dd></div>
    <div className="summary__total"><dt>Total</dt><dd>{formatPrice(subtotal, currency)}{hasUnpricedItems && ' +'}</dd></div>
    {hasUnpricedItems && <p className="fine">Some items are “price on request”. Final pricing is confirmed by our team.</p>}
  </dl>
);

export default OrderSummary;
