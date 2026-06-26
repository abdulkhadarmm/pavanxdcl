import React, { useState } from 'react';
import siteConfig from '../../config/siteConfig';
import theme from '../../config/theme';
import SectionHeading from '../shared/SectionHeading';
import Card from '../ui/Card';

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reviews = siteConfig.testimonials || [];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  if (reviews.length === 0) return null;
  const current = reviews[activeIndex];

  return (
    <section 
      id="testimonials"
      style={{
        padding: '80px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <SectionHeading 
        title="Student Success Reviews"
        subtitle="Read the firsthand learning experiences of engineers who transformed their profiles at our academy."
      />

      <div style={{ position: 'relative', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: '-10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${theme.colors.border}`,
            color: '#fff',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: theme.transitions.smooth
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
        >
          ❮
        </button>

        {/* Testimonial Panel */}
        <div className="animate-fade-in" key={activeIndex} style={{ width: '100%', maxWidth: '780px', padding: '0 40px' }}>
          <Card hoverable={true} padding="40px" style={{ position: 'relative' }}>
            <div style={{ fontSize: '3rem', position: 'absolute', top: '10px', left: '20px', opacity: 0.08, fontFamily: 'serif' }}>
              “
            </div>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#fff', fontStyle: 'italic', marginBottom: '24px' }}>
              "{current.text}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <img 
                src={current.avatar} 
                alt={current.name} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.colors.blue}` }} 
              />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#fff', fontSize: '0.98rem', fontWeight: '700', margin: 0 }}>
                  {current.name}
                </h4>
                <p style={{ color: theme.colors.textSecondary, fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                  {current.role}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '16px' }}>
              {Array.from({ length: current.rating }).map((_, i) => (
                <span key={i} style={{ color: theme.colors.amber, fontSize: '1.1rem' }}>★</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: '-10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${theme.colors.border}`,
            color: '#fff',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: theme.transitions.smooth
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
        >
          ❯
        </button>

      </div>

      {/* Carousel dots indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activeIndex === idx ? theme.colors.blue : 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: theme.transitions.smooth
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
