import React, { useState, useEffect } from 'react';
import moduleService from '../../services/moduleService';
import sessionService from '../../services/sessionService';
import questionService from '../../services/questionService';
import theme from '../../config/theme';

export function CourseCard({
  course,
  onSelect
}) {
  const [itemCount, setItemCount] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const modulesData = await moduleService.getModules(course.id);
        if (!active) return;
        
        let total = 0;
        if (course.courseType === 'LEARNING') {
          const promises = modulesData.map(m => sessionService.getSessions(m.id).catch(() => []));
          const allSessions = await Promise.all(promises);
          if (!active) return;
          total = allSessions.reduce((acc, sess) => acc + (sess ? sess.length : 0), 0);
        } else {
          const promises = modulesData.map(m => questionService.getQuestions(m.id).catch(() => []));
          const allQuestions = await Promise.all(promises);
          if (!active) return;
          total = allQuestions.reduce((acc, q) => acc + (q ? q.length : 0), 0);
        }
        setItemCount(total);
      } catch (err) {
        console.error('Error fetching course item counts:', err);
        setItemCount(0);
      }
    };
    fetchCounts();
    return () => { active = false; };
  }, [course]);

  const primaryColor = course.primaryColor || '#8b5cf6';

  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(139, 92, 246, ${alpha})`;
    try {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(139, 92, 246, ${alpha})`;
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return `rgba(139, 92, 246, ${alpha})`;
    }
  };

  const badgeBg = hexToRgba(primaryColor, 0.08);
  const badgeBorder = `1px solid ${hexToRgba(primaryColor, 0.25)}`;
  const badgeText = primaryColor;
  
  const glowGrad = `radial-gradient(circle at 100% 0%, ${hexToRgba(primaryColor, 0.06)} 0%, transparent 60%)`;

  const isLearning = course.courseType === 'LEARNING';

  return (
    <div 
      onClick={() => onSelect(course.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#121111',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: glowGrad,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className="glass-card"
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = hexToRgba(primaryColor, 0.25);
        e.currentTarget.style.transform = 'translateY(-4px)';
        const arrow = e.currentTarget.querySelector('.explore-arrow');
        if (arrow) arrow.style.transform = 'translateX(4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
        const arrow = e.currentTarget.querySelector('.explore-arrow');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
    >
      {/* Top-Right Corner Accent Shape */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '120px', 
          height: '120px', 
          borderBottomLeftRadius: '100%', 
          backgroundColor: hexToRgba(primaryColor, 0.08), 
          pointerEvents: 'none',
          zIndex: 1
        }} 
      />

      {/* Top Tag */}
      <div style={{ alignSelf: 'flex-start', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
        <span 
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: badgeBg,
            border: badgeBorder,
            color: badgeText
          }}
        >
          {isLearning ? 'Learning Path' : 'Question Bank'}
        </span>
      </div>

      {/* Course Title */}
      <h3 
        style={{ 
          fontSize: '1.65rem', 
          fontWeight: '700', 
          marginBottom: '14px', 
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.01em',
          position: 'relative',
          zIndex: 2
        }}
      >
        {course.name}
      </h3>

      {/* Course Description */}
      <p 
        style={{ 
          color: theme.colors.textSecondary, 
          fontSize: '0.94rem', 
          lineHeight: '1.65', 
          marginBottom: '36px', 
          flexGrow: 1,
          fontFamily: 'var(--font-sans)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {course.description || 'Master the structural concepts step-by-step with curated materials.'}
      </p>

      {/* Footer Row */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.03)',
          paddingTop: '20px',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Count Label */}
        <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
          {itemCount === null ? (
            '...'
          ) : (
            `${itemCount} ${isLearning ? 'Sessions' : 'Questions'}`
          )}
        </span>

        {/* Explore Link */}
        <span 
          style={{ 
            color: primaryColor, 
            fontSize: '0.92rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Explore 
          <span 
            className="explore-arrow" 
            style={{ 
              transition: 'transform 0.2s ease',
              display: 'inline-block'
            }}
          >
            →
          </span>
        </span>
      </div>
    </div>
  );
}

export default CourseCard;

