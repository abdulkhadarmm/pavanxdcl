import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import Button from '../ui/Button';
import heroImg from '../../assets/images/hero.png';

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

  const handleScrollToCommunity = (e) => {
    e.preventDefault();
    const commSec = document.getElementById('community');
    if (commSec) {
      commSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero"
      className="animate-fade-in"
      style={{
        padding: '120px 40px 100px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}
        className="hero-grid"
      >
        {/* Left Col: Headings & Buttons */}
        <div>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#60a5fa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}
          >
            🚀 Launching Your Tech Career
          </span>

          <h1 
            style={{
              fontSize: '3.6rem',
              fontWeight: '800',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome to <br />
            <span style={{ background: theme.gradients.hero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {siteConfig.companyName}
            </span>
          </h1>

          <p 
            style={{
              fontSize: '1.15rem',
              lineHeight: '1.7',
              color: theme.colors.textSecondary,
              marginBottom: '36px',
              maxWidth: '520px'
            }}
          >
            Master <strong>Data Structures &amp; Algorithms (DSA)</strong>, 
            <strong> Web Development</strong>, and <strong>Aptitude</strong>. 
            Step into structured learning paths and dynamic assessments. Evolve from syntax to production-ready engineering.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button onClick={handleScrollToCourses} size="lg">
              Explore Courses &rarr;
            </Button>
            <Button onClick={handleScrollToCommunity} variant="secondary" size="lg">
              Join Community
            </Button>
          </div>
        </div>

        {/* Right Col: Graphic Illustration */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
          className="hero-graphic"
        >
          {/* Neon background blur nodes */}
          <div 
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
              top: '-50px',
              right: '-50px',
              zIndex: 1
            }}
          />
          <div 
            style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
              bottom: '-30px',
              left: '-30px',
              zIndex: 1
            }}
          />

          {/* Core Graphic */}
          <div 
            className="animate-float" 
            style={{ 
              zIndex: 2, 
              position: 'relative',
              borderRadius: '24px',
              border: `1px solid ${theme.colors.border}`,
              padding: '8px',
              background: 'rgba(255,255,255,0.01)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <img 
              src={heroImg} 
              alt={`${siteConfig.companyName} Premium Portal`} 
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '16px',
                objectFit: 'cover',
                boxShadow: theme.shadows.premium
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid h1 {
            font-size: 2.5rem !important;
          }
          .hero-grid p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-grid div {
            justifyContent: center;
          }
          .hero-graphic {
            margin-top: 40px;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
