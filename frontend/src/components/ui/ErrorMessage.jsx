import React from 'react';
import theme from '../../config/theme';
import Button from './Button';

export function ErrorMessage({
  title = 'An error occurred',
  message = 'We could not fetch the requested data. Please try again later.',
  onRetry,
  style = {}
}) {
  return (
    <div
      className="glass-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        border: '1px solid rgba(244, 63, 94, 0.2)',
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderRadius: '12px',
        maxWidth: '600px',
        margin: '20px auto',
        textAlign: 'center',
        ...style
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.4rem' }}>⚠️</span>
        <h4 style={{ color: theme.colors.rose, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
          {title}
        </h4>
      </div>
      <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', lineHeight: '1.5', marginBottom: onRetry ? '16px' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="danger">
          Retry Request
        </Button>
      )}
    </div>
  );
}

export default ErrorMessage;
