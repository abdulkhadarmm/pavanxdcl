import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import FeatureCard from './FeatureCard';

export function Features() {
  const featureList = [
    {
      icon: '🧠',
      title: 'Data Structures & Algorithms',
      description: 'Master binary trees, graphs, sorting, searching, recursion, and dynamic programming with clean, step-by-step logic.',
      accent: 'blue'
    },
    {
      icon: '💻',
      title: 'Programming Languages',
      description: 'Deep dive into object-oriented concepts, syntax models, and runtime internals of languages like Java, JavaScript, and Python.',
      accent: 'royal'
    },
    {
      icon: '🌐',
      title: 'Web Development',
      description: 'Build premium responsive frontends and APIs with core HTML5, vanilla CSS3, JavaScript, React.js, and backend integration.',
      accent: 'emerald'
    },
    {
      icon: '📈',
      title: 'Aptitude Preparation',
      description: 'Strengthen quantitative analysis, logical reasoning, and verbal aptitude required for top engineering recruitment rounds.',
      accent: 'amber'
    },
    {
      icon: '👔',
      title: 'Interview Preparation',
      description: 'Go through mock technical assessments, behavior guides, resume building tips, and mock whiteboard sessions.',
      accent: 'rose'
    },
    {
      icon: '🎓',
      title: 'Placement Assistance',
      description: 'Track placement statistics, connect with alumni working at product firms, and access placement support pipelines.',
      accent: 'blue'
    }
  ];

  return (
    <section 
      id="features" 
      style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <SectionHeading 
        title="Our Training Domains"
        subtitle="We provide a structured roadmap across core computing sciences to convert learners into domain experts."
      />
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '28px'
        }}
        className="features-grid"
      >
        {featureList.map((feat, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <FeatureCard 
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              accent={feat.accent}
            />
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Features;
