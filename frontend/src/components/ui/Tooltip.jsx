import React, { useState } from 'react';
import theme from '../../config/theme';

export function Tooltip({
  children,
  content,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  style = {}
}) {
  const [active, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        };
      case 'left':
        return {
          top: '50%',
          right: '100%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        };
      case 'right':
        return {
          top: '50%',
          left: '100%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        };
      case 'top':
      default:
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
    }
  };

  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        ...style
      }}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && content && (
        <div
          style={{
            position: 'absolute',
            padding: '6px 10px',
            color: '#fff',
            background: '#12141d',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: 'var(--shadow-premium)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            fontWeight: 500,
            ...getPositionStyles()
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
