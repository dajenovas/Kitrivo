import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import { BrandMark } from './Header';
import { MailOutline, PhoneOutlined, PlaceOutlined } from '@mui/icons-material';

const Footer = () => (
  <footer className="site-footer">
    <div className="container site-footer__grid">
      <div className="site-footer__brand">
        <BrandMark />
        <p>{siteConfig.tagline}</p>
        {siteConfig.socials.length > 0 && (
          <ul className="socials" aria-label="Social media">
            {siteConfig.socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="chip">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <nav aria-label="Footer">
        <h4>Explore</h4>
        <ul>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <div>
        <h4>Get in touch</h4>
        <ul className="contact-list">
          {siteConfig.email && <li><MailOutline fontSize="small" /><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>}
          {siteConfig.phone && <li><PhoneOutlined fontSize="small" /><a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}>{siteConfig.phone}</a></li>}
          {siteConfig.address && <li><PlaceOutlined fontSize="small" /><span>{siteConfig.address}</span></li>}
          {!siteConfig.email && !siteConfig.phone && !siteConfig.address && <li><Link to="/contact">Send us an inquiry</Link></li>}
        </ul>
      </div>
    </div>
    <div className="container site-footer__bottom">
      <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
      <span className="site-footer__legal">
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </span>
    </div>
  </footer>
);

export default Footer;
