import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProject, fetchProjects } from '@/api/showcase';
import { useResource } from '@/hooks/useResource';
import { useSeo } from '@/hooks/useSeo';
import { formatMonthYear } from '@/utils/format';
import type { Project } from '@/types';
import ProjectCard from '@/components/project/ProjectCard';
import Reveal from '@/components/ui/Reveal';
import SafeImage from '@/components/ui/SafeImage';
import { BlockSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { ArrowForward, ChevronRight } from '@mui/icons-material';

const ProjectBody = ({ project, related }: { project: Project; related: Project[] }) => {
  useSeo({ title: project.title, description: project.summary || project.overview.slice(0, 160), image: project.images[0] });
  const completed = formatMonthYear(project.completedOn);
  const facts = [
    project.category && { label: 'Category', value: project.category.name },
    completed && { label: 'Completed', value: completed },
    project.location && { label: 'Location', value: project.location },
    project.client && { label: 'Client', value: project.client },
  ].filter((f): f is { label: string; value: string } => Boolean(f));
  const gallery = project.images.slice(1);

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/projects">Projects</Link><ChevronRight fontSize="inherit" /><span aria-current="page">{project.title}</span>
      </nav>
      <header className="page-head">
        {project.category && <span className="eyebrow">{project.category.name}</span>}
        <h1>{project.title}</h1>
        {project.summary && <p className="lede">{project.summary}</p>}
      </header>

      <Reveal variant="clip" className="project-hero">
        <SafeImage src={project.images[0]} alt={project.title} seed={project.id} label={project.title} eager />
      </Reveal>

      {facts.length > 0 && (
        <dl className="facts">
          {facts.map((f) => (<div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>))}
        </dl>
      )}

      <div className="project-cols">
        <Reveal>
          <h2>Overview</h2>
          <p className="lede">{project.overview || project.summary}</p>
        </Reveal>
        {project.objectives.length > 0 && (
          <Reveal delay={0.1}>
            <h2>Objectives</h2>
            <ol className="objectives">
              {project.objectives.map((o, i) => (<li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{o}</li>))}
            </ol>
          </Reveal>
        )}
      </div>

      {gallery.length > 0 && (
        <div className="project-gallery">
          {gallery.map((src, i) => (
            <Reveal key={i} variant="clip" className={i % 3 === 0 ? 'project-gallery__wide' : ''}>
              <SafeImage src={src} alt={`${project.title} — image ${i + 2}`} seed={`${project.id}-${i + 1}`} label="" />
            </Reveal>
          ))}
        </div>
      )}

      {(project.services.length > 0 || project.specs.length > 0) && (
        <div className="project-cols">
          {project.services.length > 0 && (
            <Reveal>
              <h2>Services & materials</h2>
              <ul className="chips">{project.services.map((s) => (<li key={s} className="chip" style={{ cursor: 'default' }}>{s}</li>))}</ul>
            </Reveal>
          )}
          {project.specs.length > 0 && (
            <Reveal delay={0.1}>
              <h2>Specifications</h2>
              <dl className="specs">{project.specs.map((s) => (<div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>))}</dl>
            </Reveal>
          )}
        </div>
      )}

      <Reveal>
        <div className="cta__panel cta__panel--compact">
          <h2>Have a similar project in mind?</h2>
          <p className="lede">Tell us about it and we’ll get back to you.</p>
          <Link to={`/contact?type=project&subject=${encodeURIComponent(`Inquiry about: ${project.title}`)}`} className="btn btn--primary btn--lg">
            Start an inquiry <ArrowForward className="btn__arrow" />
          </Link>
        </div>
      </Reveal>

      {related.length > 0 && (
        <div className="pdp__related">
          <Reveal><h2>Related projects</h2></Reveal>
          <div className="related-grid">
            {related.map((p) => (<Reveal key={p.id} variant="clip"><ProjectCard project={p} minHeight={320} /></Reveal>))}
          </div>
        </div>
      )}
    </>
  );
};

const ProjectDetailPage = () => {
  const { slug = '' } = useParams();
  const { data, error, loading, reload } = useResource(() => fetchProject(slug), `project:${slug}`);
  const all = useResource(fetchProjects, 'projects').data;

  const related = useMemo(() => {
    if (!data || !all) return [];
    const others = all.filter((p) => p.id !== data.id);
    const same = others.filter((p) => p.category?.id === data.category?.id);
    return [...same, ...others.filter((p) => !same.includes(p))].slice(0, 3);
  }, [data, all]);

  return (
    <section className="section page-top">
      <div className="container">
        {loading && <BlockSkeleton height={560} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && !data && (
          <EmptyState title="Project not found" text="It may have been removed." action={<Link to="/projects" className="btn btn--primary">Back to projects</Link>} />
        )}
        {data && <ProjectBody key={data.id} project={data} related={related} />}
      </div>
    </section>
  );
};

export default ProjectDetailPage;
