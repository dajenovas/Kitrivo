import { Link } from 'react-router-dom';
import { fetchProjects } from '@/api/showcase';
import { useResource } from '@/hooks/useResource';
import ProjectCard from '@/components/project/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, ErrorState, BlockSkeleton } from '@/components/ui/States';
import { ArrowForward } from '@mui/icons-material';

const FeaturedProjects = () => {
  const { data, error, loading, reload } = useResource(fetchProjects, 'projects');
  const featured = data ? (data.some((p) => p.featured) ? data.filter((p) => p.featured) : data).slice(0, 3) : [];

  return (
    <section className="section featured-projects" aria-labelledby="fpr-title">
      <div className="container">
        <SectionHead
          eyebrow="Featured projects"
          title={<span id="fpr-title">Work we’re proud of</span>}
          text="Completed projects, from first idea to final detail."
          action={<Link to="/projects" className="link-arrow">All projects <ArrowForward fontSize="inherit" /></Link>}
        />
        {loading && <BlockSkeleton height={520} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && featured.length === 0 && <EmptyState title="Projects coming soon" text="Completed projects will appear here." />}
        {featured.length > 0 && (
          <div className="bento">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} variant="clip" className={`bento__item bento__item--${i}`}>
                <ProjectCard project={p} minHeight={i === 0 ? 560 : 268} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
