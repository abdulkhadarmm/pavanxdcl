import React from 'react';
import useSEO from '../hooks/useSEO';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import CourseSection from '../components/landing/CourseSection';
import CommunitySection from '../components/landing/CommunitySection';
import Footer from '../components/landing/Footer';
import ScrollToTop from '../components/shared/ScrollToTop';

export function LandingPage({
  onSelectCourse,
  currentView,
  onViewChange
}) {
  // Setup primary SEO metadata
  useSEO();

  const handleExploreCourses = () => {
    const section = document.getElementById('courses');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      overflowX: 'hidden',
      backgroundColor: '#070605'
    }}>
      {/* Background Glow Blobs (Fixed in screen viewport) */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '60%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0) 80%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        top: '40%',
        left: '-10%',
        width: '70vw',
        height: '70vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 80%)',
        filter: 'blur(110px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar currentView={currentView} onViewChange={onViewChange} />
        
        <main style={{ flexGrow: 1 }}>
          <Hero onExploreCourses={handleExploreCourses} />
          <CourseSection onSelectCourse={onSelectCourse} />
          <CommunitySection />
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default LandingPage;

