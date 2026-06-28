import React, { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import courseService from '../services/courseService';
import moduleService from '../services/moduleService';
import sessionService from '../services/sessionService';
import questionService from '../services/questionService';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export function CourseWorkspace({
  courseId,
  onBack,
  currentView,
  onViewChange
}) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleContent, setModuleContent] = useState({}); // { moduleId: sessions or questions }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question Answer states
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: optionIndex }
  const [fillBlankInputs, setFillBlankInputs] = useState({}); // { questionId: string }
  const [descriptiveInputs, setDescriptiveInputs] = useState({}); // { questionId: string }
  const [checkedAnswers, setCheckedAnswers] = useState({}); // { questionId: { correct: bool, submitted: bool } }
  const [revealedExplanations, setRevealedExplanations] = useState({}); // { questionId: bool }
  const [expandedSessions, setExpandedSessions] = useState({});

  // Set page-specific SEO titles
  useSEO({
    title: course ? `${course.name} Course Hub` : 'Course Hub',
    description: course ? course.description : 'Explore sessions and practice questions'
  });

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeCourse = await courseService.getCourseById(courseId);
      setCourse(activeCourse);
      
      const activeModules = await moduleService.getModules(courseId);
      const filteredMods = (activeModules || []).filter(m => {
        // filter out locally permanently deleted modules
        const permDeleted = JSON.parse(localStorage.getItem('perm_deleted_ids') || '{"modules":[]}');
        return !permDeleted.modules?.includes(m.id);
      });
      setModules(filteredMods);
      
      // Load contents for all modules in parallel
      const contentMap = {};
      await Promise.all(filteredMods.map(async (mod) => {
        try {
          if (activeCourse.courseType === 'LEARNING') {
            const sessions = await sessionService.getSessions(mod.id);
            const permDeleted = JSON.parse(localStorage.getItem('perm_deleted_ids') || '{"sessions":[]}');
            contentMap[mod.id] = (sessions || []).filter(s => !permDeleted.sessions?.includes(s.id));
          } else {
            const questions = await questionService.getQuestions(mod.id);
            const permDeleted = JSON.parse(localStorage.getItem('perm_deleted_ids') || '{"questions":[]}');
            contentMap[mod.id] = (questions || []).filter(q => !permDeleted.questions?.includes(q.id));
          }
        } catch (err) {
          console.error(`Failed to fetch content for module ${mod.id}`, err);
          contentMap[mod.id] = [];
        }
      }));
      setModuleContent(contentMap);
    } catch (err) {
      setError(err.message || 'Failed to fetch course data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Option selection
  const handleSelectOption = (questionId, index) => {
    if (checkedAnswers[questionId]?.submitted) return;
    setSelectedOptions(prev => ({ ...prev, [questionId]: index }));
  };

  // Submit Answer check (dynamic for types)
  const checkAnswer = (question, type) => {
    if (type === 'MCQ' || type === 'TF') {
      const selectedIndex = selectedOptions[question.id];
      if (selectedIndex === undefined) return;
      const optText = question.options[selectedIndex];
      const isCorrect = optText === question.correctAnswer;
      setCheckedAnswers(prev => ({
        ...prev,
        [question.id]: { correct: isCorrect, submitted: true }
      }));
    } else if (type === 'FILL_BLANK') {
      const inputVal = fillBlankInputs[question.id] || '';
      if (!inputVal.trim()) return;
      const isCorrect = inputVal.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      setCheckedAnswers(prev => ({
        ...prev,
        [question.id]: { correct: isCorrect, submitted: true }
      }));
    } else if (type === 'DESCRIPTIVE') {
      // Just flag as submitted to unlock solution guide
      setCheckedAnswers(prev => ({
        ...prev,
        [question.id]: { correct: true, submitted: true }
      }));
    }
  };

  const toggleExplanation = (questionId) => {
    setRevealedExplanations(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const resetQuestion = (questionId) => {
    setSelectedOptions(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setFillBlankInputs(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setDescriptiveInputs(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setCheckedAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setRevealedExplanations(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // Parse colors
  const primaryColor = course?.primaryColor || '#f97316';
  const secondaryColor = course?.secondaryColor || '#ff7a00';

  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(139, 92, 246, ${alpha})`;
    try {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(139, 92, 246, ${alpha})`;
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return `rgba(139, 92, 246, ${alpha})`;
    }
  };

  // Render specific styled importance badges for plain text string levels
  const getImportanceStyle = (level) => {
    const lvl = (level || 'Medium').trim();
    const lvlLower = lvl.toLowerCase();
    
    // Choose colors based on keywords
    let color = '#3b82f6'; // Blue default
    if (lvlLower.includes('core') || lvlLower.includes('interview') || lvlLower.includes('must') || lvlLower.includes('hard') || lvlLower.includes('high')) {
      color = '#ef4444'; // Red-ish
      if (lvlLower.includes('interview')) color = '#f97316'; // Orange
      if (lvlLower.includes('must')) color = '#ec4899'; // Pink
      if (lvlLower.includes('core')) color = '#a855f7'; // Purple
    } else if (lvlLower.includes('easy') || lvlLower.includes('low') || lvlLower.includes('optional') || lvlLower.includes('revision') || lvlLower.includes('very easy')) {
      color = '#10b981'; // Green-ish
      if (lvlLower.includes('optional')) color = '#64748b'; // Slate
      if (lvlLower.includes('revision')) color = '#06b6d4'; // Cyan
    } else {
      color = '#eab308'; // Yellow/Gold for Medium/Basics/etc
    }

    return {
      background: hexToRgba(color, 0.08),
      color: color,
      border: `1px solid ${hexToRgba(color, 0.2)}`,
      fontWeight: '700',
      borderRadius: '9999px',
      padding: '4px 12px',
      fontSize: '0.68rem',
      letterSpacing: '0.05em',
      display: 'inline-block',
      textAlign: 'center',
      textTransform: 'uppercase'
    };
  };

  // Helper to fetch SVG icon for Resource Type name
  const getResourceIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('recording') || n.includes('video') || n.includes('play')) {
      return (
        <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      );
    }
    if (n.includes('note') || n.includes('pdf') || n.includes('doc') || n.includes('slides') || n.includes('sheet')) {
      return (
        <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      );
    }
    if (n.includes('github') || n.includes('git') || n.includes('repo') || n.includes('code')) {
      return (
        <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    }
    return (
      <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    );
  };

  // Helper to fetch custom brand symbol/icon for Practice Platform
  const getPracticeIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('leetcode')) {
      return (
        <span style={{ fontWeight: '800', fontSize: '0.8rem', fontFamily: 'sans-serif', color: '#ffa116' }}>L</span>
      );
    }
    if (n.includes('hackerrank')) {
      return (
        <span style={{ fontWeight: '800', fontSize: '0.8rem', fontFamily: 'sans-serif', color: '#2ec866' }}>H</span>
      );
    }
    if (n.includes('geek') || n.includes('gfg')) {
      return (
        <span style={{ fontWeight: '800', fontSize: '0.8rem', fontFamily: 'sans-serif', color: '#2f8d46' }}>G</span>
      );
    }
    if (n.includes('codechef')) {
      return (
        <span style={{ fontWeight: '800', fontSize: '0.8rem', fontFamily: 'sans-serif', color: '#5b4636' }}>C</span>
      );
    }
    return (
      <svg style={{ width: '12px', height: '12px', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }} viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    );
  };

  return (
    <div style={{ 
      position: 'relative',
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#070605',
      overflowX: 'hidden',
      '--theme-color': primaryColor,
      '--theme-grad': `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      '--theme-glow': `${primaryColor}22`
    }}>
      {/* Background Glow Blobs using Course's Primary and Secondary Colors (Fixed in screen viewport, matching Landing Page positions/power) */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '60%',
        width: '60vw',
        height: '60vw',
        background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.35)} 0%, ${hexToRgba(primaryColor, 0)} 80%)`,
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
        background: `radial-gradient(circle, ${hexToRgba(secondaryColor, 0.25)} 0%, ${hexToRgba(secondaryColor, 0)} 80%)`,
        filter: 'blur(110px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar currentView={currentView} onViewChange={onViewChange} />

      <main style={{ flexGrow: 1, padding: '40px 20px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        
        {/* Back and type info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button 
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '9999px',
              padding: '8px 20px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            ← Back to Home
          </button>
          
          {course && (
            <span style={{ 
              color: 'var(--theme-color)', 
              background: 'var(--theme-glow)',
              border: '1px solid var(--theme-color)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {course.courseType === 'LEARNING' ? 'Structured Learning' : 'MCQ Assessment'}
            </span>
          )}
        </div>

        {loading && (
          <Loader text="Loading course curriculum..." />
        )}

        {error && (
          <ErrorMessage title="Syllabus Connection Error" message={error} onRetry={fetchCourseData} />
        )}

        {!loading && !error && course && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Header Content */}
            <div style={{ marginBottom: '10px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {course.name}
              </h1>
              <div style={{ width: '60px', height: '4px', background: 'var(--theme-grad)', borderRadius: '2px', marginBottom: '20px' }}></div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', maxWidth: '800px' }}>
                {course.description || 'Learn DSA with hands-on practice, video recordings, and problem sets to crack top tech interviews.'}
              </p>
            </div>

            {/* Course Content path description */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
              <span style={{ 
                color: 'var(--theme-color)', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '6px'
              }}>
                {course.courseType === 'LEARNING' ? 'Learning Path' : 'Question Bank Path'}
              </span>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                {course.courseType === 'LEARNING' 
                  ? 'Master-class sessions with recordings, notes, and hands-on practice problems.' 
                  : 'Test your concept capabilities with comprehensive assessments, options, and guides.'}
              </p>
            </div>

            {/* Modules list */}
            {modules.length === 0 ? (
              <EmptyState 
                title="Curriculum Empty" 
                message="This course has no registered modules yet. Check back soon!" 
                icon="🗂️"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                
                {modules.map((mod) => {
                  const contentList = moduleContent[mod.id] || [];

                  return (
                    <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Module Header with Vertical Left Pipe in Theme Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--theme-grad)', borderRadius: '2px' }}></div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {mod.name.toLowerCase()}
                        </h2>
                      </div>
                      
                      {mod.description && (
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 8px 14px' }}>
                          {mod.description}
                        </p>
                      )}

                      {/* Accordion Layout for Learning Course */}
                      {course.courseType === 'LEARNING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '14px' }}>
                          {contentList.map((session) => {
                            const isExpanded = !!expandedSessions[session.id];
                            
                            return (
                              <div 
                                key={session.id} 
                                style={{
                                  border: '1px solid rgba(255, 255, 255, 0.07)',
                                  borderLeft: isExpanded ? `4px solid ${primaryColor}` : '4px solid rgba(255, 255, 255, 0.07)',
                                  borderRadius: '16px',
                                  backgroundColor: 'rgba(18, 17, 17, 0.7)',
                                  backdropFilter: 'blur(10px)',
                                  overflow: 'hidden',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: isExpanded 
                                    ? `0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px -5px ${hexToRgba(primaryColor, 0.15)}` 
                                    : '0 4px 15px -3px rgba(0, 0, 0, 0.5)'
                                }}
                              >
                                {/* Accordion Header */}
                                <div 
                                  onClick={() => {
                                    setExpandedSessions(prev => ({
                                      ...prev,
                                      [session.id]: !prev[session.id]
                                    }));
                                  }}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px 24px',
                                    cursor: 'pointer',
                                    backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                                    transition: 'background-color 0.2s ease',
                                    userSelect: 'none'
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
                                  }}
                                >
                                  {/* Code and Title */}
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ 
                                      fontSize: '0.78rem', 
                                      color: primaryColor, 
                                      fontWeight: 800,
                                      fontFamily: 'monospace',
                                      background: hexToRgba(primaryColor, 0.08),
                                      border: `1px solid ${hexToRgba(primaryColor, 0.25)}`,
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.08em'
                                    }}>
                                      {session.sessionCode}
                                    </span>
                                    <span style={{ 
                                      color: isExpanded ? '#fff' : '#e2e8f0', 
                                      fontWeight: 600,
                                      fontSize: '1rem',
                                      marginLeft: '16px',
                                      transition: 'color 0.2s ease'
                                    }}>
                                      {session.contentTitle}
                                    </span>
                                  </div>
                                  
                                  {/* Right side Arrow */}
                                  <div>
                                    <svg 
                                      style={{ 
                                        width: '20px', 
                                        height: '20px', 
                                        fill: 'none', 
                                        stroke: isExpanded ? primaryColor : '#64748b', 
                                        strokeWidth: 2.5,
                                        transform: isExpanded ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                      }} 
                                      viewBox="0 0 24 24"
                                    >
                                      <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                  </div>
                                </div>
                                
                                {/* Accordion Body */}
                                {isExpanded && (
                                  <div style={{ 
                                    padding: '24px 28px', 
                                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px'
                                  }}>
                                    
                                    {/* Responsive Grid for Columns */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                      
                                      {/* Resources Column */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '6px', height: '6px', backgroundColor: primaryColor, borderRadius: '50%' }}></div>
                                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Resources
                                          </span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                          {session.resources && session.resources.map(res => (
                                            <a 
                                              key={res.id} 
                                              href={res.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px', 
                                                color: '#cbd5e1', 
                                                textDecoration: 'none', 
                                                fontSize: '0.88rem', 
                                                padding: '10px 16px', 
                                                borderRadius: '10px', 
                                                background: 'rgba(255, 255, 255, 0.02)', 
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                fontWeight: 500
                                              }} 
                                              onMouseOver={e => {
                                                e.currentTarget.style.background = hexToRgba(primaryColor, 0.08);
                                                e.currentTarget.style.borderColor = hexToRgba(primaryColor, 0.3);
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.transform = 'translateX(2px)';
                                              }} 
                                              onMouseOut={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = '#cbd5e1';
                                                e.currentTarget.style.transform = 'none';
                                              }}
                                            >
                                              <span style={{ color: primaryColor, display: 'flex', alignItems: 'center' }}>
                                                {getResourceIcon(res.name)}
                                              </span>
                                              <span>{res.name}</span>
                                            </a>
                                          ))}
                                          {(!session.resources || session.resources.length === 0) && (
                                            <span style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', paddingLeft: '14px' }}>
                                              No resources uploaded
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Practice Tasks Column */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '6px', height: '6px', backgroundColor: primaryColor, borderRadius: '50%' }}></div>
                                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Practice Tasks
                                          </span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                          {session.practiceLinks && session.practiceLinks.map(prac => (
                                            <a 
                                              key={prac.id} 
                                              href={prac.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px', 
                                                color: '#cbd5e1', 
                                                textDecoration: 'none', 
                                                fontSize: '0.88rem', 
                                                padding: '10px 16px', 
                                                borderRadius: '10px', 
                                                background: 'rgba(255, 255, 255, 0.02)', 
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                fontWeight: 500
                                              }} 
                                              onMouseOver={e => {
                                                e.currentTarget.style.background = hexToRgba(primaryColor, 0.08);
                                                e.currentTarget.style.borderColor = hexToRgba(primaryColor, 0.3);
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.transform = 'translateX(2px)';
                                              }} 
                                              onMouseOut={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = '#cbd5e1';
                                                e.currentTarget.style.transform = 'none';
                                              }}
                                            >
                                              <span style={{ color: primaryColor, display: 'flex', alignItems: 'center' }}>
                                                {getPracticeIcon(prac.name)}
                                              </span>
                                              <span>{prac.name}</span>
                                            </a>
                                          ))}
                                          {(!session.practiceLinks || session.practiceLinks.length === 0) && (
                                            <span style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', paddingLeft: '14px' }}>
                                              No practice tasks uploaded
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                    </div>
                                    
                                    {/* Importance Badge Bottom Row */}
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px', 
                                      marginTop: '12px', 
                                      borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                                      paddingTop: '16px' 
                                    }}>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                        Importance:
                                      </span>
                                      <span style={getImportanceStyle(session.importanceLevel)}>
                                        {session.importanceLevel || 'Medium'}
                                      </span>
                                    </div>
                                    
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {contentList.length === 0 && (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', border: '1px dashed rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                              No active learning sessions created for this module.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Cards for Question Bank Course */}
                      {course.courseType === 'QUESTION_BANK' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginLeft: '14px' }}>
                          {contentList.map((question, qIdx) => {
                            // Extract question type from tags
                            const tagsStr = question.tags || '';
                            let qType = 'MCQ';
                            if (tagsStr.includes('type_tf')) qType = 'TF';
                            else if (tagsStr.includes('type_fill_blank')) qType = 'FILL_BLANK';
                            else if (tagsStr.includes('type_descriptive')) qType = 'DESCRIPTIVE';

                            const cleanTags = tagsStr.split(',')
                              .map(t => t.trim())
                              .filter(t => t && !t.startsWith('type_'));

                            const selectedOptionIndex = selectedOptions[question.id];
                            const checkState = checkedAnswers[question.id];
                            const isRevealed = revealedExplanations[question.id];
                            const fillInput = fillBlankInputs[question.id] || '';
                            const descInput = descriptiveInputs[question.id] || '';

                            return (
                              <div 
                                key={question.id} 
                                style={{ 
                                  padding: '24px', 
                                  background: 'rgba(255,255,255,0.01)', 
                                  borderRadius: '12px', 
                                  border: '1px solid rgba(255,255,255,0.05)', 
                                  borderLeft: '4px solid var(--theme-color)' 
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                    Question {qIdx + 1} {course.courseType !== 'QUESTION_BANK' && `• ${qType.replace('_', ' ')}`}
                                  </span>
                                  {course.courseType !== 'QUESTION_BANK' && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      {cleanTags.map(tag => (
                                        <span key={tag} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8' }}>
                                          #{tag}
                                        </span>
                                      ))}
                                      <span style={{
                                        background: question.difficultyLevel === 'EASY' ? 'rgba(16, 185, 129, 0.08)' : question.difficultyLevel === 'HARD' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                        color: question.difficultyLevel === 'EASY' ? '#10b981' : question.difficultyLevel === 'HARD' ? '#f87171' : '#fbbf24',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700
                                      }}>
                                        {question.difficultyLevel || 'MEDIUM'}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <p style={{ fontSize: '1.05rem', fontWeight: '500', color: '#fff', marginBottom: course.courseType === 'QUESTION_BANK' ? '0px' : '20px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                  {question.questionText}
                                </p>

                                {course.courseType !== 'QUESTION_BANK' && (
                                  <>

                                {/* Render choices or inputs based on type */}
                                
                                {/* MCQ Question Type */}
                                {qType === 'MCQ' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {question.options.map((opt, optIdx) => {
                                      const isSelected = selectedOptionIndex === optIdx;
                                      let borderCol = 'rgba(255,255,255,0.05)';
                                      let bgCol = 'rgba(255,255,255,0.01)';
                                      let textCol = '#94a3b8';
                                      
                                      if (checkState?.submitted) {
                                        const isThisCorrect = opt === question.correctAnswer;
                                        if (isThisCorrect) {
                                          borderCol = '#10b981';
                                          bgCol = 'rgba(16, 185, 129, 0.08)';
                                          textCol = '#34d399';
                                        } else if (isSelected && !checkState.correct) {
                                          borderCol = '#f43f5e';
                                          bgCol = 'rgba(244, 63, 94, 0.08)';
                                          textCol = '#f87171';
                                        }
                                      } else if (isSelected) {
                                        borderCol = 'var(--theme-color)';
                                        bgCol = 'var(--theme-glow)';
                                        textCol = '#fff';
                                      }

                                      return (
                                        <div 
                                          key={optIdx} 
                                          onClick={() => handleSelectOption(question.id, optIdx)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            border: `1px solid ${borderCol}`,
                                            backgroundColor: bgCol,
                                            color: textCol,
                                            cursor: checkState?.submitted ? 'default' : 'pointer',
                                            transition: 'all 0.2s ease'
                                          }}
                                        >
                                          <span style={{ 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            background: isSelected ? 'var(--theme-color)' : 'rgba(255,255,255,0.05)', 
                                            color: isSelected ? '#000' : '#fff', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            marginRight: '12px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 700 
                                          }}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          {opt}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* True / False Question Type */}
                                {qType === 'TF' && (
                                  <div style={{ display: 'flex', gap: '16px' }}>
                                    {['True', 'False'].map((opt, optIdx) => {
                                      const isSelected = selectedOptionIndex === optIdx;
                                      let borderCol = 'rgba(255,255,255,0.05)';
                                      let bgCol = 'rgba(255,255,255,0.01)';
                                      let textCol = '#94a3b8';
                                      
                                      if (checkState?.submitted) {
                                        const isThisCorrect = opt.toLowerCase() === question.correctAnswer.toLowerCase();
                                        if (isThisCorrect) {
                                          borderCol = '#10b981';
                                          bgCol = 'rgba(16, 185, 129, 0.08)';
                                          textCol = '#34d399';
                                        } else if (isSelected && !checkState.correct) {
                                          borderCol = '#f43f5e';
                                          bgCol = 'rgba(244, 63, 94, 0.08)';
                                          textCol = '#f87171';
                                        }
                                      } else if (isSelected) {
                                        borderCol = 'var(--theme-color)';
                                        bgCol = 'var(--theme-glow)';
                                        textCol = '#fff';
                                      }

                                      return (
                                        <div 
                                          key={optIdx} 
                                          onClick={() => handleSelectOption(question.id, optIdx)}
                                          style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            padding: '14px',
                                            borderRadius: '8px',
                                            border: `1px solid ${borderCol}`,
                                            backgroundColor: bgCol,
                                            color: textCol,
                                            cursor: checkState?.submitted ? 'default' : 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease'
                                          }}
                                        >
                                          {opt}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Fill in the Blank Question Type */}
                                {qType === 'FILL_BLANK' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input 
                                      type="text"
                                      placeholder="Type your answer here..."
                                      disabled={checkState?.submitted}
                                      value={fillInput}
                                      onChange={e => setFillBlankInputs(prev => ({ ...prev, [question.id]: e.target.value }))}
                                      style={{
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: checkState?.submitted 
                                          ? (checkState.correct ? '1px solid #10b981' : '1px solid #f43f5e')
                                          : '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        outline: 'none'
                                      }}
                                    />
                                    {checkState?.submitted && !checkState.correct && (
                                      <span style={{ fontSize: '0.88rem', color: '#f87171', marginTop: '2px' }}>
                                        Correct answer: <strong style={{ color: '#fff' }}>{question.correctAnswer}</strong>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Descriptive Question Type */}
                                {qType === 'DESCRIPTIVE' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <textarea 
                                      placeholder="Jot down notes or draft your descriptive response..."
                                      rows="3"
                                      disabled={checkState?.submitted}
                                      value={descInput}
                                      onChange={e => setDescriptiveInputs(prev => ({ ...prev, [question.id]: e.target.value }))}
                                      style={{
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        outline: 'none',
                                        resize: 'vertical'
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Actions Toolbar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    {!checkState?.submitted ? (
                                      <button 
                                        onClick={() => checkAnswer(question, qType)}
                                        disabled={
                                          (qType === 'MCQ' || qType === 'TF') 
                                            ? (selectedOptionIndex === undefined)
                                            : (qType === 'FILL_BLANK' ? !fillInput.trim() : false)
                                        }
                                        style={{
                                          padding: '8px 18px',
                                          borderRadius: '6px',
                                          background: 'var(--theme-grad)',
                                          color: '#fff',
                                          fontWeight: 'bold',
                                          border: 'none',
                                          cursor: 'pointer',
                                          opacity: ((qType === 'MCQ' || qType === 'TF') ? (selectedOptionIndex === undefined) : (qType === 'FILL_BLANK' ? !fillInput.trim() : false)) ? 0.5 : 1
                                        }}
                                      >
                                        {qType === 'DESCRIPTIVE' ? 'Show Solution Guide' : 'Submit Answer'}
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => resetQuestion(question.id)}
                                        style={{
                                          padding: '8px 18px',
                                          borderRadius: '6px',
                                          background: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          color: '#fff',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Retry
                                      </button>
                                    )}

                                    {checkState?.submitted && (question.explanation || question.correctAnswer) && (
                                      <button 
                                        onClick={() => toggleExplanation(question.id)}
                                        style={{
                                          padding: '8px 18px',
                                          borderRadius: '6px',
                                          background: 'rgba(255,255,255,0.05)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          color: '#fff',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {isRevealed ? 'Hide Explanation' : 'View Explanation'}
                                      </button>
                                    )}
                                  </div>

                                  {checkState?.submitted && qType !== 'DESCRIPTIVE' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {checkState.correct ? (
                                        <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          ✅ Correct Answer
                                        </span>
                                      ) : (
                                        <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          ❌ Incorrect
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Explanation Toggle Drawer */}
                                {isRevealed && checkState?.submitted && (
                                  <div style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderLeft: '4px solid var(--theme-color)',
                                    padding: '16px',
                                    borderRadius: '0 8px 8px 0',
                                    marginTop: '16px',
                                    fontSize: '0.92rem',
                                    color: '#94a3b8',
                                    lineHeight: '1.5'
                                  }}>
                                    <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Explanation Guide:</strong>
                                    {qType === 'DESCRIPTIVE' && (
                                      <div style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#fff' }}>Model Answer: </strong> {question.correctAnswer}
                                      </div>
                                    )}
                                    {question.explanation || 'No step-by-step solution provided.'}
                                  </div>
                                )}
                              </>
                              )}
                            </div>
                            );
                          })}
                          {contentList.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#475569', padding: '20px', fontSize: '0.9rem' }}>
                              No questions created for this topic yet.
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      </div>
    </div>
  );
}

export default CourseWorkspace;

