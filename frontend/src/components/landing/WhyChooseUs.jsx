import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import Card from '../ui/Card';
import theme from '../../config/theme';

export function WhyChooseUs() {
  const pillars = [
    {
      icon: '🗺️',
      title: 'Structured Roadmaps',
      description: 'Zero guesswork. Walk through logical step-by-step curricula created to guide you from basic variables to advanced design patterns.',
      accent: 'blue'
    },
    {
      icon: '🎯',
      title: 'Industry Focused',
      description: 'Forget purely academic exercises. Work on real production architectures, RESTful structures, and database engines used by corporate teams.',
      accent: 'emerald'
    },
    {
      icon: '💼',
      title: 'Placement Preparation',
      description: 'Gain recruitment readiness. Solve high-frequency questions commonly asked in engineering hiring pipelines for top product firms.',
      accent: 'amber'
    },
    {
      icon: '🛠️',
      title: 'Practical Learning',
      description: 'Hands-on practice. Access curated practice links, file assets, downloadable coding templates, and dynamic MCQ question banks.',
      accent: 'rose'
    },
    {
      icon: '👥',
      title: 'Community Support',
      description: 'Never learn alone. Engage with peer groups, ask questions, review codes, and grow together in a community of tech learners.',
      accent: 'royal'
    },
    {
      icon: '🔄',
      title: 'Regular Updates',
      description: 'Always current. Benefit from curriculum and question banks dynamically refreshed by administrators to match market demands.',
      accent: 'blue'
    }
  ];

  return (
    <section 
      id="why-us" 
      style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
      }}
    >
      <SectionHeading 
        title="Why Learn With Us?"
        subtitle="We build structural environments rather than just loading lectures. Experience coding training designed for outcomes."
      />
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}
        className="why-us-grid"
      >
        {pillars.map((pillar, idx) => (
          <Card 
            key={idx} 
            hoverable={true} 
            padding="24px"
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            <div 
              style={{
                fontSize: '1.8rem',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {pillar.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                {pillar.title}
              </h3>
              <p style={{ color: theme.colors.textSecondary, fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                {pillar.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .why-us-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default WhyChooseUs;
