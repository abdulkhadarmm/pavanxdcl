import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import theme from '../../config/theme';
import siteConfig from '../../config/siteConfig';

export function CTASection({
  onExploreCourses
}) {
  const handleScrollToCourses = (e) => {
    e.preventDefault();
    if (onExploreCourses) {
      onExploreCourses();
    } else {
      const coursesSec = document.getElementById('courses');
      if (coursesSec) {
        coursesSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      style={{
        padding: '60px 40px 100px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <Card 
        hoverable={false}
        padding="60px 40px"
        style={{
          textAlign: 'center',
          background: 'rgba(18, 20, 29, 0.8)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '24px',
          boxShadow: theme.shadows.premium,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Glow node */}
        <div 
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 75%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              marginBottom: '16px', 
              color: '#fff',
              lineHeight: 1.2
            }}
          >
            Ready to Accelerate Your Tech Journey?
          </h2>
          
          <p 
            style={{ 
              color: theme.colors.textSecondary, 
              fontSize: '1.1rem', 
              maxWidth: '600px', 
              margin: '0 auto 36px',
              lineHeight: '1.6'
            }}
          >
            Join {siteConfig.shortName} today. Access all our structured study sessions, coding practice links, and interactive assessments.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={handleScrollToCourses} size="lg">
              Get Started Now &rarr;
            </Button>
            <a 
              href={siteConfig.socials.discord} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ textDecoration: 'none' }}
            >
              <Button variant="secondary" size="lg">
                Join Discord Server
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default CTASection;
