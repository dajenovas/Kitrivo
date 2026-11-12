import { Link } from 'react-router-dom';
import { isQuoteMode } from '@/config/site';
import { useSeo } from '@/hooks/useSeo';
import { cartCount, cartTotals, useCartStore } from '@/store/cartStore';
import CartLine from '@/components/cart/CartLine';
import OrderSummary from '@/components/cart/OrderSummary';
import { EmptyState } from '@/components/ui/States';
import { ArrowForward } from '@mui/icons-material';

const CartPage = () => {
  useSeo({ title: 'Cart' });
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const totals = cartTotals(items);

  return (
    <section className="section page-top">
      <div className="container">
        <header className="page-head"><span className="eyebrow">Your selection</span><h1>Cart</h1></header>
        {items.length === 0 ? (
          <EmptyState title="Your cart is empty" text="Add a few products and they’ll show up here." action={<Link to="/products" className="btn btn--primary">Explore products</Link>} />
        ) : (
          <div className="cart">
            <ul className="cart__lines">{items.map((i) => (<CartLine key={i.lineId} item={i} />))}</ul>
            <aside className="cart__side glass">
              <h2>Summary</h2>
              <OrderSummary subtotal={totals.subtotal} currency={totals.currency} hasUnpricedItems={totals.hasUnpricedItems} count={cartCount(items)} />
              <Link to="/checkout" className="btn btn--primary btn--lg btn--block">
                {isQuoteMode ? 'Request a Quote' : 'Continue to checkout'} <ArrowForward className="btn__arrow" />
              </Link>
              <Link to="/products" className="btn btn--ghost btn--block">Keep browsing</Link>
              <button type="button" className="link-arrow cart__clear" onClick={clear}>Clear cart</button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage;
