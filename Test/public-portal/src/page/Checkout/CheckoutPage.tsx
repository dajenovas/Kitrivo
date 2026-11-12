import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitOrder } from '@/api/showcase';
import { getErrorMessage } from '@/api/http';
import { isQuoteMode } from '@/config/site';
import { useSeo } from '@/hooks/useSeo';
import { cartCount, cartTotals, useCartStore, useOrderStore } from '@/store/cartStore';
import { generateOrderReference } from '@/utils/orderRef';
import CartLine from '@/components/cart/CartLine';
import OrderSummary from '@/components/cart/OrderSummary';
import { EmptyState } from '@/components/ui/States';

interface Form {
  name: string;
  email: string;
  phone: string;
  address: string;
  customization: string;
  notes: string;
  website: string; // honeypot
}
type Errors = Partial<Record<'name' | 'email' | 'phone', string>>;

const validate = (f: Form): Errors => {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number.';
  return e;
};

const CheckoutPage = () => {
  useSeo({ title: isQuoteMode ? 'Request a Quote' : 'Checkout' });
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const setReceipt = useOrderStore((s) => s.setReceipt);
  const [reference] = useState(() => generateOrderReference());
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '', address: '', customization: '', notes: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const totals = cartTotals(items);

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (form.website) return; // bot
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`co-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setFailure(null);
    const mode = isQuoteMode ? 'quote' : 'order';
    const lines = items.map((i) => ({ ...i, image: null }));
    const customer = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
    try {
      const res = await submitOrder({
        reference,
        mode,
        customer,
        deliveryAddress: form.address.trim(),
        customizationRequirements: form.customization.trim(),
        notes: form.notes.trim(),
        items: lines,
      });
      setReceipt({
        reference: res.reference,
        mode,
        placedAt: new Date().toISOString(),
        customer,
        deliveryAddress: form.address.trim(),
        notes: [form.customization.trim() && `Customization: ${form.customization.trim()}`, form.notes.trim()].filter(Boolean).join('\n'),
        items: items.map((i) => ({ ...i, image: null })),
        subtotal: totals.subtotal,
        currency: totals.currency,
        hasUnpricedItems: totals.hasUnpricedItems,
      });
      clear();
      navigate('/order-confirmation', { replace: true });
    } catch (err) {
      setFailure(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <section className="section page-top">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">{isQuoteMode ? 'Request a quote' : 'Checkout'}</span>
          <h1>{isQuoteMode ? 'Tell us what you need' : 'Place your order'}</h1>
          <p className="lede">{isQuoteMode ? 'No payment now. We’ll review your request and confirm pricing and timelines.' : 'Review your items and share your details. Our team will confirm your order.'}</p>
        </header>

        {items.length === 0 ? (
          <EmptyState title="Nothing to order yet" text="Add products to your cart first." action={<Link to="/products" className="btn btn--primary">Explore products</Link>} />
        ) : (
          <form className="checkout" onSubmit={onSubmit} noValidate>
            <div className="checkout__main">
              <fieldset className="panel glass">
                <legend className="panel__title">Your details</legend>
                <div className="form-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="co-name">Full name <i>*</i></label>
                    <input id="co-name" className="input" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'err-name' : undefined} />
                    {errors.name && <span id="err-name" className="field__error">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="co-email">Email <i>*</i></label>
                    <input id="co-email" type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'err-email' : undefined} />
                    {errors.email && <span id="err-email" className="field__error">{errors.email}</span>}
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="co-phone">Phone <i>*</i></label>
                    <input id="co-phone" type="tel" className="input" autoComplete="tel" value={form.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'err-phone' : undefined} />
                    {errors.phone && <span id="err-phone" className="field__error">{errors.phone}</span>}
                  </div>
                  <div className="field field--full">
                    <label className="field__label" htmlFor="co-address">Delivery address (if applicable)</label>
                    <textarea id="co-address" className="textarea" rows={3} autoComplete="street-address" value={form.address} onChange={set('address')} />
                  </div>
                </div>
              </fieldset>

              <fieldset className="panel glass">
                <legend className="panel__title">Requirements</legend>
                <div className="form-grid">
                  <div className="field field--full">
                    <label className="field__label" htmlFor="co-custom">Customization requirements</label>
                    <textarea id="co-custom" className="textarea" rows={3} maxLength={1000} value={form.customization} onChange={set('customization')} />
                  </div>
                  <div className="field field--full">
                    <label className="field__label" htmlFor="co-notes">Additional notes</label>
                    <textarea id="co-notes" className="textarea" rows={3} maxLength={1000} value={form.notes} onChange={set('notes')} />
                  </div>
                </div>
              </fieldset>
              <div className="hp" aria-hidden>
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
              </div>

              <div className="panel glass">
                <h2 className="panel__title">Items</h2>
                <ul className="cart__lines">{items.map((i) => (<CartLine key={i.lineId} item={i} />))}</ul>
              </div>
            </div>

            <aside className="cart__side glass checkout__side">
              <h2>Summary</h2>
              <OrderSummary subtotal={totals.subtotal} currency={totals.currency} hasUnpricedItems={totals.hasUnpricedItems} count={cartCount(items)} />
              <p className="fine">Reference: <strong>{reference}</strong></p>
              {failure && <p className="form-note form-note--error" role="alert">{failure} Your cart is safe — please try again.</p>}
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
                {submitting ? (<><span className="spinner" /> Sending…</>) : isQuoteMode ? 'Submit quote request' : 'Submit order'}
              </button>
              <p className="fine">{isQuoteMode ? 'Submitting sends a request only — no payment is taken.' : 'No online payment is taken. We’ll contact you to confirm and arrange payment.'}</p>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
};

export default CheckoutPage;
