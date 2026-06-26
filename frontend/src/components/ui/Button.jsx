import React from 'react';
import theme from '../../config/theme';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  style = {},
  className = '',
  icon,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#fff',
          border: `1px solid ${theme.colors.border}`,
        };
      case 'danger':
        return {
          background: 'rgba(244, 63, 94, 0.1)',
          color: '#f87171',
          border: '1px solid rgba(244, 63, 94, 0.2)',
        };
      case 'primary':
      default:
        return {
          background: 'var(--theme-grad, linear-gradient(135deg, #f97316 0%, #ff7a00 100%))',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 14px 0 var(--theme-glow, rgba(249, 115, 22, 0.3))',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem', borderRadius: '10px' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px' };
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: theme.transitions.smooth,
    gap: '8px',
    opacity: disabled || loading ? 0.6 : 1,
    outline: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      style={baseStyles}
      className={`btn ${className}`}
      {...props}
    >
      {loading ? (
        <span 
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      ) : icon}
      {children}
    </button>
  );
}

export default Button;
