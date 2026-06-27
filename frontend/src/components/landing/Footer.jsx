import React from 'react';
import siteConfig from '../../config/siteConfig';

export function Footer() {
  const currentYear = 2025; // Matching screenshot's © 2025 exactly

  return (
    <footer
      style={{
        background: 'transparent',
        padding: '40px 20px 60px',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        color: '#64748b',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem'
      }}
    >

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
        className="footer-row"
      >
        {/* Left Side: Copyright text */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ lineHeight: '1.5', textAlign: 'left' }}>
            © {currentYear} {siteConfig.shortName} | Designed by <a href="mailto:abdulkhadarmm12@gmail.com" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-orange)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>Abdul Khadar M M</a>
          </span>
        </div>


        {/* Right Side: Links */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center'
          }}
        >
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            Instagram
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            {siteConfig.contact.email}
          </a>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            {siteConfig.contact.whatsapp}
          </a>
          <a
            href="#community"
            style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            Community
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;

