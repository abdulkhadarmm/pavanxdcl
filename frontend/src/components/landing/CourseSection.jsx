import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import SectionHeading from '../shared/SectionHeading';
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
      const data = await courseService.getCourses();
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
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <SectionHeading 
        title="Explore Learning Portals"
        subtitle="Access structured roadmaps, theory sessions, practice tasks, and interactive question bank modules."
      />

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
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
