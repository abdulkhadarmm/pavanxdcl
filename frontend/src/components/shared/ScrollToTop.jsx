import React, { useState, useEffect } from 'react';
import theme from '../../config/theme';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'rgba(18, 20, 29, 0.85)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: 'var(--shadow-premium)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        transition: theme.transitions.smooth,
        fontSize: '1.2rem',
        outline: 'none'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'var(--theme-grad, linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%))';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(59, 130, 246, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(18, 20, 29, 0.85)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
      }}
      aria-label="Scroll to top"
    >
      ▲
    </button>
  );
}

export default ScrollToTop;
