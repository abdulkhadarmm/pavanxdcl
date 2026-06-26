import React from 'react';
import theme from '../../config/theme';

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  style = {}
}) {
  const alignStyles = {
    textAlign: align,
    display: 'flex',
    flexDirection: 'column',
    alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
    marginBottom: '48px',
    ...style
  };

  return (
    <div style={alignStyles}>
      <h2 
        style={{ 
          fontSize: '2.2rem', 
          fontWeight: '800', 
          margin: 0,
          background: theme.gradients.text, 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}
      >
        {title}
      </h2>
      
      {/* Decorative colored glow line */}
      <div 
        style={{ 
          height: '4px', 
          width: '60px', 
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)', 
          borderRadius: '2px', 
          marginTop: '12px',
          marginBottom: '16px' 
        }} 
      />

      {subtitle && (
        <p 
          style={{ 
            color: theme.colors.textSecondary, 
            fontSize: '1.05rem', 
            maxWidth: '650px', 
            margin: 0,
            lineHeight: 1.6 
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
