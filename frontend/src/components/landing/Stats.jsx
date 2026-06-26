import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import AnimatedCounter from './AnimatedCounter';
import Card from '../ui/Card';

export function Stats() {
  const statsList = [
    { label: 'Active Learners', target: siteConfig.stats.activeStudents, suffix: '+' },
    { label: 'Courses Created', target: siteConfig.stats.coursesAvailable, suffix: '+' },
    { label: 'Coding Practice Problems', target: siteConfig.stats.practiceQuestions, suffix: '+' },
    { label: 'Placement Rate', target: siteConfig.stats.placementRate, suffix: '%' }
  ];

  return (
    <section 
      style={{
        maxWidth: '1200px',
        margin: '-60px auto 80px',
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}
      >
        {statsList.map((stat, idx) => (
          <Card 
            key={idx} 
            hoverable={true} 
            padding="24px"
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '120px'
            }}
          >
            <span 
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                display: 'block'
              }}
            >
              <AnimatedCounter 
                target={stat.target.replace(/[^0-9.]/g, '')} 
                suffix={stat.suffix} 
              />
            </span>
            <span 
              style={{ 
                color: theme.colors.textSecondary, 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}
            >
              {stat.label}
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default Stats;
