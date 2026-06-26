import React from 'react';

export function Badge({
  children,
  type = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'learning' | 'qbank' | 'low' | 'medium' | 'high'
  style = {},
  className = '',
  ...props
}) {
  const getBadgeClass = () => {
    switch (type.toLowerCase()) {
      case 'learning':
        return 'badge-learning';
      case 'question_bank':
      case 'qbank':
        return 'badge-qbank';
      case 'low':
      case 'easy':
      case 'success':
        return 'badge-low';
      case 'medium':
      case 'warning':
        return 'badge-medium';
      case 'high':
      case 'hard':
      case 'danger':
        return 'badge-high';
      case 'info':
      default:
        return 'badge-learning';
    }
  };

  return (
    <span
      className={`badge ${getBadgeClass()} ${className}`}
      style={{
        display: 'inline-block',
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
