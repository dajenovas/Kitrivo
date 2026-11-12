import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isQuoteMode, siteConfig } from '@/config/site';
import { cartCount, useCartStore } from '@/store/cartStore';
import { pauseScroll, resumeScroll } from '@/utils/scroll';
import { ShoppingBagOutlined, Menu, Close } from '@mui/icons-material';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

export const BrandMark = () => (
  <Link to="/" className="brand" aria-label={`${siteConfig.name} — home`}>
    <span className="brand__mark" aria-hidden />
    <span className="brand__name">{siteConfig.name}</span>
  </Link>
);

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => cartCount(s.items));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    pauseScroll();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      resumeScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled || open ? 'is-scrolled' : ''}`}>
      <div className="container site-header__bar">
        <BrandMark />
        <nav className="site-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-header__actions">
          {isQuoteMode && (
            <Link to="/contact?type=quote" className="btn btn--sm btn--ghost site-header__cta">
              Request a Quote
            </Link>
          )}
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            <ShoppingBagOutlined fontSize="small" />
            {count > 0 && <span className="cart-dot">{count > 99 ? '99+' : count}</span>}
          </Link>
          <button type="button" className="icon-btn site-header__burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <Close fontSize="small" /> : <Menu fontSize="small" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i + 0.05, duration: 0.5 }}>
                <NavLink to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`}>
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
            {isQuoteMode && (
              <Link to="/contact?type=quote" onClick={() => setOpen(false)} className="btn btn--primary btn--lg">
                Request a Quote
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
