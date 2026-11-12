import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { fetchCategories, fetchProducts, fetchProjects } from '@/api/showcase';
import { siteConfig } from '@/config/site';
import { useResource } from '@/hooks/useResource';
import Reveal from '@/components/ui/Reveal';

const CountUp = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref}>{reduce ? to : val}</span>;
};

const loadStats = async () => {
  const [products, projects, categories] = await Promise.all([fetchProducts(), fetchProjects(), fetchCategories()]);
  return { products: products.length, projects: projects.length, categories: categories.length };
};

/** Stats come from the live API — nothing is invented. */
const About = () => {
  const { data } = useResource(loadStats, 'home-stats');
  const stats = data
    ? [
        { label: 'Products', value: data.products },
        { label: 'Projects delivered', value: data.projects },
        { label: 'Categories', value: data.categories },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <section className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <Reveal className="about__visual" variant="clip">
          <div className="about__stack" aria-hidden>
            <span className="about__plate about__plate--1" />
            <span className="about__plate about__plate--2" />
            <span className="about__plate about__plate--3" />
            <span className="about__ring" />
          </div>
        </Reveal>
        <div className="about__copy">
          <Reveal><span className="eyebrow">About us</span></Reveal>
          <Reveal delay={0.08}><h2 id="about-title">Details you can feel.</h2></Reveal>
          <Reveal delay={0.16}>
            <p className="lede">
              {siteConfig.name} designs and delivers products and projects with a close eye on materials, finish and
              function. Every piece is made to look right on day one and keep looking right years later.
            </p>
          </Reveal>
          {stats.length > 0 && (
            <Reveal delay={0.24}>
              <dl className="stats">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd><CountUp to={s.value} /></dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
