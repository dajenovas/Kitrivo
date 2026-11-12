import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { formatMonthYear } from '@/utils/format';
import SafeImage from '@/components/ui/SafeImage';
import { ArrowOutward } from '@mui/icons-material';

interface Props {
  project: Project;
  className?: string;
  minHeight?: number;
}

const ProjectCard = ({ project, className = '', minHeight = 380 }: Props) => {
  const completed = formatMonthYear(project.completedOn);
  return (
    <Link to={`/projects/${encodeURIComponent(project.slug)}`} className={`project-card ${className}`} style={{ minHeight }} aria-label={`View project: ${project.title}`}>
      <SafeImage src={project.images[0]} alt="" seed={project.id} label={project.title} />
      <span className="project-card__go" aria-hidden>
        <ArrowOutward fontSize="small" />
      </span>
      <div className="project-card__body">
        <div className="project-card__meta">
          {project.category && <span>{project.category.name}</span>}
          {completed && <span>Completed {completed}</span>}
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        {project.summary && <p className="project-card__sum">{project.summary}</p>}
      </div>
    </Link>
  );
};

export default ProjectCard;
