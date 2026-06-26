import React from 'react';
import theme from '../../config/theme';

export function Card({
  children,
  accent, // 'blue' | 'emerald' | 'royal' | 'amber' | 'rose' (optional top border accent color)
  hoverable = true,
  padding = '24px',
  style = {},
  className = '',
  onClick,
  ...props
}) {
  const cardStyles = {
    background: theme.colors.bgCard,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.premium,
    borderRadius: '16px',
    padding: padding,
    position: 'relative',
    overflow: 'hidden',
    transition: theme.transitions.smooth,
    cursor: onClick ? 'pointer' : 'default',
    ...style
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
      onClick={onClick}
      style={cardStyles}
      className={`glass-container ${hoverable ? 'glass-card' : ''} ${className}`}
      {...props}
    >
      {accent && borderAccentMap[accent] && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(135deg, ${borderAccentMap[accent]} 0%, rgba(255,255,255,0) 100%)`
          }}
        />
      )}
      {children}
    </div>
  );
}

export default Card;
