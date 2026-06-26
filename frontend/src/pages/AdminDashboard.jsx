import React, { useState, useEffect } from 'react';
import courseService from '../services/courseService';
import moduleService from '../services/moduleService';
import sessionService from '../services/sessionService';
import questionService from '../services/questionService';
import { useToast } from '../context/ToastContext';

// Atomic UI components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import theme from '../config/theme';

export default function AdminDashboard({ onViewPublic, onSelectCourse, selectedCourseId, onClearCourse }) {
  const { addToast } = useToast();
  
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

  // Centralized Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

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
      const data = await courseService.getCourses();
      setCourses(data || []);
    } catch (err) {
      setError('Failed to fetch courses: ' + err.message);
    }
  };

  const fetchDeletedCourses = async () => {
    try {
      const data = await courseService.getDeletedCourses();
      setDeletedCourses(data || []);
    } catch (err) {
      setError('Failed to fetch deleted courses: ' + err.message);
    }
  };

  const loadCourseDetails = async (courseId) => {
    setLoading(true);
    try {
      const course = await courseService.getCourseById(courseId);
      setActiveCourse(course);
      
      const activeMods = await moduleService.getModules(courseId);
      setModules(activeMods || []);
      
      const delMods = await moduleService.getDeletedModules(courseId);
      setDeletedModules(delMods || []);
      
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
        const activeSess = await sessionService.getSessions(moduleId);
        setSessions(prev => ({ ...prev, [moduleId]: activeSess || [] }));
        
        const delSess = await sessionService.getDeletedSessions(moduleId);
        setDeletedSessions(prev => ({ ...prev, [moduleId]: delSess || [] }));
      } else {
        const activeQuest = await questionService.getQuestions(moduleId);
        setQuestions(prev => ({ ...prev, [moduleId]: activeQuest || [] }));
        
        const delQuest = await questionService.getDeletedQuestions(moduleId);
        setDeletedQuestions(prev => ({ ...prev, [moduleId]: delQuest || [] }));
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

  const triggerConfirm = (title, message, onConfirm, variant = 'danger') => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      variant
    });
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
        await courseService.createCourse(payload);
        addToast('Course created successfully!', 'success');
      } else {
        await courseService.updateCourse(courseModal.data.id, payload);
        addToast('Course updated successfully!', 'success');
      }
      fetchCourses();
      setCourseModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      setError('Failed to save course: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeleteCourse = (id) => {
    triggerConfirm(
      'Soft Delete Course?',
      'Are you sure you want to soft delete this course? Its contents will be sent to the Trash Bin.',
      async () => {
        try {
          await courseService.deleteCourse(id);
          addToast('Course soft deleted!', 'success');
          fetchCourses();
          fetchDeletedCourses();
        } catch (err) {
          setError('Failed to delete course: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
  };

  const handleRestoreCourse = async (id) => {
    try {
      await courseService.restoreCourse(id);
      addToast('Course restored successfully!', 'success');
      fetchCourses();
      fetchDeletedCourses();
    } catch (err) {
      setError('Failed to restore course: ' + err.message);
      addToast(err.message, 'error');
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
        await moduleService.createModule(activeCourse.id, payload);
        addToast('Module created successfully!', 'success');
      } else {
        await moduleService.updateModule(moduleModal.data.id, payload);
        addToast('Module updated successfully!', 'success');
      }
      loadCourseDetails(activeCourse.id);
      setModuleModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      setError('Failed to save module: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeleteModule = (id) => {
    triggerConfirm(
      'Soft Delete Module?',
      'Are you sure you want to soft delete this module? All associated sessions/questions will be hidden.',
      async () => {
        try {
          await moduleService.deleteModule(id);
          addToast('Module soft deleted!', 'success');
          loadCourseDetails(activeCourse.id);
        } catch (err) {
          setError('Failed to delete module: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
  };

  const handleRestoreModule = async (id) => {
    try {
      await moduleService.restoreModule(id);
      addToast('Module restored successfully!', 'success');
      loadCourseDetails(activeCourse.id);
    } catch (err) {
      setError('Failed to restore module: ' + err.message);
      addToast(err.message, 'error');
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
        await sessionService.createSession(moduleId, payload);
        addToast('Session added successfully!', 'success');
      } else {
        await sessionService.updateSession(sessionModal.data.id, payload);
        addToast('Session updated successfully!', 'success');
      }
      loadModuleContent(moduleId);
      setSessionModal({ open: false, mode: 'create', moduleId: null, data: null });
    } catch (err) {
      setError('Failed to save session: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeleteSession = (id, moduleId) => {
    triggerConfirm(
      'Soft Delete Session?',
      'Are you sure you want to soft delete this session?',
      async () => {
        try {
          await sessionService.deleteSession(id);
          addToast('Session soft deleted!', 'success');
          loadModuleContent(moduleId);
        } catch (err) {
          setError('Failed to delete session: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
  };

  const handleRestoreSession = async (id, moduleId) => {
    try {
      await sessionService.restoreSession(id);
      addToast('Session restored successfully!', 'success');
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to restore session: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  // Question CRUD
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
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
        await questionService.createQuestion(moduleId, payload);
        addToast('Question added successfully!', 'success');
      } else {
        await questionService.updateQuestion(questionModal.data.id, payload);
        addToast('Question updated successfully!', 'success');
      }
      loadModuleContent(moduleId);
      setQuestionModal({ open: false, mode: 'create', moduleId: null, data: null });
    } catch (err) {
      setError('Failed to save question: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeleteQuestion = (id, moduleId) => {
    triggerConfirm(
      'Soft Delete Question?',
      'Are you sure you want to soft delete this question?',
      async () => {
        try {
          await questionService.deleteQuestion(id);
          addToast('Question soft deleted!', 'success');
          loadModuleContent(moduleId);
        } catch (err) {
          setError('Failed to delete question: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
  };

  const handleRestoreQuestion = async (id, moduleId) => {
    try {
      await questionService.restoreQuestion(id);
      addToast('Question restored successfully!', 'success');
      loadModuleContent(moduleId);
    } catch (err) {
      setError('Failed to restore question: ' + err.message);
      addToast(err.message, 'error');
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
      await sessionService.addResource(resourceModal.sessionId, payload);
      addToast('Reference link added!', 'success');
      loadModuleContent(expandedModuleId);
      setResourceModal({ open: false, sessionId: null });
    } catch (err) {
      setError('Failed to add resource: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeleteResource = (id) => {
    triggerConfirm(
      'Remove Resource Link?',
      'Are you sure you want to permanently delete this resource link?',
      async () => {
        try {
          await sessionService.deleteResource(id);
          addToast('Resource removed permanently!', 'success');
          loadModuleContent(expandedModuleId);
        } catch (err) {
          setError('Failed to delete resource: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
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
      await sessionService.addPracticeLink(practiceModal.sessionId, payload);
      addToast('Practice task linked!', 'success');
      loadModuleContent(expandedModuleId);
      setPracticeModal({ open: false, sessionId: null });
    } catch (err) {
      setError('Failed to add practice task: ' + err.message);
      addToast(err.message, 'error');
    }
  };

  const handleDeletePractice = (id) => {
    triggerConfirm(
      'Remove Practice Task?',
      'Are you sure you want to permanently delete this practice link?',
      async () => {
        try {
          await sessionService.deletePracticeLink(id);
          addToast('Practice link removed permanently!', 'success');
          loadModuleContent(expandedModuleId);
        } catch (err) {
          setError('Failed to delete practice link: ' + err.message);
          addToast(err.message, 'error');
        }
      }
    );
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
    const orderedIds = reorderedList.map(item => item.id);

    try {
      if (listType === 'courses') {
        setCourses(reorderedList);
        await courseService.reorderCourses(orderedIds);
      } else if (listType === 'modules') {
        setModules(reorderedList);
        await moduleService.reorderModules(orderedIds);
      } else if (listType === 'sessions') {
        setSessions(prev => ({ ...prev, [parentId]: reorderedList }));
        await sessionService.reorderSessions(orderedIds);
      } else if (listType === 'questions') {
        setQuestions(prev => ({ ...prev, [parentId]: reorderedList }));
        await questionService.reorderQuestions(orderedIds);
      }
      addToast('Order updated!', 'success');
    } catch (err) {
      setError('Failed to reorder: ' + err.message);
      addToast(err.message, 'error');
      // reload
      if (listType === 'courses') fetchCourses();
      else if (listType === 'modules') loadCourseDetails(activeCourse.id);
      else loadModuleContent(parentId);
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: theme.colors.blue }}>Admin</span> Control Panel
          </h1>
          <p style={{ color: theme.colors.textSecondary, marginTop: '8px' }}>
            {activeCourse ? `Managing: ${activeCourse.name}` : 'Create, organize, soft delete, and reorder courses and content.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {activeCourse ? (
            <Button variant="secondary" onClick={onClearCourse}>
              &larr; Course Directory
            </Button>
          ) : (
            <Button variant="secondary" onClick={onViewPublic}>
              &larr; View Public Website
            </Button>
          )}
        </div>
      </div>

      {error && (
        <ErrorMessage 
          title="Operation Error" 
          message={error} 
          onRetry={() => setError(null)} 
          style={{ marginBottom: '24px' }} 
        />
      )}

      {/* ----------------- COURSE MANAGER (ROOT VIEW) ----------------- */}
      {!activeCourse && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant={!showCourseBin ? 'primary' : 'secondary'} onClick={() => setShowCourseBin(false)}>
                Active Courses ({courses.length})
              </Button>
              <Button variant={showCourseBin ? 'danger' : 'secondary'} onClick={() => setShowCourseBin(true)}>
                Trash Bin ({deletedCourses.length})
              </Button>
            </div>
            
            {!showCourseBin && (
              <Button onClick={() => setCourseModal({ open: true, mode: 'create', data: null })}>
                + Create Course
              </Button>
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: theme.colors.bgCard, borderLeft: '4px solid var(--theme-color)', cursor: 'move' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="drag-handle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{course.name}</h3>
                        <Badge type={course.courseType}>
                          {course.courseType === 'LEARNING' ? 'Learning' : 'Question Bank'}
                        </Badge>
                      </div>
                      {course.description && (
                        <p style={{ color: theme.colors.textSecondary, fontSize: '0.85rem', marginTop: '4px' }}>
                          {course.description.substring(0, 80)}{course.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="secondary" onClick={() => onSelectCourse(course.id)}>
                      Manage Content
                    </Button>
                    <Button variant="secondary" onClick={() => setCourseModal({ open: true, mode: 'edit', data: course })}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteCourse(course.id)}>
                      Soft Delete
                    </Button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <Card hoverable={false} padding="40px" style={{ textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, margin: 0 }}>No active courses found. Click "+ Create Course" to add one.</p>
                </Card>
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.colors.textSecondary, textDecoration: 'line-through' }}>{course.name}</h3>
                      <Badge type="high">Deleted</Badge>
                    </div>
                    <p style={{ color: theme.colors.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>Type: {course.courseType}</p>
                  </div>
                  <div>
                    <Button variant="secondary" style={{ borderColor: theme.colors.emerald, color: '#34d399' }} onClick={() => handleRestoreCourse(course.id)}>
                      Restore Course
                    </Button>
                  </div>
                </div>
              ))}
              {deletedCourses.length === 0 && (
                <Card hoverable={false} padding="40px" style={{ textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, margin: 0 }}>Trash bin is empty!</p>
                </Card>
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
                <Badge type={activeCourse.courseType} style={{ marginBottom: '10px' }}>
                  {activeCourse.courseType === 'LEARNING' ? 'Learning Layout' : 'Question Bank Layout'}
                </Badge>
                <h2>{activeCourse.name}</h2>
                <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', marginTop: '6px' }}>{activeCourse.description || 'No description.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" onClick={() => setCourseModal({ open: true, mode: 'edit', data: activeCourse })}>
                  Edit Theme / Info
                </Button>
                <Button variant="secondary" onClick={onClearCourse}>
                  Close Course &times;
                </Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant={!showModuleBin ? 'primary' : 'secondary'} onClick={() => setShowModuleBin(false)}>
                Active {activeCourse.courseType === 'LEARNING' ? 'Modules' : 'Topics'} ({modules.length})
              </Button>
              <Button variant={showModuleBin ? 'danger' : 'secondary'} onClick={() => setShowModuleBin(true)}>
                Trash Bin ({deletedModules.length})
              </Button>
            </div>
            {!showModuleBin && (
              <Button onClick={() => setModuleModal({ open: true, mode: 'create', data: null })}>
                + Create {activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}
              </Button>
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
                          {mod.description && <p style={{ color: theme.colors.textSecondary, fontSize: '0.8rem', marginTop: '3px' }}>{mod.description}</p>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button variant="secondary" className="btn-icon" onClick={() => setModuleModal({ open: true, mode: 'edit', data: mod })} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </Button>
                        <Button variant="danger" className="btn-icon" onClick={() => handleDeleteModule(mod.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </Button>
                        <Button variant="secondary" className="btn-icon" onClick={() => handleToggleModule(mod.id)} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'var(--transition-smooth)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                        </Button>
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
                                <Button variant="secondary" onClick={() => setShowSessionBin(prev => ({ ...prev, [mod.id]: false }))}>
                                  Active Sessions ({(sessions[mod.id] || []).length})
                                </Button>
                                <Button variant="danger" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => setShowSessionBin(prev => ({ ...prev, [mod.id]: true }))}>
                                  Sessions Bin ({(deletedSessions[mod.id] || []).length})
                                </Button>
                              </div>
                              
                              {!showSessionBin[mod.id] && (
                                <Button size="sm" onClick={() => setSessionModal({ open: true, mode: 'create', moduleId: mod.id, data: null })}>
                                  + Add Session
                                </Button>
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
                                          <Badge type={session.importanceLevel || 'MEDIUM'}>{session.importanceLevel}</Badge>
                                          <Button size="sm" variant="secondary" onClick={() => setSessionModal({ open: true, mode: 'edit', moduleId: mod.id, data: session })}>Edit</Button>
                                          <Button size="sm" variant="danger" onClick={() => handleDeleteSession(session.id, mod.id)}>Delete</Button>
                                        </div>
                                      </div>

                                      {/* Session Links Manager */}
                                      {isSessOpen && (
                                        <div style={{ marginTop: '16px', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                          
                                          {/* Resources List manager */}
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <strong style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>Resource Files:</strong>
                                              <Button size="sm" variant="secondary" onClick={() => setResourceModal({ open: true, sessionId: session.id })}>+ Add File</Button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              {session.resources && session.resources.map(res => (
                                                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '4px', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '0.85rem' }}>{res.name}</span>
                                                  <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleDeleteResource(res.id)}>Remove</button>
                                                </div>
                                              ))}
                                              {(!session.resources || session.resources.length === 0) && <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>No resources uploaded</span>}
                                            </div>
                                          </div>

                                          {/* Practice Tasks manager */}
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <strong style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>Practice Tasks:</strong>
                                              <Button size="sm" variant="secondary" onClick={() => setPracticeModal({ open: true, sessionId: session.id })}>+ Add Task</Button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              {session.practiceLinks && session.practiceLinks.map(prac => (
                                                <div key={prac.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '4px', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '0.85rem' }}>{prac.name}</span>
                                                  <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleDeletePractice(prac.id)}>Remove</button>
                                                </div>
                                              ))}
                                              {(!session.practiceLinks || session.practiceLinks.length === 0) && <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>No practice links added</span>}
                                            </div>
                                          </div>

                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {(sessions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, textAlign: 'center', padding: '12px' }}>No active sessions.</p>}
                              </div>
                            )}

                            {/* Session Trash Bin */}
                            {showSessionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(deletedSessions[mod.id] || []).map(session => (
                                  <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.1)', padding: '12px 16px', borderRadius: '6px', alignItems: 'center' }}>
                                    <span style={{ color: theme.colors.textSecondary, textDecoration: 'line-through' }}>{session.sessionCode} - {session.contentTitle}</span>
                                    <Button variant="secondary" style={{ borderColor: theme.colors.emerald, color: '#34d399' }} onClick={() => handleRestoreSession(session.id, mod.id)}>
                                      Restore
                                    </Button>
                                  </div>
                                ))}
                                {(deletedSessions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, textAlign: 'center', padding: '12px' }}>Session trash is empty.</p>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. QUESTION_BANK COURSE layout: Manage QUESTIONS */}
                        {activeCourse.courseType === 'QUESTION_BANK' && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="secondary" onClick={() => setShowQuestionBin(prev => ({ ...prev, [mod.id]: false }))}>
                                  Active Questions ({(questions[mod.id] || []).length})
                                </Button>
                                <Button variant="danger" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => setShowQuestionBin(prev => ({ ...prev, [mod.id]: true }))}>
                                  Questions Bin ({(deletedQuestions[mod.id] || []).length})
                                </Button>
                              </div>
                              {!showQuestionBin[mod.id] && (
                                <Button size="sm" onClick={() => setQuestionModal({ open: true, mode: 'create', moduleId: mod.id, data: null })}>
                                  + Add Question
                                </Button>
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
                                          <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Q{qIdx + 1}. ({question.difficultyLevel})</span>
                                          <p style={{ marginTop: '4px', fontWeight: 500, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{question.questionText}</p>
                                          
                                          {/* Options rendering */}
                                          <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {question.options.map((opt, oIdx) => (
                                              <span key={oIdx} style={{ fontSize: '0.8rem', color: opt === question.correctAnswer ? '#34d399' : theme.colors.textSecondary, background: opt === question.correctAnswer ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', border: opt === question.correctAnswer ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(255,255,255,0.03)' }}>
                                                {String.fromCharCode(65 + oIdx)}. {opt}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <Button size="sm" variant="secondary" onClick={() => setQuestionModal({ open: true, mode: 'edit', moduleId: mod.id, data: question })}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(question.id, mod.id)}>Delete</Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(questions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, textAlign: 'center', padding: '12px' }}>No active questions.</p>}
                              </div>
                            )}

                            {/* Questions Trash Bin */}
                            {showQuestionBin[mod.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(deletedQuestions[mod.id] || []).map(question => (
                                  <div key={question.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(244,63,94,0.02)', border: '1px solid rgba(244,63,94,0.1)', padding: '12px 16px', borderRadius: '6px', alignItems: 'center' }}>
                                    <span style={{ color: theme.colors.textSecondary, textDecoration: 'line-through', fontSize: '0.9rem' }}>{question.questionText.substring(0, 80)}...</span>
                                    <Button variant="secondary" style={{ borderColor: theme.colors.emerald, color: '#34d399' }} onClick={() => handleRestoreQuestion(question.id, mod.id)}>
                                      Restore
                                    </Button>
                                  </div>
                                ))}
                                {(deletedQuestions[mod.id] || []).length === 0 && <p style={{ fontSize: '0.85rem', color: theme.colors.textMuted, textAlign: 'center', padding: '12px' }}>Questions trash is empty.</p>}
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
                <Card hoverable={false} padding="40px" style={{ textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, margin: 0 }}>
                    No active {activeCourse.courseType === 'LEARNING' ? 'modules' : 'topics'} found. Click "+ Create {activeCourse.courseType === 'LEARNING' ? 'Module' : 'Topic'}" to add one.
                  </p>
                </Card>
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
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: theme.colors.textSecondary, textDecoration: 'line-through' }}>{mod.name}</h3>
                  </div>
                  <div>
                    <Button variant="secondary" style={{ borderColor: theme.colors.emerald, color: '#34d399' }} onClick={() => handleRestoreModule(mod.id)}>
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
              {deletedModules.length === 0 && (
                <Card hoverable={false} padding="40px" style={{ textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, margin: 0 }}>Trash bin is empty!</p>
                </Card>
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
              <Input
                label="Course Name"
                id="name"
                name="name"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.name : ''}
                required
                placeholder="e.g. DSA, Aptitude, Java"
              />

              <Select
                label="Course Type"
                id="courseType"
                name="courseType"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.courseType : 'LEARNING'}
                disabled={courseModal.mode === 'edit'}
                options={[
                  { value: 'LEARNING', label: 'Learning Course (Modules & Sessions)' },
                  { value: 'QUESTION_BANK', label: 'Question Bank (Topics & Questions)' }
                ]}
              />

              <Select
                label="Color Theme"
                id="colorTheme"
                name="colorTheme"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.colorTheme : 'blue'}
                options={[
                  { value: 'blue', label: 'Deep Blue Accent' },
                  { value: 'emerald', label: 'Emerald Teal Accent' },
                  { value: 'royal', label: 'Royal Purple Accent' },
                  { value: 'amber', label: 'Warm Amber Accent' },
                  { value: 'rose', label: 'Sunset Rose Accent' }
                ]}
              />

              <Textarea
                label="Description"
                id="description"
                name="description"
                rows="4"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.description : ''}
                placeholder="Enter a description for this course..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setCourseModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
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
              <Input
                label="Name"
                id="name"
                name="name"
                defaultValue={moduleModal.mode === 'edit' ? moduleModal.data.name : ''}
                required
                placeholder={activeCourse.courseType === 'LEARNING' ? 'e.g., Arrays, String Handling' : 'e.g., Percentage, Profit & Loss'}
              />

              <Textarea
                label="Description (Optional)"
                id="description"
                name="description"
                rows="3"
                defaultValue={moduleModal.mode === 'edit' ? moduleModal.data.description : ''}
                placeholder="Short description..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setModuleModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
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
              <Input
                label="Session Code"
                id="sessionCode"
                name="sessionCode"
                defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.sessionCode : ''}
                required
                placeholder="e.g. S1, S2, L10"
              />

              <Input
                label="Content Title"
                id="contentTitle"
                name="contentTitle"
                defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.contentTitle : ''}
                required
                placeholder="e.g. Introduction to Binary Search"
              />

              <Select
                label="Importance Level"
                id="importanceLevel"
                name="importanceLevel"
                defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.importanceLevel : 'MEDIUM'}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' }
                ]}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setSessionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</Button>
                <Button type="submit">Save Session</Button>
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
              <Textarea
                label="Question Text"
                id="questionText"
                name="questionText"
                rows="3"
                defaultValue={questionModal.mode === 'edit' ? questionModal.data.questionText : ''}
                required
                placeholder="Write the MCQ question here..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <Input label="Option A" id="optionA" name="optionA" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[0] : ''} required />
                <Input label="Option B" id="optionB" name="optionB" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[1] : ''} required />
                <Input label="Option C" id="optionC" name="optionC" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[2] : ''} required />
                <Input label="Option D" id="optionD" name="optionD" defaultValue={questionModal.mode === 'edit' ? questionModal.data.options[3] : ''} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <Input
                  label="Correct Answer Text"
                  id="correctAnswer"
                  name="correctAnswer"
                  defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : ''}
                  required
                  placeholder="Must match one option EXACTLY"
                />

                <Select
                  label="Difficulty"
                  id="difficultyLevel"
                  name="difficultyLevel"
                  defaultValue={questionModal.mode === 'edit' ? questionModal.data.difficultyLevel : 'MEDIUM'}
                  options={[
                    { value: 'EASY', label: 'Easy' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HARD', label: 'Hard' }
                  ]}
                />
              </div>

              <Input
                label="Tags (Comma-separated, optional)"
                id="tags"
                name="tags"
                defaultValue={questionModal.mode === 'edit' ? questionModal.data.tags : ''}
                placeholder="e.g. basics, formula, percentage"
              />

              <Textarea
                label="Explanation (Optional)"
                id="explanation"
                name="explanation"
                rows="2"
                defaultValue={questionModal.mode === 'edit' ? questionModal.data.explanation : ''}
                placeholder="Step-by-step solution details..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setQuestionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</Button>
                <Button type="submit">Save Question</Button>
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
              <Input label="Material / File Name" id="name" name="name" required placeholder="e.g. Lecture Notes PDF, GitHub Code Repo" />
              <Input label="Link URL" id="url" name="url" type="url" required placeholder="https://example.com/file" />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setResourceModal({ open: false, sessionId: null })}>Cancel</Button>
                <Button type="submit">Add Resource</Button>
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
              <Input label="Task / Platform Title" id="name" name="name" required placeholder="e.g. LeetCode #1, HackerRank Quiz" />
              <Input label="Task URL" id="url" name="url" type="url" required placeholder="https://leetcode.com/..." />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setPracticeModal({ open: false, sessionId: null })}>Cancel</Button>
                <Button type="submit">Add Practice Link</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        variant={confirmDialog.variant}
      />

    </div>
  );
}
