import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { submitInquiry } from '@/api/showcase';
import { getErrorMessage } from '@/api/http';
import { siteConfig } from '@/config/site';
import { useSeo } from '@/hooks/useSeo';
import type { InquiryType } from '@/types';
import { MailOutline, PhoneOutlined, PlaceOutlined } from '@mui/icons-material';

const types: { value: InquiryType; label: string }[] = [
  { value: 'general', label: 'General question' },
  { value: 'product', label: 'Product inquiry' },
  { value: 'project', label: 'Project inquiry' },
  { value: 'quote', label: 'Request a quote' },
  { value: 'support', label: 'Support' },
];

const ContactPage = () => {
  useSeo({ title: 'Contact', description: `Get in touch with ${siteConfig.name}.` });
  const [params] = useSearchParams();
  const initialType = types.some((t) => t.value === params.get('type')) ? (params.get('type') as InquiryType) : 'general';
  const [form, setForm] = useState({ type: initialType, name: '', email: '', phone: '', subject: params.get('subject') ?? '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [failure, setFailure] = useState<string | null>(null);
  const [reference, setReference] = useState('');

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'sending' || form.website) return;
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more (at least 10 characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState('sending');
    setFailure(null);
    try {
      const res = await submitInquiry({ type: form.type, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), subject: form.subject.trim(), message: form.message.trim() });
      setReference(res.reference);
      setState('sent');
    } catch (err) {
      setFailure(getErrorMessage(err));
      setState('idle');
    }
  };

  const mapSrc = siteConfig.address ? `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed` : '';

  return (
    <section className="section page-top">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Contact</span>
          <h1>Let’s talk</h1>
          <p className="lede">Questions, quotes or project ideas — send us a message and we’ll reply soon.</p>
        </header>

        <div className="contact">
          <div className="panel glass">
            {state === 'sent' ? (
              <div className="contact__sent" role="status">
                <h2>Message sent</h2>
                <p>Thanks, {form.name.split(' ')[0]}. We’ll reply to {form.email}.</p>
                <p className="fine">Reference: <strong>{reference}</strong></p>
                <Link to="/products" className="btn btn--primary">Browse products</Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="form-grid">
                  <div className="field field--full">
                    <label className="field__label" htmlFor="ct-type">Inquiry type</label>
                    <select id="ct-type" className="select" value={form.type} onChange={set('type')}>
                      {types.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ct-name">Name <i>*</i></label>
                    <input id="ct-name" className="input" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />
                    {errors.name && <span className="field__error">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ct-email">Email <i>*</i></label>
                    <input id="ct-email" type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />
                    {errors.email && <span className="field__error">{errors.email}</span>}
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ct-phone">Phone</label>
                    <input id="ct-phone" type="tel" className="input" autoComplete="tel" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ct-subject">Subject</label>
                    <input id="ct-subject" className="input" value={form.subject} onChange={set('subject')} />
                  </div>
                  <div className="field field--full">
                    <label className="field__label" htmlFor="ct-message">Message <i>*</i></label>
                    <textarea id="ct-message" className="textarea" rows={6} maxLength={3000} value={form.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} />
                    {errors.message && <span className="field__error">{errors.message}</span>}
                  </div>
                  <div className="hp" aria-hidden><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label></div>
                </div>
                {failure && <p className="form-note form-note--error" role="alert">{failure}</p>}
                <button type="submit" className="btn btn--primary btn--lg" disabled={state === 'sending'} style={{ marginTop: 20 }}>
                  {state === 'sending' ? (<><span className="spinner" /> Sending…</>) : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <aside className="contact__side">
            <ul className="contact-list contact-list--lg">
              {siteConfig.email && <li><MailOutline /><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>}
              {siteConfig.phone && <li><PhoneOutlined /><a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}>{siteConfig.phone}</a></li>}
              {siteConfig.address && <li><PlaceOutlined /><span>{siteConfig.address}</span></li>}
            </ul>
            {siteConfig.socials.length > 0 && (
              <ul className="chips">
                {siteConfig.socials.map((s) => (<li key={s.id}><a className="chip" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>))}
              </ul>
            )}
            {mapSrc && (
              <div className="map">
                <iframe title="Our location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
