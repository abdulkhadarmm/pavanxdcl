import React from 'react';
import Card from '../ui/Card';
import theme from '../../config/theme';

export function FeatureCard({
  icon,
  title,
  description,
  accent = 'blue',
  style = {}
}) {
  return (
    <Card 
      accent={accent} 
      hoverable={true} 
      padding="30px" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style
      }}
    >
      <div 
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: '20px',
          color: theme.colors[accent] || '#fff',
          boxShadow: `0 4px 10px rgba(0,0,0,0.1)`
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
        {title}
      </h3>
      <p style={{ color: theme.colors.textSecondary, fontSize: '0.92rem', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>
        {description}
      </p>
    </Card>
  );
}

export default FeatureCard;
