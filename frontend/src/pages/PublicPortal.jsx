import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PublicPortal({ onViewAdmin, onSelectCourse, selectedCourseId, onClearCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleContent, setModuleContent] = useState({}); // { moduleId: sessions or questions }
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // MCQ state
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: optionIndex }
  const [checkedAnswers, setCheckedAnswers] = useState({}); // { questionId: { correct: bool, submitted: bool } }
  const [revealedExplanations, setRevealedExplanations] = useState({}); // { questionId: bool }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseDetails(selectedCourseId);
    } else {
      setActiveCourse(null);
      setModules([]);
      setModuleContent({});
      setExpandedModuleId(null);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const course = await api.getCourseById(courseId);
      setActiveCourse(course);
      const mods = await api.getModules(courseId);
      setModules(mods);
      setModuleContent({});
      setExpandedModuleId(null);
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);
    if (!moduleContent[moduleId]) {
      try {
        if (activeCourse.courseType === 'LEARNING') {
          const sessions = await api.getSessions(moduleId);
          setModuleContent(prev => ({ ...prev, [moduleId]: sessions }));
        } else {
          const questions = await api.getQuestions(moduleId);
          setModuleContent(prev => ({ ...prev, [moduleId]: questions }));
        }
      } catch (err) {
        console.error('Failed to load content for module/topic', err);
      }
    }
  };

  const handleSelectOption = (questionId, index) => {
    if (checkedAnswers[questionId]?.submitted) return; // Can't change after submitting
    setSelectedOptions(prev => ({ ...prev, [questionId]: index }));
  };

  const checkMCQAnswer = (question, selectedIndex) => {
    if (selectedIndex === undefined) return;
    const isCorrect = question.options[selectedIndex] === question.correctAnswer;
    setCheckedAnswers(prev => ({
      ...prev,
      [question.id]: { correct: isCorrect, submitted: true }
    }));
  };

  const toggleExplanation = (questionId) => {
    setRevealedExplanations(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const resetMCQ = (questionId) => {
    setSelectedOptions(prev => {
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

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {activeCourse ? activeCourse.name : 'Course Directory'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {activeCourse 
              ? `Explore the ${activeCourse.courseType === 'LEARNING' ? 'Modules & Sessions' : 'Topics & Question Bank'}`
              : 'Acquire new skills with our premium structured courses.'
            }
          </p>
        </div>
        <div>
          {activeCourse ? (
            <button className="btn btn-secondary" onClick={onClearCourse}>
              &larr; Back to Directory
            </button>
          ) : (
            <button className="btn btn-primary accent-blue" onClick={onViewAdmin}>
              Admin Panel &rarr;
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-container" style={{ padding: '20px', marginBottom: '24px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)' }}>
          <p style={{ color: '#f87171', fontWeight: 600 }}>Error: {error}</p>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Directory Mode */}
      {!activeCourse && !loading && (
        <div className="courses-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              className={`glass-container accent-${course.colorTheme || 'blue'}`} 
              style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'var(--transition-smooth)', overflow: 'hidden' }}
            >
              {/* Colored Theme Bar */}
              <div style={{ height: '6px', background: 'var(--theme-grad)' }} />
              
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className={`badge badge-${course.courseType === 'LEARNING' ? 'learning' : 'qbank'}`}>
                    {course.courseType === 'LEARNING' ? 'Learning' : 'Question Bank'}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px' }}>{course.name}</h3>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', flexGrow: 1 }}>
                  {course.description || 'No description provided.'}
                </p>
                
                <button 
                  className="btn btn-primary" 
                  onClick={() => onSelectCourse(course.id)}
                  style={{ width: '100%' }}
                >
                  Start Learning
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No courses available. Visit the Admin Panel to create one!</p>
            </div>
          )}
        </div>
      )}

      {/* Course Explorer Mode */}
      {activeCourse && !loading && (
        <div className={`accent-${activeCourse.colorTheme || 'blue'}`} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Main Course Info Panel */}
          <div className="glass-container" style={{ padding: '30px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--theme-grad)' }} />
            <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Description</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {activeCourse.description || 'No course description available.'}
            </p>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '20px', marginBottom: '10px' }}>
            {activeCourse.courseType === 'LEARNING' ? 'Modules' : 'Topics'}
          </h2>

          {/* Module / Topic Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {modules.map(mod => {
              const isOpen = expandedModuleId === mod.id;
              const contentList = moduleContent[mod.id] || [];

              return (
                <div key={mod.id} className="glass-container" style={{ overflow: 'hidden' }}>
                  
                  {/* Accordion Trigger */}
                  <div 
                    className={`accordion-header ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleModule(mod.id)}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>{mod.name}</h3>
                      {mod.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {mod.description}
                        </p>
                      )}
                    </div>
                    <div style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'var(--transition-smooth)', color: 'var(--text-muted)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="accordion-body">
                      
                      {/* Course Type: LEARNING Sessions list */}
                      {activeCourse.courseType === 'LEARNING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {contentList.map(session => (
                            <div key={session.id} className="glass-card" style={{ padding: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--theme-color)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', fontWeight: 600 }}>
                                    {session.sessionCode}
                                  </span>
                                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{session.contentTitle}</h4>
                                </div>
                                <span className={`badge badge-${session.importanceLevel ? session.importanceLevel.toLowerCase() : 'medium'}`}>
                                  {session.importanceLevel || 'MEDIUM'}
                                </span>
                              </div>

                              {/* Resources & Practice Links */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                                
                                {/* Resource Links */}
                                <div>
                                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    Resources
                                  </h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {session.resources && session.resources.map(res => (
                                      <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.01)', transition: 'var(--transition-smooth)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                        {res.name}
                                      </a>
                                    ))}
                                    {(!session.resources || session.resources.length === 0) && (
                                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No resources uploaded</span>
                                    )}
                                  </div>
                                </div>

                                {/* Practice Links */}
                                <div>
                                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                    Practice Tasks
                                  </h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {session.practiceLinks && session.practiceLinks.map(prac => (
                                      <a key={prac.id} href={prac.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.01)', transition: 'var(--transition-smooth)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                        {prac.name}
                                      </a>
                                    ))}
                                    {(!session.practiceLinks || session.practiceLinks.length === 0) && (
                                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No practice links available</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          ))}
                          {contentList.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No sessions uploaded for this module yet.</p>
                          )}
                        </div>
                      )}

                      {/* Course Type: QUESTION_BANK Topics / Questions MCQ Portal */}
                      {activeCourse.courseType === 'QUESTION_BANK' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {contentList.map((question, qIdx) => {
                            const selectedOptionIndex = selectedOptions[question.id];
                            const checkState = checkedAnswers[question.id];
                            const isRevealed = revealedExplanations[question.id];

                            return (
                              <div key={question.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--theme-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Question {qIdx + 1}
                                  </span>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {question.tags && question.tags.split(',').map(tag => (
                                      <span key={tag} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                        #{tag.trim()}
                                      </span>
                                    ))}
                                    <span className={`badge badge-${question.difficultyLevel ? question.difficultyLevel.toLowerCase() : 'medium'}`}>
                                      {question.difficultyLevel || 'MEDIUM'}
                                    </span>
                                  </div>
                                </div>

                                <p style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '20px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                  {question.questionText}
                                </p>

                                {/* MCQ Option Choices */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  {question.options.map((opt, optIdx) => {
                                    const isSelected = selectedOptionIndex === optIdx;
                                    let optionClass = 'mcq-option';
                                    if (checkState?.submitted) {
                                      // Render red/green feedback
                                      const isThisCorrect = opt === question.correctAnswer;
                                      if (isThisCorrect) {
                                        optionClass += ' correct';
                                      } else if (isSelected && !checkState.correct) {
                                        optionClass += ' incorrect';
                                      }
                                    } else if (isSelected) {
                                      optionClass += ' selected';
                                    }

                                    return (
                                      <div 
                                        key={optIdx} 
                                        className={optionClass}
                                        onClick={() => handleSelectOption(question.id, optIdx)}
                                      >
                                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSelected ? 'var(--theme-color)' : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        {opt}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Actions Toolbar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    {!checkState?.submitted ? (
                                      <button 
                                        className="btn btn-primary"
                                        disabled={selectedOptionIndex === undefined}
                                        onClick={() => checkMCQAnswer(question, selectedOptionIndex)}
                                      >
                                        Submit Answer
                                      </button>
                                    ) : (
                                      <button className="btn btn-secondary" onClick={() => resetMCQ(question.id)}>
                                        Retry
                                      </button>
                                    )}

                                    {checkState?.submitted && question.explanation && (
                                      <button className="btn btn-secondary" onClick={() => toggleExplanation(question.id)}>
                                        {isRevealed ? 'Hide Explanation' : 'View Explanation'}
                                      </button>
                                    )}
                                  </div>

                                  {checkState?.submitted && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {checkState.correct ? (
                                        <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                          Correct!
                                        </span>
                                      ) : (
                                        <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                          Incorrect
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Explanation Toggle Drawer */}
                                {isRevealed && checkState?.submitted && question.explanation && (
                                  <div className="explanation-box">
                                    <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Explanation:</strong>
                                    {question.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {contentList.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No questions uploaded for this topic yet.</p>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
            {modules.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This course is empty. Visit the Admin Panel to add {activeCourse.courseType === 'LEARNING' ? 'modules' : 'topics'}!
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
