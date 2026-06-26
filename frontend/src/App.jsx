import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import CourseWorkspace from './pages/CourseWorkspace';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [view, setView] = useState('public'); // 'public' | 'admin'
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const isPathAdmin = path === '/admin';
      const isHashAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
      
      if (isPathAdmin || isHashAdmin) {
        setView('admin');
      } else {
        setView('public');
        
        if (window.location.hash === '#hero') {
          window.history.replaceState(null, '', path);
        }
        
        const courseMatch = path.match(/^\/course\/([^/]+)/);
        if (courseMatch) {
          const courseIdStr = courseMatch[1];
          const courseId = isNaN(courseIdStr) ? courseIdStr : Number(courseIdStr);
          setSelectedCourseId(courseId);
        } else {
          setSelectedCourseId(null);
        }
      }
    };
    
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // check initial route on load
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    window.history.pushState({}, '', `/course/${courseId}`);
  };

  const handleClearCourse = () => {
    setSelectedCourseId(null);
    window.history.pushState({}, '', '/');
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
            window.history.pushState({}, '', '/');
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

