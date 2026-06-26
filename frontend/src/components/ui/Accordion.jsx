import React, { useState } from 'react';
import theme from '../../config/theme';

export function Accordion({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  style = {},
  headerStyle = {},
  bodyStyle = {},
  className = '',
  accent, // 'blue' | 'emerald' | 'royal' | 'amber' | 'rose'
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const borderAccentMap = {
    blue: theme.colors.blue,
    emerald: theme.colors.emerald,
    royal: theme.colors.royal,
    amber: theme.colors.amber,
    rose: theme.colors.rose
  };

  return (
    <div
      className={`glass-container ${className}`}
      style={{
        overflow: 'hidden',
        borderLeft: accent && borderAccentMap[accent] ? `4px solid ${borderAccentMap[accent]}` : `1px solid ${theme.colors.border}`,
        transition: theme.transitions.smooth,
        ...style
      }}
      {...props}
    >
      {/* Header / Trigger */}
      <div
        onClick={toggle}
        className={`accordion-header ${isOpen ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          cursor: 'pointer',
          transition: theme.transitions.smooth,
          borderBottom: isOpen ? `1px solid ${theme.colors.border}` : 'none',
          ...headerStyle
        }}
      >
        <div style={{ flexGrow: 1, paddingRight: '12px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#fff', margin: 0 }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '0.82rem', color: theme.colors.textSecondary, marginTop: '4px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: theme.transitions.smooth,
            color: theme.colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Body Content */}
      {isOpen && (
        <div
          className="accordion-body animate-slide-up"
          style={{
            background: 'rgba(0, 0, 0, 0.15)',
            padding: '24px',
            ...bodyStyle
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
