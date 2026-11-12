import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const NotFoundPage = () => {
  useSeo({ title: 'Page not found' });
  return (
    <section className="section page-top">
      <div className="container notfound">
        <span className="notfound__code gradient-text">404</span>
        <h1>Page not found</h1>
        <p className="lede">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="hero__cta">
          <Link to="/" className="btn btn--primary">Back to home</Link>
          <Link to="/products" className="btn btn--ghost">Explore products</Link>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
