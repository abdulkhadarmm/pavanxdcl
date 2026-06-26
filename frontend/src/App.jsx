import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import CourseWorkspace from './pages/CourseWorkspace';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [view, setView] = useState('public'); // 'public' | 'admin'
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleClearCourse = () => {
    setSelectedCourseId(null);
  };

  return (
    <ToastProvider>
      {view === 'public' ? (
        selectedCourseId === null ? (
          <LandingPage 
            onSelectCourse={handleSelectCourse} 
            currentView={view}
            onViewChange={setView}
          />
        ) : (
          <CourseWorkspace 
            courseId={selectedCourseId} 
            onBack={handleClearCourse}
            currentView={view}
            onViewChange={setView}
          />
        )
      ) : (
        <AdminDashboard 
          onViewPublic={() => {
            setView('public');
            handleClearCourse();
          }}
          selectedCourseId={selectedCourseId}
          onSelectCourse={handleSelectCourse}
          onClearCourse={handleClearCourse}
        />
      )}
    </ToastProvider>
  );
}

export default App;
