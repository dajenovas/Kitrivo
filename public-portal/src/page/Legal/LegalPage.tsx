import { siteConfig } from '@/config/site';
import { useSeo } from '@/hooks/useSeo';

const content = {
  terms: {
    title: 'Terms of Use',
    sections: [
      ['Using this website', `This website presents the products and projects of ${siteConfig.name}. Information is provided in good faith and may change without notice.`],
      ['Orders and quotes', 'Submitting an order or quote request is a request only. It is confirmed once our team has reviewed it and agreed pricing, availability and timelines with you. No payment is taken on this website.'],
      ['Pricing and availability', 'Prices and availability shown are indicative and may be updated. Items marked “price on request” are priced individually.'],
      ['Intellectual property', 'Text, images, models and designs on this website belong to their respective owners and may not be reused without permission.'],
      ['Contact', 'Questions about these terms can be sent through the contact page.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'When you place an order, request a quote or send an inquiry we collect the details you enter: your name, email, phone number, delivery address (if given) and the contents of your message or order.'],
      ['How we use it', 'We use this information only to respond to you, prepare quotes, fulfil orders and provide support.'],
      ['Your cart', 'Your cart is stored in your browser on your own device so it is still there when you return. It is cleared when you submit an order or clear it yourself.'],
      ['Sharing', 'We do not sell your information. We share it only with providers who help us fulfil your request, or where the law requires.'],
      ['Your choices', 'You can ask us to access, correct or delete your information at any time through the contact page.'],
    ],
  },
} as const;

const LegalPage = ({ kind }: { kind: keyof typeof content }) => {
  const page = content[kind];
  useSeo({ title: page.title });
  return (
    <section className="section page-top">
      <div className="container legal">
        <header className="page-head"><span className="eyebrow">Legal</span><h1>{page.title}</h1></header>
        {page.sections.map(([h, p]) => (
          <div key={h}><h2>{h}</h2><p className="lede">{p}</p></div>
        ))}
      </div>
    </section>
  );
};

export default LegalPage;
