import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import AnimatedCounter from './AnimatedCounter';

export function Hero({
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

  const statsList = [
    { label: 'DSA Problems', target: '500', suffix: '+' },
    { label: 'Placement Focused', target: '100', suffix: '%' },
    { label: 'Active Learners', target: '2000', suffix: '+' },
    { label: 'Mentorship', target: 'Live', suffix: '', isStatic: true }
  ];

  return (
    <section 
      id="hero"
      className="animate-fade-in"
      style={{
        padding: '60px 20px 45px',
        position: 'relative',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >

      {/* Container */}
      <div style={{ maxWidth: '900px', width: '100%' }}>
        
        {/* Top Badge/Pill */}
        <div style={{ marginBottom: '24px' }}>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(249, 115, 22, 0.06)',
              border: '1px solid rgba(249, 115, 22, 0.15)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--accent-orange)',
              letterSpacing: '0.02em'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-orange)' }}></span>
            PavanxDCL — Live & Active
          </span>
        </div>

        {/* Heading */}
        <h1 
          style={{
            fontSize: '4.8rem',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            fontFamily: 'var(--font-sans)',
            color: '#fff'
          }}
          className="hero-title"
        >
          Break the Matrix.<br />
          Master <span style={{ color: 'var(--accent-orange)', textShadow: '0 0 40px rgba(249, 115, 22, 0.15)' }}>the Code.</span>
        </h1>

        {/* Subtitle / Description */}
        <p 
          style={{
            fontSize: '1.15rem',
            lineHeight: '1.7',
            color: theme.colors.textSecondary,
            marginBottom: '30px',
            maxWidth: '720px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: 400
          }}
        >
          DSA Forge • LeetCode Arena • Aptitude Lab — everything you need to crack
          placements and dominate FAANG interviews with <strong>PavanxDCL</strong> mentorship.
        </p>

        {/* CTA Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '45px' 
        }}>
          <button
            onClick={handleScrollToCourses}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              padding: '16px 36px',
              fontSize: '0.98rem',
              fontWeight: '700',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(249, 115, 22, 0.35)',
              transition: 'var(--transition-smooth)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(249, 115, 22, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(249, 115, 22, 0.35)';
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '2px' }}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            Scroll Down to Start Grinding ↓
          </button>
        </div>


        {/* Stats Row */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '40px',
            width: '100%',
            maxWidth: '850px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
          className="stats-grid"
        >
          {statsList.map((stat, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span 
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#fff',
                  lineHeight: '1.2',
                  display: 'block'
                }}
              >
                {stat.isStatic ? (
                  stat.target
                ) : (
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                )}
              </span>
              <span 
                style={{ 
                  color: '#64748b', 
                  fontSize: '0.78rem', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  marginTop: '8px',
                  lineHeight: '1.3'
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.8rem !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;

