import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CourseCard from './CourseCard';
import Loader from '../ui/Loader';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export function CourseSection({
  onSelectCourse
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCourses();
      setCourses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch active courses. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <section 
      id="courses" 
      style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'transparent'
      }}
    >

      {/* Centered Heading */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            marginBottom: '16px'
          }}
        >
          <svg width="28" height="28" fill="none" stroke="var(--accent-orange)" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          <h2 
            style={{ 
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            Explore Our Programs
          </h2>
        </div>
        <p 
          style={{ 
            color: '#94a3b8', 
            fontSize: '1.02rem', 
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Fully interactive, curated curriculums mapped to master DSA, core languages, and full-stack ecosystems.
        </p>
      </div>

      {loading && (
        <Loader text="Loading available courses..." />
      )}

      {error && (
        <ErrorMessage 
          title="Connection Error" 
          message={error} 
          onRetry={fetchCourses} 
        />
      )}

      {!loading && !error && courses.length === 0 && (
        <EmptyState 
          title="No Active Courses" 
          message="There are no courses active at the moment. Navigate to the Admin Panel to create one!"
          icon="📚"
        />
      )}

      {!loading && !error && courses.length > 0 && (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            justifyContent: 'center'
          }}
          className="courses-grid"
        >
          {courses.map((course) => (
            <div key={course.id} className="animate-slide-up">
              <CourseCard 
                course={course} 
                onSelect={onSelectCourse} 
              />
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CourseSection;

