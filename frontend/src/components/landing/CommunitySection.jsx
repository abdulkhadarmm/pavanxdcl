import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';

export function CommunitySection() {
  const whatsappUrl = siteConfig.socials.whatsapp || 'https://chat.whatsapp.com/example-whatsapp-link';

  return (
    <section 
      id="community" 
      style={{
        padding: '60px 20px 80px',
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center'
      }}
    >

      <div 
        style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: '#121111',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '50px 40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Neon Glow Blob for depth */}
        <div 
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)',
            filter: 'blur(20px)',
            bottom: '-20px',
            right: '-20px',
            pointerEvents: 'none'
          }}
        />

        <h2 
          style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            color: '#fff',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Join the Official PavanxDCL<br />Community Hub
        </h2>

        <p 
          style={{
            fontSize: '1.02rem',
            lineHeight: '1.65',
            color: theme.colors.textSecondary,
            maxWidth: '580px',
            marginBottom: '36px',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Live DSA, Aptitude & Coding sessions — direct access to Pavan and the grind squad.
          Get updates on pavanx placements, coding challenges & more.
        </p>

        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            textDecoration: 'none',
            display: 'inline-flex'
          }}
        >
          <button
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249, 115, 22, 0.25)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.25)';
            }}
          >
            {/* SVG Chat Bubble Icon */}
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Join on WhatsApp (pavanxdcl)
          </button>
        </a>
      </div>
    </section>
  );
}

export default CommunitySection;

