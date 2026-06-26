import React from 'react';
import Button from './Button';
import theme from '../../config/theme';

export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger' // 'danger' | 'warning' | 'primary'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div 
        className="glass-container modal-content"
        style={{
          width: '90%',
          maxWidth: '450px',
          padding: '28px',
          backgroundColor: 'rgba(18, 20, 29, 0.95)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          boxShadow: theme.shadows.premium,
          textAlign: 'center',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
          {variant === 'danger' ? '⚠️' : '❓'}
        </div>
        
        <h3 
          id="confirm-dialog-title" 
          style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px', color: '#fff' }}
        >
          {title}
        </h3>
        
        <p style={{ color: theme.colors.textSecondary, fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button 
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
