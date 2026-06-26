import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import theme from '../../config/theme';

export function CourseCard({
  course,
  onSelect
}) {
  const accent = course.colorTheme || 'blue';
  
  const getThemeGrad = () => {
    return theme.gradients[accent] || theme.gradients.blue;
  };

  return (
    <Card 
      accent={accent}
      hoverable={true} 
      padding="0"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Top colored progress gradient line */}
      <div style={{ height: '6px', background: getThemeGrad() }} />

      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Badge type={course.courseType}>
            {course.courseType === 'LEARNING' ? 'Learning' : 'Question Bank'}
          </Badge>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
          {course.name}
        </h3>

        <p 
          style={{ 
            color: theme.colors.textSecondary, 
            fontSize: '0.92rem', 
            lineHeight: '1.6', 
            marginBottom: '24px', 
            flexGrow: 1 
          }}
        >
          {course.description || 'Access structured learning paths and question pools.'}
        </p>

        {/* Dynamic accent variables mapped dynamically */}
        <div style={{ '--theme-grad': getThemeGrad(), '--theme-glow': theme.shadows[`glow${accent.charAt(0).toUpperCase() + accent.slice(1)}`] }}>
          <Button 
            onClick={() => onSelect(course.id)} 
            style={{ width: '100%' }}
          >
            {course.courseType === 'LEARNING' ? 'Start Learning' : 'Solve Questions'} &rarr;
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default CourseCard;
