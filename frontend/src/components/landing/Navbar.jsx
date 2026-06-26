import React, { useState } from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';

export function Navbar({
  currentView,
  onViewChange,
  style = {}
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Courses', href: '#courses', isScroll: true },
    { label: 'Community', href: '#community', isScroll: true },
    { label: 'Instagram', href: siteConfig.socials.instagram || 'https://instagram.com/pavanxdcl', isScroll: false }
  ];


  const handleLinkClick = (e, link) => {
    setMobileMenuOpen(false);
    if (link.isAdmin) {
      e.preventDefault();
      onViewChange('admin');
      return;
    }
    if (link.isScroll) {
      e.preventDefault();
      onViewChange('public');
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      // Delay slightly if we are changing view back to public
      setTimeout(() => {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <header 
      className="nav-header animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '70px',
        background: 'transparent',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        ...style
      }}
    >

      {/* Brand logo container */}
      <div 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => {
          onViewChange('public');
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
          setTimeout(() => {
            const hero = document.getElementById('hero');
            if (hero) hero.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      >
        <span 
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: '900', 
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1
          }}
        >
          <span style={{ color: '#fff' }}>PAVAN</span>
          <span style={{ color: 'var(--accent-orange)' }}>XDCL</span>
        </span>
      </div>

      {/* Desktop navigation */}
      <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-only-nav">
        <ul style={{ display: 'flex', listStyle: 'none', gap: '32px', margin: 0, padding: 0 }}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.isScroll ? '_self' : '_blank'}
                rel={link.isScroll ? '' : 'noopener noreferrer'}
                onClick={(e) => handleLinkClick(e, link)}
                style={{
                  color: link.isAdmin && currentView === 'admin' ? 'var(--accent-orange)' : theme.colors.textSecondary,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: theme.transitions.smooth
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-orange)')}
                onMouseOut={(e) => (e.currentTarget.style.color = link.isAdmin && currentView === 'admin' ? 'var(--accent-orange)' : theme.colors.textSecondary)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'none', // Managed by responsive CSS below
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '6px'
        }}
        className="mobile-toggle"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(10, 9, 8, 0.98)',
            borderBottom: `1px solid ${theme.colors.border}`,
            padding: '20px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 999
          }}
        >
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none', padding: 0, margin: 0 }}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.isScroll ? '_self' : '_blank'}
                  rel={link.isScroll ? '' : 'noopener noreferrer'}
                  onClick={(e) => handleLinkClick(e, link)}
                  style={{
                    color: link.isAdmin && currentView === 'admin' ? 'var(--accent-orange)' : theme.colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    display: 'block'
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CSS overrides for navbar responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-only-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </header>
  );
}

export default Navbar;

