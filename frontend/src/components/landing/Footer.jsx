import React from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      style={{
        borderTop: `1px solid ${theme.colors.border}`,
        background: 'rgba(9, 10, 15, 0.95)',
        padding: '60px 40px 30px',
        color: theme.colors.textSecondary,
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}
      >
        {/* Column 1: Brand details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '8px', 
                background: theme.gradients.hero, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '800', 
                fontSize: '1rem', 
                color: '#fff' 
              }}
            >
              X
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
              {siteConfig.companyName}
            </span>
          </div>
          <p style={{ lineHeight: '1.6', fontSize: '0.88rem', marginBottom: '20px' }}>
            {siteConfig.description}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {Object.entries(siteConfig.socials).map(([key, url]) => {
              if (!url) return null;
              // Map keys to emoji or symbols
              const icons = {
                whatsapp: '💬',
                discord: '🎮',
                telegram: '✈️',
                instagram: '📸',
                linkedin: '👔',
                youtube: '📺',
                github: '🐙'
              };
              return (
                <a 
                  key={key} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    textDecoration: 'none',
                    transition: theme.transitions.smooth
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = theme.colors.blue;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  title={key}
                >
                  {icons[key] || '🔗'}
                </a>
              );
            })}
          </div>
        </div>

        {/* Column 2: Quick links */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '18px', fontWeight: '600' }}>Platform Hub</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><a href="#hero" style={{ color: 'inherit', textDecoration: 'none' }}>Home / Overview</a></li>
            <li><a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>About the Academy</a></li>
            <li><a href="#why-us" style={{ color: 'inherit', textDecoration: 'none' }}>Why Choose PavanXDCL</a></li>
            <li><a href="#courses" style={{ color: 'inherit', textDecoration: 'none' }}>Course Explorer</a></li>
            <li><a href="#community" style={{ color: 'inherit', textDecoration: 'none' }}>Community Forums</a></li>
            <li><a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs & Help</a></li>
          </ul>
        </div>

        {/* Column 3: Contact coordinates */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '18px', fontWeight: '600' }}>Contact Info</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <li style={{ display: 'flex', gap: '10px' }}>
              <span>📧</span>
              <a href={`mailto:${siteConfig.contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {siteConfig.contact.email}
              </a>
            </li>
            <li style={{ display: 'flex', gap: '10px' }}>
              <span>💬</span>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {siteConfig.contact.whatsapp}
              </a>
            </li>
            <li style={{ display: 'flex', gap: '10px', lineHeight: 1.4 }}>
              <span>📍</span>
              <span>{siteConfig.contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Under footer */}
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.8rem'
        }}
      >
        <span>
          © {currentYear} {siteConfig.companyName} ({siteConfig.shortName}). All rights reserved.
        </span>
        <span style={{ display: 'flex', gap: '16px' }}>
          <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
