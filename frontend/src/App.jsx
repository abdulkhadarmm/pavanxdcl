import React, { useState } from 'react';
import PublicPortal from './pages/PublicPortal';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <header className="nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleClearCourse}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
            C
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
            EduFlow <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '0.85rem' }}>Platform</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className={`btn ${view === 'public' ? 'btn-primary accent-blue' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => {
              setView('public');
              handleClearCourse();
            }}
          >
            Public Site
          </button>
          
          <button 
            className={`btn ${view === 'admin' ? 'btn-primary accent-blue' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => {
              setView('admin');
              handleClearCourse();
            }}
          >
            Admin Panel
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        {view === 'public' ? (
          <PublicPortal 
            onViewAdmin={() => setView('admin')}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            onClearCourse={handleClearCourse}
          />
        ) : (
          <AdminDashboard 
            onViewPublic={() => setView('public')}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            onClearCourse={handleClearCourse}
          />
        )}
      </main>

    </div>
  );
}

export default App;
