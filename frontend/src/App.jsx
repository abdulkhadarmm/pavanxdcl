import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import CourseWorkspace from './pages/CourseWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import courseService from './services/courseService';

function App() {
  const [view, setView] = useState('public'); // 'public' | 'admin'
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);

  const getSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  useEffect(() => {
    const initAndRegisterRoute = async () => {
      let fetchedCourses = [];
      try {
        fetchedCourses = await courseService.getCourses();
        setCourses(fetchedCourses || []);
      } catch (err) {
        console.error("Failed to load courses on mount:", err);
      }

      const handleRouteChange = () => {
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
            const matched = fetchedCourses.find(c => getSlug(c.name) === slug);
            if (matched) {
              setSelectedCourseId(matched.id);
              return;
            }
          }
          setSelectedCourseId(null);
        }
      };

      window.addEventListener('hashchange', handleRouteChange);
      window.addEventListener('popstate', handleRouteChange);
      handleRouteChange(); // run on load
      
      return () => {
        window.removeEventListener('hashchange', handleRouteChange);
        window.removeEventListener('popstate', handleRouteChange);
      };
    };

    let cleanupFn;
    initAndRegisterRoute().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
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
    if (course) {
      window.history.pushState({}, '', `/${getSlug(course.name)}`);
    } else {
      window.history.pushState({}, '', `/course/${courseId}`);
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

