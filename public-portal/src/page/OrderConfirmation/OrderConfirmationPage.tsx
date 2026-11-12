import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useSeo } from '@/hooks/useSeo';
import { useOrderStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import { EmptyState } from '@/components/ui/States';
import { CheckCircleOutline, ContentCopy } from '@mui/icons-material';

const OrderConfirmationPage = () => {
  useSeo({ title: 'Order received' });
  const receipt = useOrderStore((s) => s.receipt);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  if (!receipt) {
    return (
      <section className="section page-top">
        <div className="container">
          <EmptyState title="No recent order" text="Once you submit an order or quote request, its summary appears here." action={<Link to="/products" className="btn btn--primary">Explore products</Link>} />
        </div>
      </section>
    );
  }

  const isQuote = receipt.mode === 'quote';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="section page-top">
      <div className="container confirm">
        <motion.div className="confirm__badge" initial={reduce ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
          <CheckCircleOutline fontSize="inherit" />
        </motion.div>
        <h1>{isQuote ? 'Quote request received' : 'Order received'}</h1>
        <p className="lede">Thank you, {receipt.customer.name.split(' ')[0]}. A confirmation will be sent to {receipt.customer.email}.</p>

        <div className="confirm__ref glass">
          <span className="field__label">Reference</span>
          <strong>{receipt.reference}</strong>
          <button type="button" className="btn btn--sm" onClick={copy}><ContentCopy fontSize="inherit" /> {copied ? 'Copied' : 'Copy'}</button>
        </div>

        <div className="confirm__grid">
          <div className="panel glass">
            <h2 className="panel__title">Summary</h2>
            <ul className="confirm__items">
              {receipt.items.map((i) => (
                <li key={i.lineId}>
                  <span>
                    {i.name} × {i.quantity}
                    {Object.keys(i.options).length > 0 && <small>{Object.values(i.options).join(' · ')}</small>}
                  </span>
                  <span>{i.unitPrice !== null ? formatPrice(i.unitPrice * i.quantity, i.currency) : 'On request'}</span>
                </li>
              ))}
            </ul>
            <div className="summary__total confirm__total">
              <span>Total</span>
              <span>{formatPrice(receipt.subtotal, receipt.currency)}{receipt.hasUnpricedItems && ' +'}</span>
            </div>
            {receipt.deliveryAddress && <p className="fine">Deliver to: {receipt.deliveryAddress}</p>}
          </div>
          <div className="panel glass">
            <h2 className="panel__title">What happens next</h2>
            <ol className="steps">
              <li><strong>We review</strong> your {isQuote ? 'request' : 'order'} and check details and availability.</li>
              <li><strong>We contact you</strong> at {receipt.customer.phone} or {receipt.customer.email} to confirm {isQuote ? 'pricing and timelines' : 'pricing, timelines and payment'}.</li>
              <li><strong>We deliver</strong> once everything is agreed. Quote this reference in any message.</li>
            </ol>
            {(siteConfig.email || siteConfig.phone) && <p className="fine">Questions? {siteConfig.email}{siteConfig.email && siteConfig.phone && ' · '}{siteConfig.phone}</p>}
          </div>
        </div>
        <div className="hero__cta">
          <Link to="/products" className="btn btn--primary">Continue browsing</Link>
          <Link to="/" className="btn btn--ghost">Back to home</Link>
        </div>
      </div>
    </section>
  );
};

export default OrderConfirmationPage;
