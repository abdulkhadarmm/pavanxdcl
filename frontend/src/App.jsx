import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import CourseWorkspace from './pages/CourseWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import courseService from './services/courseService';

function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    const isPathAdmin = path === '/admin' || path === '/admin/';
    const isHashAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
    return (isPathAdmin || isHashAdmin) ? 'admin' : 'public';
  });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let fetchedCourses = [];

    const handleRouteChange = (coursesList = fetchedCourses) => {
      const path = window.location.pathname;
      const isPathAdmin = path === '/admin' || path === '/admin/';
      const isHashAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
      
      if (isPathAdmin || isHashAdmin) {
        setView('admin');
      } else {
        setView('public');
        
        if (window.location.hash === '#hero') {
          window.history.replaceState(null, '', path);
        }
        
        const slug = path.replace(/^\/+|\/+$/g, '');
        if (slug) {
          const matched = coursesList.find(c => c.slug === slug);
          if (matched) {
            setSelectedCourseId(matched.id);
            return;
          }
        }
        setSelectedCourseId(null);
      }
    };

    // Run route check immediately on mount so view is set to admin right away!
    handleRouteChange();

    const loadCourses = async () => {
      try {
        const fetched = await courseService.getCourses();
        fetchedCourses = fetched || [];
        setCourses(fetchedCourses);
        // Rerun route change check with the newly loaded courses list to resolve potential slug match
        handleRouteChange(fetchedCourses);
      } catch (err) {
        console.error("Failed to load courses on mount:", err);
      }
    };

    const path = window.location.pathname;
    const isPathAdmin = path === '/admin' || path === '/admin/';
    const isHashAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
    if (!isPathAdmin && !isHashAdmin) {
      loadCourses();
    }

    const onHashChange = () => handleRouteChange();
    const onPopState = () => handleRouteChange();

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);
    
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleSelectCourse = async (courseId) => {
    setSelectedCourseId(courseId);
    let list = courses;
    let course = list.find(c => c.id === courseId);
    if (!course) {
      try {
        const fetched = await courseService.getCourses();
        setCourses(fetched || []);
        list = fetched || [];
        course = list.find(c => c.id === courseId);
      } catch (e) {
        console.error(e);
      }
    }
    if (course && course.slug) {
      window.history.pushState({}, '', `/${course.slug}`);
    } else {
      window.history.pushState({}, '', '/');
    }
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

