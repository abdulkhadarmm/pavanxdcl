import React from 'react';
import theme from '../../config/theme';
import Button from './Button';

export function EmptyState({
  title = 'No records found',
  message = 'Get started by creating a new entry or adjust your search filters.',
  actionText,
  onAction,
  icon = '📂',
  style = {}
}) {
  return (
    <div
      className="glass-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 30px',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        borderStyle: 'dashed',
        borderWidth: '1px',
        borderRadius: '16px',
        maxWidth: '600px',
        margin: '20px auto',
        ...style
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.8 }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
        {title}
      </h3>
      <p style={{ color: theme.colors.textSecondary, fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '400px', marginBottom: '24px' }}>
        {message}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
