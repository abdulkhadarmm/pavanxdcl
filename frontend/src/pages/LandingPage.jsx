import React from 'react';
import useSEO from '../hooks/useSEO';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import CourseSection from '../components/landing/CourseSection';
import CommunitySection from '../components/landing/CommunitySection';
import FutureSections from '../components/landing/FutureSections';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import AboutSection from '../components/landing/AboutSection';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar currentView={currentView} onViewChange={onViewChange} />
      
      <main style={{ flexGrow: 1 }}>
        <Hero onExploreCourses={handleExploreCourses} />
        <Stats />
        <AboutSection />
        <WhyChooseUs />
        <Features />
        <CourseSection onSelectCourse={onSelectCourse} />
        <FutureSections />
        <CommunitySection />
        <Testimonials />
        <FAQ />
        <CTASection onExploreCourses={handleExploreCourses} />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default LandingPage;
