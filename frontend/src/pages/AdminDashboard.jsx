import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminDashboard({ onViewPublic, onSelectCourse, selectedCourseId, onClearCourse }) {
  const [courses, setCourses] = useState([]);
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  
  // Modules / Topics
  const [modules, setModules] = useState([]);
  const [deletedModules, setDeletedModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  
  // Sessions / Questions
  const [sessions, setSessions] = useState({}); // { moduleId: [sessions] }
  const [deletedSessions, setDeletedSessions] = useState({}); // { moduleId: [sessions] }
  const [questions, setQuestions] = useState({}); // { moduleId: [questions] }
  const [deletedQuestions, setDeletedQuestions] = useState({}); // { moduleId: [questions] }
  
  // UI states
  const [showCourseBin, setShowCourseBin] = useState(false);
  const [showModuleBin, setShowModuleBin] = useState(false);
  const [showSessionBin, setShowSessionBin] = useState({}); // { moduleId: bool }
  const [showQuestionBin, setShowQuestionBin] = useState({}); // { moduleId: bool }
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Modals state
  const [courseModal, setCourseModal] = useState({ open: false, mode: 'create', data: null });
  const [moduleModal, setModuleModal] = useState({ open: false, mode: 'create', data: null });
  const [sessionModal, setSessionModal] = useState({ open: false, mode: 'create', moduleId: null, data: null });
  const [questionModal, setQuestionModal] = useState({ open: false, mode: 'create', moduleId: null, data: null });
  const [resourceModal, setResourceModal] = useState({ open: false, sessionId: null });
  const [practiceModal, setPracticeModal] = useState({ open: false, sessionId: null });

  // Errors & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchDeletedCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    } else {
      setActiveCourse(null);
      setModules([]);
      setDeletedModules([]);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to fetch courses: ' + err.message);
    }
  };

  const fetchDeletedCourses = async () => {
    try {
      const data = await api.getDeletedCourses();
      setDeletedCourses(data);
    } catch (err) {
      setError('Failed to fetch deleted courses: ' + err.message);
    }
  };

  const loadCourseDetails = async (courseId) => {
    setLoading(true);
    try {
      const course = await api.getCourseById(courseId);
      setActiveCourse(course);
      
      const activeMods = await api.getModules(courseId);
      setModules(activeMods);
      
      const delMods = await api.getDeletedModules(courseId);
      setDeletedModules(delMods);
      
      setSelectedModuleId(null);
      setExpandedModuleId(null);
    } catch (err) {
      setError('Failed to load course details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch helper for Module contents
  const loadModuleContent = async (moduleId) => {
    if (!activeCourse) return;
    try {
      if (activeCourse.courseType === 'LEARNING') {
        const activeSess = await api.getSessions(moduleId);
        setSessions(prev => ({ ...prev, [moduleId]: activeSess }));
        
        const delSess = await api.getDeletedSessions(moduleId);
        setDeletedSessions(prev => ({ ...prev, [moduleId]: delSess }));
      } else {
        const activeQuest = await api.getQuestions(moduleId);
        setQuestions(prev => ({ ...prev, [moduleId]: activeQuest }));
        
        const delQuest = await api.getDeletedQuestions(moduleId);
        setDeletedQuestions(prev => ({ ...prev, [moduleId]: delQuest }));
      }
    } catch (err) {
      setError('Failed to load module details: ' + err.message);
    }
  };

  const handleToggleModule = (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
    } else {
      setExpandedModuleId(moduleId);
      loadModuleContent(moduleId);
    }
  };

  // Course CRUD
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      courseType: formData.get('courseType'),
      colorTheme: formData.get('colorTheme')
    };

    try {
      if (courseModal.mode === 'create') {
        await api.createCourse(payload);
      } else {
        await api.updateCourse(courseModal.data.id, payload);
      }
      fetchCourses();
      setCourseModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      setError('Failed to save course: ' + err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to soft delete this course?')) return;
    try {
      await api.deleteCourse(id);
      fetchCourses();
      fetchDeletedCourses();
    } catch (err) {
      setError('Failed to delete course: ' + err.message);
    }
  };

  const handleRestoreCourse = async (id) => {
    try {
      await api.restoreCourse(id);
      fetchCourses();
      fetchDeletedCourses();
    } catch (err) {
      setError('Failed to restore course: ' + err.message);
    }
  };

  // Module CRUD
  const handleSaveModule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      description: formData.get('description')
    };

    try {
      if (moduleModal.mode === 'create') {
        await api.createModule(activeCourse.id, payload);
      } else {
        await api.updateModule(moduleModal.data.id, payload);
      }
      loadCourseDetails(activeCourse.id);
      setModuleModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      setError('Failed to save module: ' + err.message);
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to soft delete this module/topic?')) return;
    try {
      await api.deleteModule(id);
      loadCourseDetails(activeCourse.id);
    } catch (err) {
      setError('Failed to delete module: ' + err.message);
    }
  };

  const handleRestoreModule = async (id) => {
    try {
      await api.restoreModule(id);
      loadCourseDetails(activeCourse.id);
    } catch (err) {
      setError('Failed to restore module: ' + err.message);
    }
  };

  // Session CRUD
  const handleSaveSession = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      sessionCode: formData.get('sessionCode'),
      contentTitle: formData.get('contentTitle'),
      importanceLevel: formData.get('importanceLevel')
    };

    const moduleId = sessionModal.moduleId;

    try {
      if (sessionModal.mode === 'create') {
        await api.createSession(moduleId, payload);
      } else {
        await api.updateSession(sessionModal.data.id, payload);
      }
      loadModuleContent(moduleId);
      setSessionModal({ open: false, mode: 'create', moduleId: null, data: null });
    } catch (err) {
      setError('Failed to save session: ' + err.message);
    }
  };

  const handleDeleteSession = async (id, moduleId) => {
    if (!window.confirm('Are you sure you want to soft delete this session?')) return;
    try {
      await api.deleteSession(id);
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to delete session: ' + err.message);
    }
  };

  const handleRestoreSession = async (id, moduleId) => {
    try {
      await api.restoreSession(id);
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to restore session: ' + err.message);
    }
  };

  // Question CRUD
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Extract dynamic A, B, C, D options
    const options = [
      formData.get('optionA'),
      formData.get('optionB'),
      formData.get('optionC'),
      formData.get('optionD')
    ].filter(Boolean);

    const payload = {
      questionText: formData.get('questionText'),
      options,
      correctAnswer: formData.get('correctAnswer'),
      explanation: formData.get('explanation'),
      difficultyLevel: formData.get('difficultyLevel'),
      tags: formData.get('tags')
    };

    const moduleId = questionModal.moduleId;

    try {
      if (questionModal.mode === 'create') {
        await api.createQuestion(moduleId, payload);
      } else {
        await api.updateQuestion(questionModal.data.id, payload);
      }
      loadModuleContent(moduleId);
      setQuestionModal({ open: false, mode: 'create', moduleId: null, data: null });
    } catch (err) {
      setError('Failed to save question: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (id, moduleId) => {
    if (!window.confirm('Are you sure you want to soft delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to delete question: ' + err.message);
    }
  };

  const handleRestoreQuestion = async (id, moduleId) => {
    try {
      await api.restoreQuestion(id);
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to restore question: ' + err.message);
    }
  };

  // Resources CRUD
  const handleAddResource = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      url: formData.get('url')
    };

    try {
      await api.addResource(resourceModal.sessionId, payload);
      loadModuleContent(expandedModuleId);
      setResourceModal({ open: false, sessionId: null });
    } catch (err) {
      setError('Failed to add resource: ' + err.message);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource link permanently?')) return;
    try {
      await api.deleteResource(id);
      loadModuleContent(expandedModuleId);
    } catch (err) {
      setError('Failed to delete resource: ' + err.message);
    }
  };

  // Practice Links CRUD
  const handleAddPractice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      url: formData.get('url')
    };

    try {
      await api.addPracticeLink(practiceModal.sessionId, payload);
      loadModuleContent(expandedModuleId);
      setPracticeModal({ open: false, sessionId: null });
    } catch (err) {
      setError('Failed to add practice task: ' + err.message);
    }
  };

  const handleDeletePractice = async (id) => {
    if (!window.confirm('Delete this practice task permanently?')) return;
    try {
      await api.deletePracticeLink(id);
      loadModuleContent(expandedModuleId);
    } catch (err) {
      setError('Failed to delete practice link: ' + err.message);
    }
  };

  // HTML5 Drag and Drop Reordering
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex, listType, listData, parentId = null) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reorderedList = [...listData];
    const [removed] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIndex, 0, removed);

    // Capture IDs
    const orderedIds = reorderedList.map(item => item.id);

    try {
      if (listType === 'courses') {
        setCourses(reorderedList);
        await api.reorderCourses(orderedIds);
      } else if (listType === 'modules') {
        setModules(reorderedList);
        await api.reorderModules(orderedIds);
      } else if (listType === 'sessions') {
        setSessions(prev => ({ ...prev, [parentId]: reorderedList }));
        await api.reorderSessions(orderedIds);
      } else if (listType === 'questions') {
        setQuestions(prev => ({ ...prev, [parentId]: reorderedList }));
        await api.reorderQuestions(orderedIds);
      }
    } catch (err) {
      setError('Failed to reorder: ' + err.message);
      // reload
      if (listType === 'courses') fetchCourses();
      else if (listType === 'modules') loadCourseDetails(activeCourse.id);
      else loadModuleContent(parentId);
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-blue)' }}>Admin</span> Control Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {activeCourse ? `Managing: ${activeCourse.name}` : 'Create, organize, soft delete, and reorder courses and content.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {activeCourse ? (
            <button className="btn btn-secondary" onClick={onClearCourse}>
              &larr; Course Directory
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={onViewPublic}>
              &larr; View Public Website
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-container" style={{ padding: '16px 24px', marginBottom: '24px', borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#f87171', fontWeight: 500 }}>{error}</p>
          <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 600 }} onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ----------------- COURSE MANAGER (ROOT VIEW) ----------------- */}
      {!activeCourse && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className={`btn ${!showCourseBin ? 'btn-primary accent-blue' : 'btn-secondary'}`} onClick={() => setShowCourseBin(false)}>
                Active Courses ({courses.length})
              </button>
              <button className={`btn ${showCourseBin ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setShowCourseBin(true)}>
                Trash Bin ({deletedCourses.length})
              </button>
            </div>
            
            {!showCourseBin && (
              <button className="btn btn-primary accent-blue" onClick={() => setCourseModal({ open: true, mode: 'create', data: null })}>
                + Create Course
              </button>
            )}
          </div>

          {/* Active Courses List (Supports Drag-and-Drop Reordering) */}
          {!showCourseBin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map((course, idx) => (
                <div 
                  key={course.id} 
                  className={`draggable-item accent-${course.colorTheme || 'blue'}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'courses', courses)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-card)', borderLeft: '4px solid var(--theme-color)', cursor: 'move' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="drag-handle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{course.name}</h3>
                        <span className={`badge badge-${course.courseType === 'LEARNING' ? 'learning' : 'qbank'}`}>
                          {course.courseType === 'LEARNING' ? 'Learning' : 'Question Bank'}
                        </span>
                      </div>
                      {course.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                          {course.description.substring(0, 80)}{course.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => onSelectCourse(course.id)}>
                      Manage Content
                    </button>
                    <button className="btn btn-secondary" onClick={() => setCourseModal({ open: true, mode: 'edit', data: course })}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteCourse(course.id)}>
                      Soft Delete
                    </button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No active courses found. Click "+ Create Course" to add one.</p>
                </div>
              )}
            </div>
          )}

          {/* Deleted Courses Trash List (Can Restore) */}
          {showCourseBin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deletedCourses.map(course => (
                <div 
                  key={course.id} 
                  className="glass-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(244,63,94,0.1)' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{course.name}</h3>
                      <span className="badge badge-high">Deleted</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Type: {course.courseType}</p>
                  </div>
                  <div>
                    <button className="btn btn-secondary" style={{ borderColor: 'var(--accent-emerald)', color: '#34d399' }} onClick={() => handleRestoreCourse(course.id)}>
                      Restore Course
                    </button>
                  </div>
                </div>
              ))}
              {deletedCourses.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Trash bin is empty!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ----------------- MODULE / TOPIC MANAGER (COURSE VIEW) ----------------- */}
      {activeCourse && (
        <div className={`accent-${activeCourse.colorTheme || 'blue'}`}>
          
          {/* Active Course Banner */}
          <div className="glass-container" style={{ padding: '24px 30px', marginBottom: '30px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--theme-grad)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div>
                <span className={`badge badge-${activeCourse.courseType === 'LEARNING' ? 'learning' : 'qbank'}`} style={{ marginBottom: '10px', display: 'inline-block' }}>
                  {activeCourse.courseType === 'LEARNING' ? 'Learning Layout' : 'Question Bank Layout'}
                </span>
                <h2>{activeCourse.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>{activeCourse.description || 'No description.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setCourseModal({ open: true, mode: 'edit', data: activeCourse })}>
                  Edit Theme / Info
                </button>
                <button className="btn btn-secondary" onClick={onClearCourse}>
                  Close Course &times;
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className={`btn ${!showModuleBin ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowModuleBin(false)}>
                Active {activeCourse.courseType === 'LEARNING' ? 'Modules' : 'Topics'} ({modules.length})
              </button>
              <button className={`btn ${showModuleBin ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setShowModuleBin(true)}>
                Trash Bin ({deletedModules.length})
              </button>
            </div>
            {!showModuleBin && (
              <button className="btn btn-primary" onClick={() => setModuleModal({ open: true, mode: 'create', data: null })}>
                + Create {activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}
              </button>
            )}
          </div>

          {/* Active Modules list (supports drag-and-drop reordering) */}
          {!showModuleBin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modules.map((mod, idx) => {
                const isOpen = expandedModuleId === mod.id;
                
                return (
                  <div 
                    key={mod.id} 
                    className="glass-container"
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'modules', modules)}
                    style={{ overflow: 'hidden' }}
                  >
                    
                    {/* Module Accordion Header bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.01)', borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => handleToggleModule(mod.id)}>
                        <div className="drag-handle" style={{ cursor: 'move' }} onClick={e => e.stopPropagation()}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{mod.name}</h3>
                          {mod.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '3px' }}>{mod.description}</p>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => setModuleModal({ open: true, mode: 'edit', data: mod })} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDeleteModule(mod.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <button className="btn btn-secondary btn-icon" onClick={() => handleToggleModule(mod.id)} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'var(--transition-smooth)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Accordion Expanded Panel: SESSIONS or QUESTIONS CRUD editor */}
                    {isOpen && (
                      <div style={{ padding: '24px', background: 'rgba(0,0,0,0.1)' }}>
                        
                        {/* 1. LEARNING COURSE layout: Manage SESSIONS */}
                        {activeCourse.courseType === 'LEARNING' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" onClick={() => setShowSessionBin(prev => ({ ...prev, [mod.id]: false }))}>
                                  Active Sessions ({(sessions[mod.id] || []).length})
                                </button>
                                <button className="btn btn-secondary btn-danger" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => setShowSessionBin(prev => ({ ...prev, [mod.id]: true }))}>
                                  Sessions Bin ({(deletedSessions[mod.id] || []).length})
                                </button>
                              </div>
                              
                              {!showSessionBin[mod.id] && (
                                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setSessionModal({ open: true, mode: 'create', moduleId: mod.id, data: null })}>
                                  + Add Session
                                </button>
                              )}
                            </div>

                            {/* Active Sessions list */}
                            {!showSessionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(sessions[mod.id] || []).map((session, sIdx) => {
                                  const isSessOpen = expandedSessionId === session.id;
                                  
                                  return (
                                    <div 
                                      key={session.id} 
                                      className="glass-card" 
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, sIdx)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, sIdx, 'sessions', sessions[mod.id], mod.id)}
                                      style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedSessionId(isSessOpen ? null : session.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <div className="drag-handle" style={{ cursor: 'move' }} onClick={e => e.stopPropagation()}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                          </div>
                                          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', marginRight: '10px', color: 'var(--theme-color)', fontWeight: 600 }}>{session.sessionCode}</span>
                                          <span style={{ fontWeight: 500 }}>{session.contentTitle}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                                          <span className={`badge badge-${session.importanceLevel ? session.importanceLevel.toLowerCase() : 'medium'}`} style={{ fontSize: '0.7rem' }}>{session.importanceLevel}</span>
                                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSessionModal({ open: true, mode: 'edit', moduleId: mod.id, data: session })}>Edit</button>
                                          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDeleteSession(session.id, mod.id)}>Delete</button>
                                        </div>
                                      </div>

                                      {/* Session Links Manager */}
                                      {isSessOpen && (
                                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                          
                                          {/* Resources List manager */}
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Resource Files:</strong>
                                              <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => setResourceModal({ open: true, sessionId: session.id })}>+ Add File</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              {session.resources && session.resources.map(res => (
                                                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '4px', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '0.85rem' }}>{res.name}</span>
                                                  <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleDeleteResource(res.id)}>Remove</button>
                                                </div>
                                              ))}
                                              {(!session.resources || session.resources.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No resources uploaded</span>}
                                            </div>
                                          </div>

                                          {/* Practice Tasks manager */}
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Practice Tasks:</strong>
                                              <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => setPracticeModal({ open: true, sessionId: session.id })}>+ Add Task</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              {session.practiceLinks && session.practiceLinks.map(prac => (
                                                <div key={prac.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '4px', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '0.85rem' }}>{prac.name}</span>
                                                  <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleDeletePractice(prac.id)}>Remove</button>
                                                </div>
                                              ))}
                                              {(!session.practiceLinks || session.practiceLinks.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No practice links added</span>}
                                            </div>
                                          </div>

                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {(sessions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No active sessions.</p>}
                              </div>
                            )}

                            {/* Session Trash Bin */}
                            {showSessionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(deletedSessions[mod.id] || []).map(session => (
                                  <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.1)', padding: '12px 16px', borderRadius: '6px', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{session.sessionCode} - {session.contentTitle}</span>
                                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-emerald)', color: '#34d399' }} onClick={() => handleRestoreSession(session.id, mod.id)}>
                                      Restore
                                    </button>
                                  </div>
                                ))}
                                {(deletedSessions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>Session trash is empty.</p>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. QUESTION_BANK COURSE layout: Manage QUESTIONS */}
                        {activeCourse.courseType === 'QUESTION_BANK' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" onClick={() => setShowQuestionBin(prev => ({ ...prev, [mod.id]: false }))}>
                                  Active Questions ({(questions[mod.id] || []).length})
                                </button>
                                <button className="btn btn-secondary btn-danger" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => setShowQuestionBin(prev => ({ ...prev, [mod.id]: true }))}>
                                  Questions Bin ({(deletedQuestions[mod.id] || []).length})
                                </button>
                              </div>
                              {!showQuestionBin[mod.id] && (
                                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setQuestionModal({ open: true, mode: 'create', moduleId: mod.id, data: null })}>
                                  + Add Question
                                </button>
                              )}
                            </div>

                            {/* Active Questions list */}
                            {!showQuestionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(questions[mod.id] || []).map((question, qIdx) => (
                                  <div 
                                    key={question.id} 
                                    className="glass-card" 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, qIdx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, qIdx, 'questions', questions[mod.id], mod.id)}
                                    style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div style={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, marginRight: '16px' }}>
                                        <div className="drag-handle" style={{ cursor: 'move', marginTop: '3px' }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                        </div>
                                        <div>
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q{qIdx + 1}. ({question.difficultyLevel})</span>
                                          <p style={{ marginTop: '4px', fontWeight: 500, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{question.questionText}</p>
                                          
                                          {/* Options rendering */}
                                          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {question.options.map((opt, oIdx) => (
                                              <span key={oIdx} style={{ fontSize: '0.8rem', color: opt === question.correctAnswer ? '#34d399' : 'var(--text-secondary)', background: opt === question.correctAnswer ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', border: opt === question.correctAnswer ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(255,255,255,0.03)' }}>
                                                {String.fromCharCode(65 + oIdx)}. {opt}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setQuestionModal({ open: true, mode: 'edit', moduleId: mod.id, data: question })}>Edit</button>
                                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleDeleteQuestion(question.id, mod.id)}>Delete</button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(questions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No active questions.</p>}
                              </div>
                            )}

                            {/* Questions Trash Bin */}
                            {showQuestionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(deletedQuestions[mod.id] || []).map(question => (
                                  <div key={question.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.1)', padding: '12px 16px', borderRadius: '6px', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: '0.9rem' }}>{question.questionText.substring(0, 80)}...</span>
                                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-emerald)', color: '#34d399' }} onClick={() => handleRestoreQuestion(question.id, mod.id)}>
                                      Restore
                                    </button>
                                  </div>
                                ))}
                                {(deletedQuestions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>Questions trash is empty.</p>}
                              </div>
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
                  <p style={{ color: 'var(--text-muted)' }}>
                    No active {activeCourse.courseType === 'LEARNING' ? 'modules' : 'topics'} found. Click "+ Create {activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}" to add one.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Soft-deleted Modules Bin */}
          {showModuleBin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deletedModules.map(mod => (
                <div 
                  key={mod.id} 
                  className="glass-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(244,63,94,0.1)' }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{mod.name}</h3>
                  </div>
                  <div>
                    <button className="btn btn-secondary" style={{ borderColor: 'var(--accent-emerald)', color: '#34d399' }} onClick={() => handleRestoreModule(mod.id)}>
                      Restore
                    </button>
                  </div>
                </div>
              ))}
              {deletedModules.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Trash bin is empty!</p>
                </div>
              )}
            </div>
          )}
          
        </div>
      )}

      {/* ========================================================================= */}
      {/* ============================== FORM MODALS ============================== */}
      {/* ========================================================================= */}

      {/* 1. COURSE FORM MODAL */}
      {courseModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {courseModal.mode === 'create' ? 'Create New Course' : 'Edit Course Settings'}
            </h2>
            
            <form onSubmit={handleSaveCourse}>
              <div style={{ marginBottom: '16px' }}>
                <label>Course Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={courseModal.mode === 'edit' ? courseModal.data.name : ''} 
                  required 
                  placeholder="e.g. DSA, Aptitude, Java" 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>Course Type</label>
                <select 
                  name="courseType" 
                  defaultValue={courseModal.mode === 'edit' ? courseModal.data.courseType : 'LEARNING'}
                  disabled={courseModal.mode === 'edit'} // Lock type after creation
                >
                  <option value="LEARNING">Learning Course (Modules & Sessions)</option>
                  <option value="QUESTION_BANK">Question Bank (Topics & Questions)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>Color Theme</label>
                <select name="colorTheme" defaultValue={courseModal.mode === 'edit' ? courseModal.data.colorTheme : 'blue'}>
                  <option value="blue">Deep Blue Accent</option>
                  <option value="emerald">Emerald Teal Accent</option>
                  <option value="royal">Royal Purple Accent</option>
                  <option value="amber">Warm Amber Accent</option>
                  <option value="rose">Sunset Rose Accent</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label>Description</label>
                <textarea 
                  name="description" 
                  rows="4" 
                  defaultValue={courseModal.mode === 'edit' ? courseModal.data.description : ''}
                  placeholder="Enter a description for this course..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCourseModal({ open: false, mode: 'create', data: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary accent-blue">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODULE / TOPIC FORM MODAL */}
      {moduleModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {moduleModal.mode === 'create' ? `Create ${activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}` : `Edit ${activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}`}
            </h2>
            
            <form onSubmit={handleSaveModule}>
              <div style={{ marginBottom: '16px' }}>
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={moduleModal.mode === 'edit' ? moduleModal.data.name : ''} 
                  required 
                  placeholder={activeCourse.courseType === 'LEARNING' ? 'e.g., Arrays, String Handling' : 'e.g., Percentage, Profit & Loss'} 
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label>Description (Optional)</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  defaultValue={moduleModal.mode === 'edit' ? moduleModal.data.description : ''}
                  placeholder="Short description..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModuleModal({ open: false, mode: 'create', data: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SESSION FORM MODAL */}
      {sessionModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {sessionModal.mode === 'create' ? 'Add Session' : 'Edit Session'}
            </h2>
            
            <form onSubmit={handleSaveSession}>
              <div style={{ marginBottom: '16px' }}>
                <label>Session Code</label>
                <input 
                  type="text" 
                  name="sessionCode" 
                  defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.sessionCode : ''} 
                  required 
                  placeholder="e.g. S1, S2, L10" 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label>Content Title</label>
                <input 
                  type="text" 
                  name="contentTitle" 
                  defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.contentTitle : ''} 
                  required 
                  placeholder="e.g. Introduction to Binary Search" 
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label>Importance Level</label>
                <select name="importanceLevel" defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.importanceLevel : 'MEDIUM'}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSessionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. QUESTION FORM MODAL */}
      {questionModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d', maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {questionModal.mode === 'create' ? 'Add MCQ Question' : 'Edit MCQ Question'}
            </h2>
            
            <form onSubmit={handleSaveQuestion}>
              <div style={{ marginBottom: '14px' }}>
                <label>Question Text</label>
                <textarea 
                  name="questionText" 
                  rows="3" 
                  defaultValue={questionModal.mode === 'edit' ? questionModal.data.questionText : ''} 
                  required 
                  placeholder="Write the MCQ question here..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label>Option A</label>
                  <input type="text" name="optionA" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[0] : ''} required />
                </div>
                <div>
                  <label>Option B</label>
                  <input type="text" name="optionB" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[1] : ''} required />
                </div>
                <div>
                  <label>Option C</label>
                  <input type="text" name="optionC" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[2] : ''} required />
                </div>
                <div>
                  <label>Option D</label>
                  <input type="text" name="optionD" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[3] : ''} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label>Correct Answer Text</label>
                  <input 
                    type="text" 
                    name="correctAnswer" 
                    defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : ''} 
                    required 
                    placeholder="Must match one option EXACTLY" 
                  />
                </div>
                <div>
                  <label>Difficulty</label>
                  <select name="difficultyLevel" defaultValue={questionModal.mode === 'edit' ? questionModal.data.difficultyLevel : 'MEDIUM'}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label>Tags (Comma-separated, optional)</label>
                <input 
                  type="text" 
                  name="tags" 
                  defaultValue={questionModal.mode === 'edit' ? questionModal.data.tags : ''} 
                  placeholder="e.g. basics, formula, percentage" 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Explanation (Optional)</label>
                <textarea 
                  name="explanation" 
                  rows="2" 
                  defaultValue={questionModal.mode === 'edit' ? questionModal.data.explanation : ''}
                  placeholder="Step-by-step solution details..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setQuestionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD RESOURCE MODAL */}
      {resourceModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Add Downloadable Resource</h2>
            <form onSubmit={handleAddResource}>
              <div style={{ marginBottom: '16px' }}>
                <label>Material / File Name</label>
                <input type="text" name="name" required placeholder="e.g. Lecture Notes PDF, GitHub Code Repo" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Link URL</label>
                <input type="url" name="url" required placeholder="https://example.com/file" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResourceModal({ open: false, sessionId: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD PRACTICE LINK MODAL */}
      {practiceModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#12141d' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Add Practice Link</h2>
            <form onSubmit={handleAddPractice}>
              <div style={{ marginBottom: '16px' }}>
                <label>Task / Platform Title</label>
                <input type="text" name="name" required placeholder="e.g. LeetCode #1, HackerRank Quiz" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Task URL</label>
                <input type="url" name="url" required placeholder="https://leetcode.com/..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPracticeModal({ open: false, sessionId: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Practice Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
