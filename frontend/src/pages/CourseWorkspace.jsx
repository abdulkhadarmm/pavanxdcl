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
import Card from '../components/ui/Card';
import Accordion from '../components/ui/Accordion';
import theme from '../config/theme';

export function CourseWorkspace({
  courseId,
  onBack,
  currentView,
  onViewChange
}) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleContent, setModuleContent] = useState({}); // { moduleId: sessions or questions }
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MCQ state
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: optionIndex }
  const [checkedAnswers, setCheckedAnswers] = useState({}); // { questionId: { correct: bool, submitted: bool } }
  const [revealedExplanations, setRevealedExplanations] = useState({}); // { questionId: bool }

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
      setModules(activeModules || []);
      
      setModuleContent({});
      setExpandedModuleId(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch course metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const toggleModule = async (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);
    if (!moduleContent[moduleId]) {
      try {
        if (course.courseType === 'LEARNING') {
          const sessions = await sessionService.getSessions(moduleId);
          setModuleContent(prev => ({ ...prev, [moduleId]: sessions || [] }));
        } else {
          const questions = await questionService.getQuestions(moduleId);
          setModuleContent(prev => ({ ...prev, [moduleId]: questions || [] }));
        }
      } catch (err) {
        console.error('Failed to fetch module items', err);
      }
    }
  };

  const handleSelectOption = (questionId, index) => {
    if (checkedAnswers[questionId]?.submitted) return;
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.colors.bgDark }}>
      <Navbar currentView={currentView} onViewChange={onViewChange} />

      <main style={{ flexGrow: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        
        {/* Back and title bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Button variant="secondary" onClick={onBack}>
            &larr; Back to Academy Home
          </Button>
          {course && (
            <Badge type={course.courseType}>
              {course.courseType === 'LEARNING' ? 'Structured Learning' : 'MCQ Assessment'}
            </Badge>
          )}
        </div>

        {loading && (
          <Loader text="Loading course syllabus..." />
        )}

        {error && (
          <ErrorMessage title="Syllabus Connection Error" message={error} onRetry={fetchCourseData} />
        )}

        {!loading && !error && course && (
          <div className={`accent-${course.colorTheme || 'blue'}`} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header Card */}
            <Card accent={course.colorTheme || 'blue'} hoverable={false} padding="30px">
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                {course.name}
              </h1>
              <p style={{ color: theme.colors.textSecondary, fontSize: '0.98rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                {course.description || 'No description available for this curriculum.'}
              </p>
            </Card>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '10px', marginBottom: '0' }}>
              {course.courseType === 'LEARNING' ? 'Syllabus Modules' : 'Question Bank Modules'}
            </h2>

            {/* Modules list */}
            {modules.length === 0 ? (
              <EmptyState 
                title="Syllabus Empty" 
                message="This syllabus has no registered modules yet. Check back soon!" 
                icon="🗂️"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {modules.map((mod) => {
                  const isOpen = expandedModuleId === mod.id;
                  const contentList = moduleContent[mod.id] || [];

                  return (
                    <Accordion
                      key={mod.id}
                      title={mod.name}
                      subtitle={mod.description}
                      accent={course.colorTheme || 'blue'}
                      defaultExpanded={isOpen}
                      onClick={() => toggleModule(mod.id)}
                    >
                      {/* Course Type: LEARNING Sessions list */}
                      {course.courseType === 'LEARNING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {contentList.map((session) => (
                            <Card key={session.id} hoverable={true} padding="20px" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--theme-color)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', fontWeight: 600 }}>
                                    {session.sessionCode}
                                  </span>
                                  <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                    {session.contentTitle}
                                  </h4>
                                </div>
                                <Badge type={session.importanceLevel || 'MEDIUM'}>
                                  {session.importanceLevel || 'MEDIUM'} Importance
                                </Badge>
                              </div>

                              {/* Resources & Practice Links Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '16px', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '16px' }}>
                                
                                {/* Resource Links */}
                                <div>
                                  <h5 style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    📄 Reference Study Files
                                  </h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {session.resources && session.resources.map(res => (
                                      <a 
                                        key={res.id} 
                                        href={res.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '8px', 
                                          color: theme.colors.textSecondary, 
                                          textDecoration: 'none', 
                                          fontSize: '0.88rem', 
                                          padding: '6px 10px', 
                                          borderRadius: '6px', 
                                          background: 'rgba(255,255,255,0.01)', 
                                          border: `1px solid ${theme.colors.border}`,
                                          transition: theme.transitions.smooth 
                                        }} 
                                        onMouseOver={e => {
                                          e.currentTarget.style.color = '#fff';
                                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        }} 
                                        onMouseOut={e => {
                                          e.currentTarget.style.color = theme.colors.textSecondary;
                                          e.currentTarget.style.borderColor = theme.colors.border;
                                        }}
                                      >
                                        🔗 {res.name}
                                      </a>
                                    ))}
                                    {(!session.resources || session.resources.length === 0) && (
                                      <span style={{ fontSize: '0.82rem', color: theme.colors.textMuted }}>No reference sheets uploaded</span>
                                    )}
                                  </div>
                                </div>

                                {/* Practice Links */}
                                <div>
                                  <h5 style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    📝 Coding Tasks
                                  </h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {session.practiceLinks && session.practiceLinks.map(prac => (
                                      <a 
                                        key={prac.id} 
                                        href={prac.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '8px', 
                                          color: theme.colors.textSecondary, 
                                          textDecoration: 'none', 
                                          fontSize: '0.88rem', 
                                          padding: '6px 10px', 
                                          borderRadius: '6px', 
                                          background: 'rgba(255,255,255,0.01)', 
                                          border: `1px solid ${theme.colors.border}`,
                                          transition: theme.transitions.smooth 
                                        }} 
                                        onMouseOver={e => {
                                          e.currentTarget.style.color = '#fff';
                                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        }} 
                                        onMouseOut={e => {
                                          e.currentTarget.style.color = theme.colors.textSecondary;
                                          e.currentTarget.style.borderColor = theme.colors.border;
                                        }}
                                      >
                                        🚀 {prac.name}
                                      </a>
                                    ))}
                                    {(!session.practiceLinks || session.practiceLinks.length === 0) && (
                                      <span style={{ fontSize: '0.82rem', color: theme.colors.textMuted }}>No practice questions linked</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </Card>
                          ))}
                          {contentList.length === 0 && (
                            <p style={{ textAlign: 'center', color: theme.colors.textMuted, padding: '20px', fontSize: '0.9rem' }}>
                              No active learning sessions created for this module.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Course Type: QUESTION_BANK Topics / MCQ questions */}
                      {course.courseType === 'QUESTION_BANK' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {contentList.map((question, qIdx) => {
                            const selectedOptionIndex = selectedOptions[question.id];
                            const checkState = checkedAnswers[question.id];
                            const isRevealed = revealedExplanations[question.id];

                            return (
                              <div key={question.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--theme-color)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, borderLeftWidth: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                  <span style={{ fontSize: '0.82rem', color: theme.colors.textMuted, fontWeight: 600 }}>
                                    Question {qIdx + 1}
                                  </span>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {question.tags && question.tags.split(',').map(tag => (
                                      <span key={tag} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '4px', color: theme.colors.textSecondary }}>
                                        #{tag.trim()}
                                      </span>
                                    ))}
                                    <Badge type={question.difficultyLevel || 'MEDIUM'}>
                                      {question.difficultyLevel || 'MEDIUM'}
                                    </Badge>
                                  </div>
                                </div>

                                <p style={{ fontSize: '1.05rem', fontWeight: '500', color: '#fff', marginBottom: '20px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                  {question.questionText}
                                </p>

                                {/* MCQ Option Choices */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  {question.options.map((opt, optIdx) => {
                                    const isSelected = selectedOptionIndex === optIdx;
                                    let optionClass = 'mcq-option';
                                    if (checkState?.submitted) {
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
                                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSelected ? 'var(--theme-color)' : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : theme.colors.textSecondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        {opt}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Actions Toolbar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    {!checkState?.submitted ? (
                                      <Button 
                                        onClick={() => checkMCQAnswer(question, selectedOptionIndex)}
                                        disabled={selectedOptionIndex === undefined}
                                      >
                                        Submit Answer
                                      </Button>
                                    ) : (
                                      <Button variant="secondary" onClick={() => resetMCQ(question.id)}>
                                        Retry
                                      </Button>
                                    )}

                                    {checkState?.submitted && question.explanation && (
                                      <Button variant="secondary" onClick={() => toggleExplanation(question.id)}>
                                        {isRevealed ? 'Hide Explanation' : 'View Explanation'}
                                      </Button>
                                    )}
                                  </div>

                                  {checkState?.submitted && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {checkState.correct ? (
                                        <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          ✅ Correct!
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
                            <p style={{ textAlign: 'center', color: theme.colors.textMuted, padding: '20px', fontSize: '0.9rem' }}>
                              No questions created for this topic yet.
                            </p>
                          )}
                        </div>
                      )}
                    </Accordion>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CourseWorkspace;
