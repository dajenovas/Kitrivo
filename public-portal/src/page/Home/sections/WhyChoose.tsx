import SectionHead from '@/components/ui/SectionHead';
import Reveal from '@/components/ui/Reveal';
import Tilt from '@/components/ui/Tilt';
import { WorkspacePremiumOutlined, VerifiedUserOutlined, TuneOutlined, SupportAgentOutlined } from '@mui/icons-material';

const reasons = [
  { icon: WorkspacePremiumOutlined, title: 'Uncompromising quality', text: 'Considered materials and careful finishing, checked before anything leaves us.' },
  { icon: VerifiedUserOutlined, title: 'Built to be reliable', text: 'Products and projects designed to perform — and to last — in real use.' },
  { icon: TuneOutlined, title: 'Made your way', text: 'Tell us your size, finish or requirement. Customization is part of the process.' },
  { icon: SupportAgentOutlined, title: 'Support that responds', text: 'A real team, before and after delivery — quick answers and clear next steps.' },
];

const WhyChoose = () => (
  <section className="section why" aria-labelledby="why-title">
    <div className="container">
      <SectionHead eyebrow="Why choose us" title={<span id="why-title">Good reasons to start here</span>} />
      <ul className="why__grid">
        {reasons.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <Reveal delay={i * 0.08}>
              <Tilt className="why__card glass" max={5}>
                <span className="why__icon"><Icon fontSize="inherit" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Tilt>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default WhyChoose;
