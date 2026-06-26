import React, { useState, useEffect, useRef } from 'react';

export function AnimatedCounter({
  target, // e.g. "1200" or "94.8"
  duration = 2000, // ms
  suffix = ''
}) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(numericTarget)) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp = null;
          const isFloat = target.includes('.');

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = progress * numericTarget;
            
            setCount(isFloat ? currentVal.toFixed(1) : Math.floor(currentVal));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target); // Ensure precise target at the end
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [target, duration]);

  return (
    <span ref={elementRef}>
      {count}{suffix}
    </span>
  );
}

export default AnimatedCounter;
