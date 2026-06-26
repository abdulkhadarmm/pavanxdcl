import React, { useState } from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import Button from '../ui/Button';

export function Navbar({
  currentView,
  onViewChange,
  style = {}
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Courses', href: '#courses' },
    { label: 'Community', href: '#community' },
    { label: 'FAQ', href: '#faq' }
  ];

  const handleScroll = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        borderBottom: `1px solid ${theme.colors.border}`,
        background: 'rgba(9, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        ...style
      }}
    >
      {/* Brand logo container */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => {
          const hero = document.getElementById('hero');
          if (hero) hero.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: '800', 
            fontSize: '1.25rem', 
            color: '#fff',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)'
          }}
        >
          X
        </div>
        <span 
          style={{ 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            letterSpacing: '-0.02em',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.1
          }}
        >
          {siteConfig.shortName}
          <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '0.75rem', letterSpacing: '0px' }}>
            Coding Lab
          </span>
        </span>
      </div>

      {/* Desktop navigation */}
      <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-only-nav">
        <ul style={{ display: 'flex', listStyle: 'none', gap: '24px', margin: 0, padding: 0 }}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                style={{
                  color: theme.colors.textSecondary,
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  transition: theme.transitions.smooth
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseOut={(e) => (e.currentTarget.style.color = theme.colors.textSecondary)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Button
            variant={currentView === 'public' ? 'primary' : 'secondary'}
            onClick={() => onViewChange('public')}
            size="sm"
          >
            Portal Home
          </Button>
          <Button
            variant={currentView === 'admin' ? 'primary' : 'secondary'}
            onClick={() => onViewChange('admin')}
            size="sm"
          >
            Admin Panel
          </Button>
        </div>
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
            backgroundColor: 'rgba(9, 10, 15, 0.98)',
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
                  onClick={(e) => handleScroll(e, link.href)}
                  style={{
                    color: theme.colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    display: 'block'
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={currentView === 'public' ? 'primary' : 'secondary'}
              onClick={() => {
                onViewChange('public');
                setMobileMenuOpen(false);
              }}
              style={{ flexGrow: 1 }}
              size="sm"
            >
              Portal Home
            </Button>
            <Button
              variant={currentView === 'admin' ? 'primary' : 'secondary'}
              onClick={() => {
                onViewChange('admin');
                setMobileMenuOpen(false);
              }}
              style={{ flexGrow: 1 }}
              size="sm"
            >
              Admin Panel
            </Button>
          </div>
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
