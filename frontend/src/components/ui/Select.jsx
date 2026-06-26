import React from 'react';
import theme from '../../config/theme';

export function Select({
  label,
  id,
  options = [], // [{ value: '...', label: '...' }] or string array
  error,
  required = false,
  style = {},
  containerStyle = {},
  className = '',
  placeholder,
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
      <select
        id={id}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(18, 20, 29, 0.95)', // Solid background for select elements in dark mode to ensure option readability
          border: `1px solid ${error ? theme.colors.rose : theme.colors.border}`,
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.95rem',
          transition: theme.transitions.smooth,
          outline: 'none',
          cursor: 'pointer',
          ...style
        }}
        className={`form-select ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled style={{ background: '#12141d', color: theme.colors.textMuted }}>
            {placeholder}
          </option>
        )}
        {options.map((opt, index) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={index} value={val} style={{ background: '#12141d', color: '#fff' }}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <span style={{ color: theme.colors.rose, fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Select;
