import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProjects } from '@/api/showcase';
import { useResource } from '@/hooks/useResource';
import { useSeo } from '@/hooks/useSeo';
import ProjectCard from '@/components/project/ProjectCard';
import Reveal from '@/components/ui/Reveal';
import { BlockSkeleton, EmptyState, ErrorState } from '@/components/ui/States';

/** Repeating asymmetric rhythm: tall, wide, regular… */
const rhythm = [
  { span: 'masonry__item--tall', h: 560 },
  { span: '', h: 268 },
  { span: '', h: 268 },
  { span: 'masonry__item--wide', h: 300 },
  { span: '', h: 300 },
  { span: 'masonry__item--tall', h: 560 },
];

const ProjectsPage = () => {
  useSeo({ title: 'Projects', description: 'A portfolio of completed projects.' });
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? 'all';
  const { data, error, loading, reload } = useResource(fetchProjects, 'projects');

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((p) => p.category && map.set(p.category.slug, p.category.name));
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [data]);

  const list = useMemo(() => (data ?? []).filter((p) => category === 'all' || p.category?.slug === category), [data, category]);

  const pick = (slug: string) => {
    const next = new URLSearchParams();
    if (slug !== 'all') next.set('category', slug);
    setParams(next, { replace: true });
  };

  return (
    <section className="section page-top">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Portfolio</span>
          <h1>Projects</h1>
          <p className="lede">A selection of completed work.</p>
        </header>

        {categories.length > 0 && (
          <div className="chips toolbar__chips" role="group" aria-label="Filter by category">
            <button type="button" className="chip" aria-pressed={category === 'all'} onClick={() => pick('all')}>All</button>
            {categories.map((c) => (
              <button key={c.slug} type="button" className="chip" aria-pressed={category === c.slug} onClick={() => pick(c.slug)}>{c.name}</button>
            ))}
          </div>
        )}

        {loading && <BlockSkeleton height={560} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && list.length === 0 && <EmptyState title="No projects to show" text={data.length ? 'No projects in this category yet.' : 'Completed projects will appear here.'} />}
        {list.length > 0 && (
          <div className="masonry">
            {list.map((p, i) => {
              const r = rhythm[i % rhythm.length];
              return (
                <Reveal key={p.id} variant="clip" delay={(i % 3) * 0.07} className={`masonry__item ${r.span}`}>
                  <ProjectCard project={p} minHeight={r.h} />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsPage;
