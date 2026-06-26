import React from 'react';
import siteConfig from '../../config/siteConfig';
import SectionHeading from '../shared/SectionHeading';
import Accordion from '../ui/Accordion';

export function FAQ() {
  const faqs = siteConfig.faqs || [];

  return (
    <section 
      id="faq" 
      style={{
        padding: '80px 40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <SectionHeading 
        title="Frequently Asked Questions"
        subtitle="Find rapid answers regarding platform curriculum access, dynamic content rendering, and account paths."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq) => (
          <Accordion 
            key={faq.id} 
            title={faq.question}
            accent="blue"
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
              {faq.answer}
            </p>
          </Accordion>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
