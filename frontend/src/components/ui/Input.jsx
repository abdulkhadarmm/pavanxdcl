import React from 'react';
import theme from '../../config/theme';

export function Input({
  label,
  id,
  type = 'text',
  error,
  required = false,
  style = {},
  containerStyle = {},
  className = '',
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label 
          htmlFor={id} 
          style={{ 
            display: 'block', 
            fontSize: '0.85rem', 
            fontWeight: '500', 
            marginBottom: '8px', 
            color: error ? theme.colors.rose : theme.colors.textSecondary 
          }}
        >
          {label} {required && <span style={{ color: theme.colors.rose }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${error ? theme.colors.rose : theme.colors.border}`,
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.95rem',
          transition: theme.transitions.smooth,
          outline: 'none',
          ...style
        }}
        className={`form-input ${className}`}
        {...props}
      />
      {error && (
        <span style={{ color: theme.colors.rose, fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
