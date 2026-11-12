import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface Props {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  action?: ReactNode;
}

const SectionHead = ({ eyebrow, title, text, action }: Props) => (
  <Reveal>
    <div className="section-head">
      <div className="section-head__text">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p className="lede">{text}</p>}
      </div>
      {action}
    </div>
  </Reveal>
);

export default SectionHead;
