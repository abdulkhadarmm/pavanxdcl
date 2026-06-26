import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';

export function AboutSection() {
  return (
    <section 
      id="about" 
      style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)'
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '50px',
          alignItems: 'center'
        }}
        className="about-grid"
      >
        {/* Left Side: Brand Pedigree Details */}
        <div className="animate-slide-up">
          <span 
            style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: theme.colors.blue,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px'
            }}
          >
            Who We Are
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '20px', color: '#fff', lineHeight: 1.2 }}>
            About {siteConfig.companyName}
          </h2>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '20px' }}>
            At **{siteConfig.companyName} ({siteConfig.shortName})**, we believe that programming is not just about memorizing syntax; it is about building clean mental frameworks and software design foundations. 
          </p>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '20px' }}>
            Established to bridge the gap between classroom theory and industry-grade engineering, we provide students with hands-on practice, comprehensive curriculum trees, and interactive question-answering systems. 
          </p>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', lineHeight: '1.7', margin: 0 }}>
            Every module, resource link, and test question is curated by expert mentors and updated dynamically, ensuring our learners stay in sync with product-based company interview formats.
          </p>
        </div>

        {/* Right Side: Decorative Pedagogy stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="about-stats-grid">
          
          <div 
            className="glass-container" 
            style={{ 
              padding: '24px', 
              textAlign: 'center', 
              borderLeft: `4px solid ${theme.colors.blue}` 
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Curated Material</h4>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              Handpicked problems, downloadable resources, and reference templates.
            </p>
          </div>

          <div 
            className="glass-container" 
            style={{ 
              padding: '24px', 
              textAlign: 'center', 
              borderLeft: `4px solid ${theme.colors.emerald}` 
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚙️</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Dynamic Refreshes</h4>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              Curricula modified directly via the Admin panel in real-time.
            </p>
          </div>

          <div 
            className="glass-container" 
            style={{ 
              padding: '24px', 
              textAlign: 'center', 
              borderLeft: `4px solid ${theme.colors.royal}` 
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Community Circles</h4>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              Solve questions alongside peers on Discord and WhatsApp channels.
            </p>
          </div>

          <div 
            className="glass-container" 
            style={{ 
              padding: '24px', 
              textAlign: 'center', 
              borderLeft: `4px solid ${theme.colors.rose}` 
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚀</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Placement Ready</h4>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              Focus on problem-solving patterns required to clear product interviews.
            </p>
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .about-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default AboutSection;
