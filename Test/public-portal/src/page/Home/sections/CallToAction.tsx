import { Link } from 'react-router-dom';
import { isQuoteMode } from '@/config/site';
import Reveal from '@/components/ui/Reveal';
import Magnetic from '@/components/ui/Magnetic';
import { ArrowForward } from '@mui/icons-material';

const CallToAction = () => (
  <section className="section cta" aria-labelledby="cta-title">
    <div className="container">
      <Reveal>
        <div className="cta__panel">
          <span className="cta__glow" aria-hidden />
          <span className="eyebrow">Let’s build something</span>
          <h2 id="cta-title">Ready when <span className="gradient-text">you are.</span></h2>
          <p className="lede">Browse the collection, look through our projects, or tell us what you need.</p>
          <div className="hero__cta">
            <Magnetic>
              <Link to="/products" className="btn btn--primary btn--lg">Explore products <ArrowForward className="btn__arrow" /></Link>
            </Magnetic>
            <Magnetic>
              <Link to="/projects" className="btn btn--ghost btn--lg">See projects</Link>
            </Magnetic>
            <Magnetic>
              <Link to={isQuoteMode ? '/contact?type=quote' : '/products'} className="btn btn--ghost btn--lg">
                {isQuoteMode ? 'Request a Quote' : 'Place an order'}
              </Link>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default CallToAction;
