import { useSeo } from '@/hooks/useSeo';
import { siteConfig } from '@/config/site';
import Hero from './sections/Hero';
import FeaturedProducts from './sections/FeaturedProducts';
import FeaturedProjects from './sections/FeaturedProjects';
import About from './sections/About';
import WhyChoose from './sections/WhyChoose';
import CallToAction from './sections/CallToAction';

const HomePage = () => {
  useSeo({
    description: `${siteConfig.name} — explore our products and completed projects, place an order or request a quote.`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Organization', name: siteConfig.name, ...(siteConfig.email && { email: siteConfig.email }), ...(siteConfig.phone && { telephone: siteConfig.phone }) },
  });
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <FeaturedProjects />
      <About />
      <WhyChoose />
      <CallToAction />
    </>
  );
};

export default HomePage;
