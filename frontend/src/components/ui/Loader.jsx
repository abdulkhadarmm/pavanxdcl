import React from 'react';
import theme from '../../config/theme';

export function Loader({
  size = 'md', // 'sm' | 'md' | 'lg'
  fullPage = false,
  text = 'Loading...',
  color = 'var(--accent-blue)',
  style = {}
}) {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return { width: '20px', height: '20px', borderWidth: '2px' };
      case 'lg': return { width: '60px', height: '60px', borderWidth: '4px' };
      case 'md':
      default:
        return { width: '40px', height: '40px', borderWidth: '3px' };
    }
  };

  const spinnerStyle = {
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...getSpinnerSize(),
    ...style
  };

  const containerStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    gap: '16px'
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '12px'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {text && (
        <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', fontWeight: 500 }}>
          {text}
        </span>
      )}
    </div>
  );
}

export default Loader;
