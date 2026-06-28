import React, { useState, useEffect } from 'react';
import courseService from '../services/courseService';
import moduleService from '../services/moduleService';
import sessionService from '../services/sessionService';
import questionService from '../services/questionService';
import authService from '../services/authService';
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

  const formatRelativeTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Just Now';
    try {
      const date = new Date(dateTimeStr);
      const now = new Date();
      const diffMs = now - date;
      if (isNaN(diffMs) || diffMs < 0) return 'Just Now';
      
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just Now';
      
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch (_) {
      return 'Just Now';
    }
  };
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'courses' | 'modules' | 'sessions' | 'trash' | 'settings'

  // Data States
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
  
  // Stats
  const [stats, setStats] = useState({
    courses: 0,
    modules: 0,
    sessions: 0,
    questions: 0,
    resources: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);

  // Local Storage Trash overrides (for permanent deletion)
  const [permanentlyDeletedIds, setPermanentlyDeletedIds] = useState(() => {
    const saved = localStorage.getItem('perm_deleted_ids');
    return saved ? JSON.parse(saved) : { courses: [], modules: [], sessions: [], questions: [] };
  });

  // UI / Bin toggles
  const [trashType, setTrashType] = useState('courses'); // 'courses' | 'modules' | 'sessions' | 'questions'
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Drag-and-Drop State
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Modals state
  const [courseModal, setCourseModal] = useState({ open: false, mode: 'create', data: null });
  const [moduleModal, setModuleModal] = useState({ open: false, mode: 'create', data: null });
  const [sessionModal, setSessionModal] = useState({ open: false, mode: 'create', moduleId: null, data: null });
  const [questionModal, setQuestionModal] = useState({ open: false, mode: 'create', moduleId: null, data: null });

  // Session Form dynamic lists & dropdowns states
  const [sessionResources, setSessionResources] = useState([]);
  const [sessionPracticeLinks, setSessionPracticeLinks] = useState([]);
  const [importanceType, setImportanceType] = useState('Medium');
  const [customImportanceVal, setCustomImportanceVal] = useState('');
  const [sessionFormErrors, setSessionFormErrors] = useState({});

  // Inactivity Auto-Logout (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    let timeoutId;

    const performLogout = () => {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
      addToast('Session expired due to inactivity. Please log in again.', 'info');
      onViewPublic();
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(performLogout, INACTIVITY_TIMEOUT);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, onViewPublic, addToast]);

  // Background Session Health Check (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(async () => {
      try {
        await authService.getProfile();
      } catch (err) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_session_token');
        setIsAuthenticated(false);
        addToast('Your session has been invalidated (possibly logged in from another device).', 'error');
        onViewPublic();
      }
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isAuthenticated, onViewPublic, addToast]);

  useEffect(() => {
    if (sessionModal.open) {
      setSessionFormErrors({});
      if (sessionModal.mode === 'edit' && sessionModal.data) {
        setSessionResources(sessionModal.data.resources || []);
        setSessionPracticeLinks(sessionModal.data.practiceLinks || []);
        
        const currentImportance = sessionModal.data.importanceLevel || 'Medium';
        const predefined = ['Core Concept', 'Very Easy', 'Easy', 'Medium', 'High', 'Hard', 'Very Hard', 'Interview', 'Must Practice', 'Revision', 'Optional'];
        const matchingPredefined = predefined.find(p => p.toLowerCase() === currentImportance.toLowerCase());
        if (matchingPredefined) {
          setImportanceType(matchingPredefined);
          setCustomImportanceVal('');
        } else {
          setImportanceType('Custom');
          setCustomImportanceVal(currentImportance);
        }
      } else {
        setSessionResources([]);
        setSessionPracticeLinks([]);
        setImportanceType('Medium');
        setCustomImportanceVal('');
      }
    }
  }, [sessionModal]);

  const handleAddResourceField = () => {
    setSessionResources(prev => [...prev, { name: 'Recording', url: '' }]);
  };

  const handleResourceFieldChange = (index, field, value) => {
    setSessionResources(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveResourceField = (index) => {
    setSessionResources(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPracticeLinkField = () => {
    setSessionPracticeLinks(prev => [...prev, { name: 'LeetCode', url: '' }]);
  };

  const handlePracticeLinkFieldChange = (index, field, value) => {
    setSessionPracticeLinks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemovePracticeLinkField = (index) => {
    setSessionPracticeLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Custom Colors States inside Modals
  const [primaryColorHex, setPrimaryColorHex] = useState('#8b5cf6');
  const [secondaryColorHex, setSecondaryColorHex] = useState('#d946ef');

  // Question Type Selector
  const [selectedQType, setSelectedQType] = useState('MCQ');

  // Dynamically loaded site settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('site_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      companyName: 'PavanxDCL',
      shortName: 'PavanxDCL',
      tagline: 'Empowering Learners with Premium Tech Education',
      description: 'DSA Forge • LeetCode Arena • Aptitude Lab — everything you need to crack placements and dominate FAANG interviews with PavanxDCL mentorship.',
      contact: {
        email: 'pavan@dheecodinglab.com',
        whatsapp: '+917760876386',
        address: 'BTM Layout, India'
      },
      socials: {
        whatsapp: 'https://whatsapp.com/channel/0029VbBqF0Q5a23umr9kfA3k',
        discord: 'https://discord.gg/example-invite',
        telegram: 'https://t.me/example-telegram',
        instagram: 'https://www.instagram.com/codewithpavanprakash/',
        linkedin: 'https://linkedin.com/company/pavanxdcl'
      },
      seo: {
        defaultTitle: 'PavanxDCL',
        defaultDescription: 'DSA Forge • LeetCode Arena • Aptitude Lab — everything you need to crack placements and dominate FAANG interviews with PavanxDCL mentorship.'
      }
    };
  });

  // Centralized Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger',
    confirmText: 'Yes, Delete'
  });

  // Errors & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save Permanently Deleted IDs
  useEffect(() => {
    localStorage.setItem('perm_deleted_ids', JSON.stringify(permanentlyDeletedIds));
  }, [permanentlyDeletedIds]);

  // Load Data
  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
      fetchDeletedCourses();
    }
  }, [isAuthenticated, permanentlyDeletedIds]);

  // Load Profile from backend on authentication
  useEffect(() => {
    if (isAuthenticated) {
      authService.getProfile()
        .then(profile => setAdminEmail(profile.email))
        .catch(err => console.error("Failed to load admin profile:", err));
    }
  }, [isAuthenticated]);

  // Handle Selected Course Change
  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    } else {
      setActiveCourse(null);
      setModules([]);
      setDeletedModules([]);
    }
  }, [selectedCourseId, permanentlyDeletedIds]);

  // Load deleted sessions and questions for all modules in selected course to display in Trash Bin
  useEffect(() => {
    const fetchTrashItems = async () => {
      if (!activeCourse || modules.length === 0) {
        setDeletedSessions({});
        setDeletedQuestions({});
        return;
      }
      const sessTrash = {};
      const questTrash = {};
      await Promise.all(modules.map(async (m) => {
        try {
          if (activeCourse.courseType === 'LEARNING') {
            const delSess = await sessionService.getDeletedSessions(m.id);
            sessTrash[m.id] = (delSess || []).filter(s => !permanentlyDeletedIds.sessions.includes(s.id));
          } else {
            const delQuest = await questionService.getDeletedQuestions(m.id);
            questTrash[m.id] = (delQuest || []).filter(q => !permanentlyDeletedIds.questions.includes(q.id));
          }
        } catch (err) {
          console.error(`Error loading trash for module ${m.id}:`, err);
        }
      }));
      setDeletedSessions(sessTrash);
      setDeletedQuestions(questTrash);
    };
    fetchTrashItems();
  }, [activeCourse, modules, permanentlyDeletedIds]);

  // Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(loginUsername, loginPassword);
      setIsAuthenticated(true);
      setAdminEmail(response.email);
      localStorage.setItem('admin_authenticated', 'true');
      if (response.token) {
        localStorage.setItem('admin_session_token', response.token);
      }
      addToast('Welcome back, Admin!', 'success');
      setLoginPassword('');
    } catch (err) {
      addToast(err.message || 'Invalid username or password!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Logout Submit
  const handleLogout = async () => {
    try {
      await authService.logout().catch(() => {});
    } catch (err) {
      console.error('Backend logout call failed', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_token');
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    addToast('Logged out successfully.', 'info');
  };

  // Fetch Stats dynamically
  const loadDashboardStats = async (activeCoursesList) => {
    try {
      let moduleCount = 0;
      let sessionCount = 0;
      let questionCount = 0;
      let resourceCount = 0;
      let allSessions = [];

      const filteredCourses = activeCoursesList.filter(c => !permanentlyDeletedIds.courses.includes(c.id));

      await Promise.all(filteredCourses.map(async (c) => {
        const mods = await moduleService.getModules(c.id).catch(() => []);
        const filteredMods = mods.filter(m => !permanentlyDeletedIds.modules.includes(m.id));
        moduleCount += filteredMods.length;

        await Promise.all(filteredMods.map(async (m) => {
          if (c.courseType === 'LEARNING') {
            const sess = await sessionService.getSessions(m.id).catch(() => []);
            const filteredSess = sess.filter(s => !permanentlyDeletedIds.sessions.includes(s.id));
            sessionCount += filteredSess.length;
            
            filteredSess.forEach(s => {
              resourceCount += (s.resources ? s.resources.length : 0);
              allSessions.push({
                ...s,
                moduleName: m.name,
                courseName: c.name,
                updatedAt: s.updatedAt || ''
              });
            });
          } else {
            const quests = await questionService.getQuestions(m.id).catch(() => []);
            const filteredQuests = quests.filter(q => !permanentlyDeletedIds.questions.includes(q.id));
            questionCount += filteredQuests.length;
          }
        }));
      }));

      // Sort allSessions by updatedAt descending
      allSessions.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return dateB - dateA;
      });

      setStats({
        courses: activeCoursesList.filter(c => !permanentlyDeletedIds.courses.includes(c.id)).length,
        modules: moduleCount,
        sessions: sessionCount,
        questions: questionCount,
        resources: resourceCount
      });
      setRecentSessions(allSessions.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses();
      const active = (data || []).filter(c => !permanentlyDeletedIds.courses.includes(c.id));
      setCourses(active);
      loadDashboardStats(active);
    } catch (err) {
      setError('Failed to fetch courses: ' + err.message);
    }
  };

  const fetchDeletedCourses = async () => {
    try {
      const data = await courseService.getDeletedCourses();
      const deleted = (data || []).filter(c => !permanentlyDeletedIds.courses.includes(c.id));
      setDeletedCourses(deleted);
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
      setModules((activeMods || []).filter(m => !permanentlyDeletedIds.modules.includes(m.id)));
      
      const delMods = await moduleService.getDeletedModules(courseId);
      setDeletedModules((delMods || []).filter(m => !permanentlyDeletedIds.modules.includes(m.id)));
      
      setSelectedModuleId(null);
      setExpandedModuleId(null);
    } catch (err) {
      setError('Failed to load course details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleContent = async (moduleId) => {
    if (!activeCourse) return;
    try {
      if (activeCourse.courseType === 'LEARNING') {
        const activeSess = await sessionService.getSessions(moduleId);
        setSessions(prev => ({ 
          ...prev, 
          [moduleId]: (activeSess || []).filter(s => !permanentlyDeletedIds.sessions.includes(s.id)) 
        }));
        
        const delSess = await sessionService.getDeletedSessions(moduleId);
        setDeletedSessions(prev => ({ 
          ...prev, 
          [moduleId]: (delSess || []).filter(s => !permanentlyDeletedIds.sessions.includes(s.id)) 
        }));
      } else {
        const activeQuest = await questionService.getQuestions(moduleId);
        setQuestions(prev => ({ 
          ...prev, 
          [moduleId]: (activeQuest || []).filter(q => !permanentlyDeletedIds.questions.includes(q.id)) 
        }));
        
        const delQuest = await questionService.getDeletedQuestions(moduleId);
        setDeletedQuestions(prev => ({ 
          ...prev, 
          [moduleId]: (delQuest || []).filter(q => !permanentlyDeletedIds.questions.includes(q.id)) 
        }));
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

  const triggerConfirm = (title, message, onConfirm, variant = 'danger', confirmText = null) => {
    const defaultText = variant === 'info' ? 'Yes, Restore' : 'Yes, Delete';
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      variant,
      confirmText: confirmText || defaultText
    });
  };

  // Course Add/Edit Modal
  const openCourseModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setPrimaryColorHex(data.primaryColor || '#8b5cf6');
      setSecondaryColorHex(data.secondaryColor || '#d946ef');
    } else {
      setPrimaryColorHex('#8b5cf6');
      setSecondaryColorHex('#d946ef');
    }
    setCourseModal({ open: true, mode, data });
  };

  // Course CRUD
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      courseType: courseModal.mode === 'edit' ? courseModal.data.courseType : formData.get('courseType'),
      primaryColor: primaryColorHex,
      secondaryColor: secondaryColorHex
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
    triggerConfirm(
      'Restore Course?',
      'Are you sure you want to restore this course back to active directory?',
      async () => {
        try {
          await courseService.restoreCourse(id);
          addToast('Course restored successfully!', 'success');
          fetchCourses();
          fetchDeletedCourses();
        } catch (err) {
          setError('Failed to restore course: ' + err.message);
          addToast(err.message, 'error');
        }
      },
      'info'
    );
  };

  const handlePermanentDeleteCourse = (id) => {
    triggerConfirm(
      'Permanently Delete Course?',
      'WARNING: This will permanently delete this course from the dashboard UI. This action cannot be undone.',
      () => {
        setPermanentlyDeletedIds(prev => ({
          ...prev,
          courses: [...prev.courses, id]
        }));
        addToast('Course permanently deleted!', 'success');
      }
    );
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
      'Are you sure you want to soft delete this module/topic? All sessions will be archived.',
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
    triggerConfirm(
      'Restore Module?',
      'Are you sure you want to restore this module?',
      async () => {
        try {
          await moduleService.restoreModule(id);
          addToast('Module restored successfully!', 'success');
          loadCourseDetails(activeCourse.id);
        } catch (err) {
          setError('Failed to restore module: ' + err.message);
          addToast(err.message, 'error');
        }
      },
      'info'
    );
  };

  const handlePermanentDeleteModule = (id) => {
    triggerConfirm(
      'Permanently Delete Module?',
      'WARNING: This will permanently delete this module from the dashboard UI. This action cannot be undone.',
      () => {
        setPermanentlyDeletedIds(prev => ({
          ...prev,
          modules: [...prev.modules, id]
        }));
        addToast('Module permanently deleted!', 'success');
      }
    );
  };

  // Session CRUD
  const handleSaveSession = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const code = formData.get('sessionCode') || '';
    const title = formData.get('contentTitle') || '';
    
    // Frontend Validations
    const errors = {};
    if (!code.trim()) {
      errors.sessionCode = 'Session Code is required';
    }
    if (!title.trim()) {
      errors.contentTitle = 'Session Title is required';
    }
    
    // Standard URL format validation
    const isValidUrl = (string) => {
      if (!string || !string.trim()) return false;
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    // Validate Resources
    sessionResources.forEach((res, index) => {
      if (!res.url || !isValidUrl(res.url)) {
        errors[`resource_${index}`] = `Resource ${index + 1} has an invalid URL (e.g., must be https://...)`;
      }
    });

    // Validate Practice Links
    sessionPracticeLinks.forEach((link, index) => {
      if (!link.url || !isValidUrl(link.url)) {
        errors[`practice_${index}`] = `Practice Link ${index + 1} has an invalid URL (e.g., must be https://...)`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setSessionFormErrors(errors);
      return;
    }

    const level = importanceType === 'Custom' ? customImportanceVal : importanceType;

    const payload = {
      sessionCode: code,
      contentTitle: title,
      importanceLevel: level || 'Medium',
      status: 'Published',
      resources: sessionResources.map(r => ({ name: r.name, url: r.url })),
      practiceLinks: sessionPracticeLinks.map(p => ({ name: p.name, url: p.url }))
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
    triggerConfirm(
      'Restore Session?',
      'Are you sure you want to restore this session?',
      async () => {
        try {
          await sessionService.restoreSession(id);
          addToast('Session restored successfully!', 'success');
          loadModuleContent(moduleId);
        } catch (err) {
          setError('Failed to restore session: ' + err.message);
          addToast(err.message, 'error');
        }
      },
      'info'
    );
  };

  const handlePermanentDeleteSession = (id) => {
    triggerConfirm(
      'Permanently Delete Session?',
      'WARNING: This will permanently delete this session from the dashboard UI.',
      () => {
        setPermanentlyDeletedIds(prev => ({
          ...prev,
          sessions: [...prev.sessions, id]
        }));
        addToast('Session permanently deleted!', 'success');
      }
    );
  };

  // Open Question Modal
  const openQuestionModal = (mode, moduleId, data = null) => {
    setQuestionModal({ open: true, mode, moduleId, data });
  };

  // Question CRUD
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      questionText: formData.get('questionText')
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
    triggerConfirm(
      'Restore Question?',
      'Are you sure you want to restore this question?',
      async () => {
        try {
          await questionService.restoreQuestion(id);
          addToast('Question restored successfully!', 'success');
          loadModuleContent(moduleId);
        } catch (err) {
          setError('Failed to restore question: ' + err.message);
          addToast(err.message, 'error');
        }
      },
      'info'
    );
  };

  const handlePermanentDeleteQuestion = (id) => {
    triggerConfirm(
      'Permanently Delete Question?',
      'WARNING: This will permanently delete this question.',
      () => {
        setPermanentlyDeletedIds(prev => ({
          ...prev,
          questions: [...prev.questions, id]
        }));
        addToast('Question permanently deleted!', 'success');
      }
    );
  };

  // HTML5 Drag and Drop Reordering
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = async (e, targetIndex, listType, listData, parentId = null) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

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
      if (listType === 'courses') fetchCourses();
      else if (listType === 'modules') loadCourseDetails(activeCourse.id);
      else loadModuleContent(parentId);
    } finally {
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save Account Security (requires current password for auth API call)
  const handleSaveAccountSecurity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.target);
      const newUsername = formData.get('username');
      const newPassword = formData.get('password');
      if (!newPassword) {
        addToast('Please enter a new password to update credentials.', 'warning');
        setLoading(false);
        return;
      }
      await authService.update(adminEmail, newUsername, newPassword);
      setAdminEmail(newUsername);
      e.target.password.value = '';
      addToast('Account credentials updated successfully!', 'success');
    } catch (err) {
      setError('Failed to update credentials: ' + err.message);
      addToast(err.message || 'Failed to update credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generic helper: save a partial settings update to localStorage
  const saveSettingsSection = (partial) => {
    const current = { ...settings };
    const updated = { ...current, ...partial };
    // Deep-merge nested objects
    if (partial.contact) updated.contact = { ...(current.contact || {}), ...partial.contact };
    if (partial.socials) updated.socials = { ...(current.socials || {}), ...partial.socials };
    if (partial.seo) updated.seo = { ...(current.seo || {}), ...partial.seo };
    localStorage.setItem('site_settings', JSON.stringify(updated));
    setSettings(updated);
  };

  // Save Platform Branding
  const handleSaveBranding = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveSettingsSection({
      companyName: formData.get('companyName'),
      shortName: formData.get('shortName'),
      tagline: formData.get('tagline'),
      description: formData.get('description')
    });
    addToast('Platform branding saved!', 'success');
  };

  // Save SEO Information
  const handleSaveSEO = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveSettingsSection({
      seo: {
        defaultTitle: formData.get('defaultTitle'),
        defaultDescription: formData.get('defaultDescription')
      }
    });
    addToast('SEO settings saved!', 'success');
  };

  // Save Contact Information
  const handleSaveContact = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveSettingsSection({
      contact: {
        email: formData.get('email'),
        whatsapp: formData.get('contactWhatsapp'),
        address: formData.get('address')
      }
    });
    addToast('Contact information saved!', 'success');
  };



  // Render Login Panel
  if (!isAuthenticated) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0908',
          background: 'radial-gradient(circle at 50% 50%, #150c08 0%, #070605 85%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <div 
          className="glass-container"
          style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: '#121111',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Logo */}
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.05em' }}>
            <span style={{ color: '#fff' }}>PAVAN</span>
            <span style={{ color: 'var(--accent-orange)' }}>XDCL</span>
          </h2>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
            Admin Portal
          </h3>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', marginBottom: '32px' }}>
            Sign in to manage courses, modules, and sessions.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="login-user" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>👤</span>
                <input 
                  type="text" 
                  id="login-user"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Enter administrator username" 
                  required 
                  style={{
                    paddingLeft: '45px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: '#fff',
                    width: '100%',
                    height: '46px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="login-pass" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔒</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="login-pass"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password" 
                  required 
                  style={{
                    paddingLeft: '45px',
                    paddingRight: '45px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: '#fff',
                    width: '100%',
                    height: '46px',
                    outline: 'none'
                  }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                background: 'var(--accent-orange)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.25)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={e => e.currentTarget.style.filter = 'none'}
            >
              Sign In
            </button>
          </form>

          <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '32px' }}>
            Authorized personnel only. Sessions are monitored.
          </p>
        </div>
      </div>
    );
  }

  // Sidebar navigation click
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  // Render Admin Dashboard
  return (
    <div style={{ position: 'relative', display: 'flex', minHeight: '100vh', backgroundColor: '#0d0a08', color: '#fff', overflowX: 'hidden' }}>
      
      {/* Background Glow Blobs (Fixed in screen viewport, matching Landing Page) */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '70%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0) 80%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '20%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 80%)',
        filter: 'blur(110px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Left Sidebar */}
      <div 
        style={{
          zIndex: 10,
          width: '260px',
          backgroundColor: '#121111',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 100
        }}
      >
        {/* Branding header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', padding: '0 8px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em', margin: 0 }}>
            <span style={{ color: '#fff' }}>PAVAN</span>
            <span style={{ color: 'var(--accent-orange)' }}>XDCL</span>
          </h2>
          <span 
            style={{
              marginLeft: '10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--accent-orange)',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.15)',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
          >
            Admin
          </span>
        </div>

        {/* Navigation list */}
        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { 
              id: 'dashboard', 
              label: 'Dashboard', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            },
            { 
              id: 'courses', 
              label: 'Courses', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            },
            { 
              id: 'modules', 
              label: 'Modules', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            },
            { 
              id: 'sessions', 
              label: 'Sessions', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            },
            { 
              id: 'trash', 
              label: 'Trash Bin', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            },
            { 
              id: 'settings', 
              label: 'Settings', 
              icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            }
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isActive ? 'var(--accent-orange)' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              color: '#f87171',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            Logout
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingLeft: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>Console v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Main Panel Content Container */}
      <main 
        style={{
          position: 'relative',
          zIndex: 1,
          marginLeft: '260px',
          flexGrow: 1,
          padding: '40px 50px',
          minHeight: '100vh',
          backgroundColor: 'transparent'
        }}
      >
        {error && (
          <div style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
          </div>
        )}

        {/* ==================== 1. DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>Analytics Dashboard</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '40px' }}>
              Overview of your Course Management Platform metrics. Welcome back, <strong style={{ color: '#fff' }}>{adminEmail}</strong>.
            </p>

            {/* Statistics Cards Row */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
              }}
            >
              {[
                { 
                  title: 'Total Courses', value: stats.courses, sub: 'Active in platform',
                  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                },
                { 
                  title: 'Total Modules', value: stats.modules, sub: 'Active in platform',
                  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                },
                { 
                  title: 'Total Sessions', value: stats.sessions, sub: 'Active in platform',
                  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                },
                { 
                  title: 'Total Resources', value: stats.resources, sub: 'Active in platform',
                  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                }
              ].map((card, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#121111',
                    borderRadius: '10px',
                    padding: '22px 24px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{card.title}</span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--accent-orange)' }}>{card.icon}</span>
                  </div>
                  <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
                    {card.value}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.sub}</span>
                </div>
              ))}
            </div>

            {/* Recently Updated and Quick Guides Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Recently Updated Sessions */}
              <div 
                style={{
                  backgroundColor: '#121111',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" fill="none" stroke="var(--accent-orange)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Recently Updated Sessions
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Last 5 modifications</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentSessions.map((session, sidx) => (
                    <div 
                      key={sidx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: sidx < recentSessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(249,115,22,0.1)',
                          color: 'var(--accent-orange)',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          minWidth: '32px',
                          textAlign: 'center'
                        }}>
                          {session.sessionCode}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{session.contentTitle}</div>
                          <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px' }}>
                            {session.courseName} · {session.moduleName}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.73rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatRelativeTime(session.updatedAt)}
                      </span>
                    </div>
                  ))}
                  {recentSessions.length === 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0', fontSize: '0.88rem' }}>No active sessions recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Quick Guides */}
              <div 
                style={{
                  backgroundColor: '#121111',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '18px' }}>Quick Guides</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { prefix: 'Use the ', bold: 'Courses', text: ' tab to create learning paths and assign theme colors.' },
                    { prefix: 'Create ', bold: 'Modules', text: ' to partition courses into structural units (e.g. Week-01, DSA basics).' },
                    { prefix: 'Add ', bold: 'Sessions', text: ', resource URLs (YouTube, PDFs, Drive), practice sheets, and set importance levels.' },
                    { prefix: 'Accidentally deleted items go to the ', bold: 'Trash Bin', text: ' and can be restored or permanently cleared.' }
                  ].map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.55' }}>
                      <span style={{ color: 'var(--accent-orange)', marginTop: '4px', flexShrink: 0, fontSize: '0.5rem' }}>●</span>
                      <span>
                        {item.prefix}<strong style={{ color: '#fff' }}>{item.bold}</strong>{item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 2. COURSES TAB ==================== */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Courses</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>Create, edit, delete, and reorder courses using drag-and-drop.</p>
              </div>
              <button
                onClick={() => openCourseModal('create')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--accent-orange)', color: '#fff',
                  border: 'none', borderRadius: '8px', padding: '10px 18px',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                + Add Course
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {courses.map((course, idx) => {
                const dot = course.primaryColor || '#6366f1';
                return (
                  <div 
                    key={course.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx, 'courses', courses)}
                    onDragEnd={handleDragEnd}
                    style={{ 
                      display: 'flex', alignItems: 'center',
                      padding: '14px 16px',
                      backgroundColor: dragOverIndex === idx && draggedIndex !== idx
                        ? 'rgba(249,115,22,0.08)'
                        : draggedIndex === idx ? 'rgba(249,115,22,0.03)' : 'transparent',
                      borderRadius: '8px',
                      transition: 'background 0.1s',
                      gap: '0',
                      opacity: draggedIndex === idx ? 0.5 : 1,
                      borderTop: dragOverIndex === idx && draggedIndex !== null && draggedIndex > idx
                        ? '2px solid var(--accent-orange)' : '2px solid transparent'
                    }}
                  >
                    {/* Drag grip */}
                    <div style={{ color: '#374151', cursor: 'grab', marginRight: '12px', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                      </svg>
                    </div>
                    {/* Color dot */}
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dot, flexShrink: 0, marginRight: '14px' }} />
                    {/* Course info */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>{course.name}</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
                          borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.12)',
                          color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
                        }}>
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          Published
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', fontFamily: 'monospace' }}>
                        /{course.name?.toLowerCase().replace(/\s+/g, '-')}
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => openCourseModal('edit', course)}
                        title="Edit course"
                        style={{
                          background: 'none', border: 'none', color: '#6b7280',
                          cursor: 'pointer', padding: '6px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center'
                        }}
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Soft delete course"
                        style={{
                          background: 'none', border: 'none', color: '#6b7280',
                          cursor: 'pointer', padding: '6px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center'
                        }}
                        onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                        onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No active courses. Click "+ Add Course" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 3. MODULES TAB ==================== */}
        {activeTab === 'modules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Modules</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>Organize courses into modular segments and reorder them.</p>
              </div>
              {activeCourse && (
                <button
                  onClick={() => setModuleModal({ open: true, mode: 'create', data: null })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--accent-orange)', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '10px 18px',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + Add Module
                </button>
              )}
            </div>

            {/* Course Selector Panel */}
            <div style={{ backgroundColor: '#121111', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>CURRENT COURSE SELECTION</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Select a course to load and organize its respective modules.</p>
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <select 
                    id="course-select-dropdown"
                    value={activeCourse ? activeCourse.id : ''} 
                    onChange={e => {
                      if (e.target.value) onSelectCourse(Number(e.target.value));
                      else onClearCourse();
                    }}
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: '#0d0a08',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      appearance: 'none',
                      paddingRight: '32px'
                    }}
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
                </div>
              </div>
            </div>

            {activeCourse ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {modules.map((mod, idx) => (
                  <div 
                    key={mod.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx, 'modules', modules)}
                    onDragEnd={handleDragEnd}
                    style={{ 
                      display: 'flex', alignItems: 'center',
                      padding: '14px 16px',
                      backgroundColor: dragOverIndex === idx && draggedIndex !== idx
                        ? 'rgba(249,115,22,0.08)'
                        : draggedIndex === idx ? 'rgba(249,115,22,0.03)' : 'transparent',
                      borderRadius: '8px',
                      transition: 'background 0.1s',
                      opacity: draggedIndex === idx ? 0.5 : 1,
                      borderTop: dragOverIndex === idx && draggedIndex !== null && draggedIndex > idx
                        ? '2px solid var(--accent-orange)' : '2px solid transparent'
                    }}
                  >
                    {/* Drag grip */}
                    <div style={{ color: '#374151', cursor: 'grab', marginRight: '12px', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                      </svg>
                    </div>
                    {/* Left color border accent */}
                    <div style={{
                      width: '3px', height: '36px', borderRadius: '2px',
                      backgroundColor: activeCourse.primaryColor || '#6366f1',
                      marginRight: '16px', flexShrink: 0
                    }} />
                    {/* Module info */}
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>{mod.name}</span>
                      {mod.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{mod.description}</div>}
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => setModuleModal({ open: true, mode: 'edit', data: mod })}
                        title="Edit module"
                        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        title="Soft delete module"
                        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                        onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {modules.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>
                    No modules yet. Click "+ Add Module" to get started.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>
                Select a course above to manage its modules.
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. SESSIONS TAB ==================== */}
        {activeTab === 'sessions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Sessions</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>Build sessions, add YouTube recordings, Google Drive notes, and solve LeetCode sheets.</p>
              </div>
              {activeCourse && selectedModuleId && activeCourse.courseType === 'LEARNING' && (
                <button
                  onClick={() => setSessionModal({ open: true, mode: 'create', moduleId: selectedModuleId, data: null })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--accent-orange)', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '10px 18px',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + Add Session
                </button>
              )}
            </div>

            {/* Selectors Panel */}
            <div style={{ backgroundColor: '#121111', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>COURSE SELECTION</div>
                  <div style={{ position: 'relative' }}>
                    <select 
                      id="syllabus-course-select"
                      value={activeCourse ? activeCourse.id : ''} 
                      onChange={e => {
                        if (e.target.value) { onSelectCourse(Number(e.target.value)); setSelectedModuleId(null); }
                        else { onClearCourse(); setSelectedModuleId(null); }
                      }}
                      style={{
                        width: '100%', height: '42px',
                        backgroundColor: '#0d0a08', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', borderRadius: '8px', padding: '0 12px',
                        fontSize: '0.9rem', cursor: 'pointer', appearance: 'none', paddingRight: '32px'
                      }}
                    >
                      <option value="">Select a course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>MODULE SELECTION</div>
                  <div style={{ position: 'relative' }}>
                    <select 
                      id="syllabus-module-select"
                      value={selectedModuleId || ''} 
                      onChange={e => { setSelectedModuleId(Number(e.target.value)); handleToggleModule(Number(e.target.value)); }}
                      disabled={!activeCourse}
                      style={{
                        width: '100%', height: '42px',
                        backgroundColor: '#0d0a08', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', borderRadius: '8px', padding: '0 12px',
                        fontSize: '0.9rem', cursor: 'pointer', appearance: 'none', paddingRight: '32px',
                        opacity: !activeCourse ? 0.5 : 1
                      }}
                    >
                      <option value="">Select a module...</option>
                      {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
                  </div>
                </div>
              </div>
            </div>

            {activeCourse && selectedModuleId ? (
              <div>
                {/* 4A. LEARNING COURSE VIEW: SESSIONS LIST */}
                {activeCourse.courseType === 'LEARNING' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(sessions[selectedModuleId] || []).map((session, sIdx) => {
                      const isSessOpen = expandedSessionId === session.id;
                      const importanceBadgeStyle = (() => {
                        const lvl = session.importanceLevel || 'Medium';
                        const lvlLower = lvl.toLowerCase();
                        
                        let color = '#3b82f6'; // Blue
                        let bg = 'rgba(59, 130, 246, 0.12)';
                        
                        if (lvlLower.includes('core') || lvlLower.includes('interview') || lvlLower.includes('must') || lvlLower.includes('hard') || lvlLower.includes('high')) {
                          color = '#ef4444'; // Red-ish
                          bg = 'rgba(239, 68, 68, 0.12)';
                          if (lvlLower.includes('interview')) {
                            color = '#f97316'; // Orange
                            bg = 'rgba(249, 115, 22, 0.12)';
                          }
                          if (lvlLower.includes('must')) {
                            color = '#ec4899'; // Pink
                            bg = 'rgba(236, 72, 153, 0.12)';
                          }
                          if (lvlLower.includes('core')) {
                            color = '#a855f7'; // Purple
                            bg = 'rgba(168, 85, 247, 0.15)';
                          }
                        } else if (lvlLower.includes('easy') || lvlLower.includes('low') || lvlLower.includes('optional') || lvlLower.includes('revision') || lvlLower.includes('very easy')) {
                          color = '#10b981'; // Green-ish
                          bg = 'rgba(16, 185, 129, 0.12)';
                          if (lvlLower.includes('optional')) {
                            color = '#94a3b8'; // Slate/Grey
                            bg = 'rgba(148, 163, 184, 0.12)';
                          }
                          if (lvlLower.includes('revision')) {
                            color = '#06b6d4'; // Cyan
                            bg = 'rgba(6, 182, 212, 0.12)';
                          }
                        } else {
                          color = '#eab308'; // Yellow/Gold for Medium/Basics/etc
                          bg = 'rgba(234, 179, 8, 0.12)';
                        }
                        
                        return { bg, color, text: lvl };
                      })();

                      return (
                        <div key={session.id}>
                          <div 
                            draggable
                            onDragStart={(e) => handleDragStart(e, sIdx)}
                            onDragOver={(e) => handleDragOver(e, sIdx)}
                            onDrop={(e) => handleDrop(e, sIdx, 'sessions', sessions[selectedModuleId] || [], selectedModuleId)}
                            onDragEnd={handleDragEnd}
                            style={{
                              display: 'flex', alignItems: 'center',
                              padding: '14px 16px',
                              backgroundColor: dragOverIndex === sIdx && draggedIndex !== sIdx
                                ? 'rgba(249,115,22,0.08)'
                                : draggedIndex === sIdx ? 'rgba(249,115,22,0.03)' : 'transparent',
                              borderRadius: '8px',
                              transition: 'background 0.1s',
                              opacity: draggedIndex === sIdx ? 0.5 : 1,
                              borderTop: dragOverIndex === sIdx && draggedIndex !== null && draggedIndex > sIdx
                                ? '2px solid var(--accent-orange)' : '2px solid transparent'
                            }}
                          >
                            {/* Drag grip */}
                            <div style={{ color: '#374151', cursor: 'grab', marginRight: '12px', flexShrink: 0 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                                <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                                <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                              </svg>
                            </div>
                            {/* Session code */}
                            <span style={{
                              fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700,
                              backgroundColor: 'rgba(249,115,22,0.1)', color: 'var(--accent-orange)',
                              padding: '3px 7px', borderRadius: '4px', marginRight: '14px', flexShrink: 0
                            }}>{session.sessionCode}</span>
                            {/* Title + meta */}
                            <div style={{ flexGrow: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>{session.contentTitle}</span>
                                <span style={{
                                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                  backgroundColor: importanceBadgeStyle.bg, color: importanceBadgeStyle.color
                                }}>{importanceBadgeStyle.text}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                {session.resources && session.resources.length > 0 && (
                                  <span style={{ fontSize: '0.73rem', color: '#64748b' }}>{session.resources.length} Resource{session.resources.length !== 1 ? 's' : ''}</span>
                                )}
                                {session.practiceLinks && session.practiceLinks.length > 0 && (
                                  <span style={{ fontSize: '0.73rem', color: '#64748b' }}>● {session.practiceLinks.length} Practice link{session.practiceLinks.length !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              <button
                                onClick={() => setExpandedSessionId(isSessOpen ? null : session.id)}
                                title="Expand resources"
                                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', borderRadius: '6px', fontSize: '0.8rem' }}
                              >
                                {isSessOpen ? '▲' : '▼'}
                              </button>
                              <button
                                onClick={() => setSessionModal({ open: true, mode: 'edit', moduleId: selectedModuleId, data: session })}
                                title="Edit session"
                                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                                onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSession(session.id, selectedModuleId)}
                                title="Delete session"
                                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                                onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                                onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </div>

                            {/* Resource and Practice Links list */}
                            {isSessOpen && (
                              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Left Side: Study Materials */}
                                <div>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                     <h5 style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>📄 Study Files</h5>
                                   </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {session.resources && session.resources.map(res => (
                                      <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0908', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.88rem' }}>🔗 {res.name}</a>
                                      </div>
                                    ))}
                                    {(!session.resources || session.resources.length === 0) && (
                                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No reference files uploaded.</span>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Practice Tasks */}
                                <div>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                     <h5 style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>🎮 Practice Tasks</h5>
                                   </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {session.practiceLinks && session.practiceLinks.map(prac => (
                                      <div key={prac.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0908', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                        <a href={prac.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.88rem' }}>🚀 {prac.name}</a>
                                      </div>
                                    ))}
                                    {(!session.practiceLinks || session.practiceLinks.length === 0) && (
                                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No platform tasks linked.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(sessions[selectedModuleId] || []).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>
                          No sessions yet. Click "+ Add Session" to create content.
                        </div>
                      )}
                    </div>
                  )}

                {/* 4B. QUESTION BANK COURSE VIEW: QUESTIONS LIST */}
                {activeCourse.courseType === 'QUESTION_BANK' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Questions ({(questions[selectedModuleId] || []).length})</h3>
                      <button onClick={() => openQuestionModal('create', selectedModuleId)} style={{ background: 'var(--accent-orange)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Question</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(questions[selectedModuleId] || []).map((q, qIdx) => (
                        <div 
                          key={q.id}
                          className="glass-container"
                          style={{ backgroundColor: '#121111', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ flexGrow: 1, marginRight: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-orange)', fontWeight: 600 }}>Q{qIdx + 1}</span>
                                {activeCourse?.courseType !== 'QUESTION_BANK' && (
                                  <>
                                    <Badge type={q.difficultyLevel || 'MEDIUM'}>{q.difficultyLevel}</Badge>
                                    {q.tags && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tags: {q.tags}</span>}
                                  </>
                                )}
                              </div>
                              <p style={{ fontWeight: 600, color: '#fff', fontSize: '1.02rem', lineHeight: '1.4' }}>{q.questionText}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => openQuestionModal('edit', selectedModuleId, q)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDeleteQuestion(q.id, selectedModuleId)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </div>

                          {/* Options list */}
                          {q.options && q.options.length > 0 && !q.tags?.includes('type_descriptive') && !q.tags?.includes('type_fill_blank') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', paddingLeft: '20px' }}>
                              {q.options.map((opt, oidx) => {
                                const isCorrect = opt === q.correctAnswer;
                                return (
                                  <div 
                                    key={oidx} 
                                    style={{ 
                                      padding: '8px 12px', 
                                      borderRadius: '6px', 
                                      border: isCorrect ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.03)',
                                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(0,0,0,0.1)',
                                      color: isCorrect ? '#34d399' : '#94a3b8',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    {opt} {isCorrect && '✓'}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {q.explanation && (
                            <div className="explanation-box" style={{ marginTop: '14px', fontSize: '0.88rem' }}>
                              <strong>Solution Guide:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                      {(questions[selectedModuleId] || []).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>
                          No questions found. Click "+ Add Question" to start the assessment bank.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>
                Select both a course and a module above to display sessions.
              </div>
            )}
          </div>
        )}

        {/* ==================== 5. TRASH BIN TAB ==================== */}
        {activeTab === 'trash' && (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>Centralized Trash Bin</h1>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Review soft-deleted items, restore them to syllabus, or wipe them permanently.</p>

            {/* Type selector toggle buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              {[
                { id: 'courses', label: `Courses (${deletedCourses.length})` },
                { id: 'modules', label: `Modules (${deletedModules.length})` },
                { id: 'sessions', label: `Sessions (${Object.values(deletedSessions).flat().length})` },
                { id: 'questions', label: `Questions (${Object.values(deletedQuestions).flat().length})` }
              ].map(toggle => (
                <button
                  key={toggle.id}
                  onClick={() => setTrashType(toggle.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                    border: trashType === toggle.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: trashType === toggle.id ? 'var(--accent-orange)' : 'transparent',
                    color: trashType === toggle.id ? '#fff' : '#94a3b8'
                  }}
                >
                  {toggle.label}
                </button>
              ))}
            </div>

            {/* Render selected trash type */}
            {trashType === 'courses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {deletedCourses.map(c => (
                  <div 
                    key={c.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f87171', textDecoration: 'line-through' }}>{c.name}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Type: {c.courseType}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRestoreCourse(c.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)', background: 'transparent', color: '#34d399', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Restore</button>
                      <button onClick={() => handlePermanentDeleteCourse(c.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Permanent</button>
                    </div>
                  </div>
                ))}
                {deletedCourses.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>Courses trash bin is empty.</div>
                )}
              </div>
            )}

            {trashType === 'modules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {deletedModules.map(m => (
                  <div 
                    key={m.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}
                  >
                    <div>
                      <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f87171', textDecoration: 'line-through' }}>{m.name}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Course: {activeCourse ? activeCourse.name : 'N/A'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRestoreModule(m.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)', background: 'transparent', color: '#34d399', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Restore</button>
                      <button onClick={() => handlePermanentDeleteModule(m.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Permanent</button>
                    </div>
                  </div>
                ))}
                {deletedModules.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>Modules trash bin is empty.</div>
                )}
              </div>
            )}

            {trashType === 'sessions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(deletedSessions).flatMap(([modId, list]) => 
                  list.map(s => (
                    <div 
                      key={s.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(248,113,113,0.1)', color: '#f87171', fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{s.sessionCode}</span>
                          <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f87171', textDecoration: 'line-through' }}>{s.contentTitle}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Module: {modules.find(m => m.id === Number(modId))?.name || 'Unknown'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreSession(s.id, Number(modId))} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)', background: 'transparent', color: '#34d399', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Restore</button>
                        <button onClick={() => handlePermanentDeleteSession(s.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Permanent</button>
                      </div>
                    </div>
                  ))
                )}
                {Object.values(deletedSessions).flat().length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>Sessions trash bin is empty.</div>
                )}
              </div>
            )}

            {trashType === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(deletedQuestions).flatMap(([modId, list]) => 
                  list.map(q => (
                    <div 
                      key={q.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)' }}
                    >
                      <div style={{ flexGrow: 1, marginRight: '20px' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f87171', textDecoration: 'line-through', lineHeight: '1.4', margin: 0 }}>{q.questionText}</p>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Topic: {modules.find(m => m.id === Number(modId))?.name || 'Unknown'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleRestoreQuestion(q.id, Number(modId))} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)', background: 'transparent', color: '#34d399', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Restore</button>
                        <button onClick={() => handlePermanentDeleteQuestion(q.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)', background: 'transparent', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>Permanent</button>
                      </div>
                    </div>
                  ))
                )}
                {Object.values(deletedQuestions).flat().length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.9rem' }}>Questions trash bin is empty.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== 6. SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>Control Panel Settings</h1>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Configure each section independently. Only credential changes require a password.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '850px' }}>

              {/* ─── 1. Account Security (requires password) ─── */}
              <form onSubmit={handleSaveAccountSecurity}>
                <div className="glass-container" style={{ backgroundColor: '#121111', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)', margin: 0 }}>
                      🔒 Account Security Settings
                    </h3>
                    <Button type="submit" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Update Credentials
                    </Button>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '18px' }}>
                    Changing your admin email or password requires entering a new password.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label htmlFor="settings-username">Admin Username / Email</label>
                      <Input key={adminEmail} id="settings-username" name="username" defaultValue={adminEmail} required placeholder="Email Address" />
                    </div>
                    <div>
                      <label htmlFor="settings-password">New Admin Password</label>
                      <Input id="settings-password" name="password" type="password" placeholder="Enter new secure password" />
                    </div>
                  </div>
                </div>
              </form>

              {/* ─── 3. Platform Branding ─── */}
              <form onSubmit={handleSaveBranding}>
                <div className="glass-container" style={{ backgroundColor: '#121111', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)', margin: 0 }}>
                      🎨 Platform Branding
                    </h3>
                    <Button type="submit" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save Branding
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label htmlFor="settings-companyName">Company Name</label>
                        <Input id="settings-companyName" name="companyName" defaultValue={settings.companyName} required />
                      </div>
                      <div>
                        <label htmlFor="settings-shortName">Brand Short Name / Logo</label>
                        <Input id="settings-shortName" name="shortName" defaultValue={settings.shortName} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="settings-tagline">Brand Tagline</label>
                      <Input id="settings-tagline" name="tagline" defaultValue={settings.tagline} required />
                    </div>
                    <div>
                      <label htmlFor="settings-description">Brand Description</label>
                      <Textarea id="settings-description" name="description" defaultValue={settings.description} rows="3" required />
                    </div>
                  </div>
                </div>
              </form>

              {/* ─── 4. SEO Default Information ─── */}
              <form onSubmit={handleSaveSEO}>
                <div className="glass-container" style={{ backgroundColor: '#121111', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)', margin: 0 }}>
                      🔍 SEO Default Information
                    </h3>
                    <Button type="submit" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save SEO
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label htmlFor="settings-defaultTitle">Default SEO Title</label>
                      <Input id="settings-defaultTitle" name="defaultTitle" defaultValue={settings.seo?.defaultTitle} required />
                    </div>
                    <div>
                      <label htmlFor="settings-defaultDescription">Default SEO Description</label>
                      <Textarea id="settings-defaultDescription" name="defaultDescription" defaultValue={settings.seo?.defaultDescription} rows="3" required />
                    </div>
                  </div>
                </div>
              </form>

              {/* ─── 5. Contact Information ─── */}
              <form onSubmit={handleSaveContact}>
                <div className="glass-container" style={{ backgroundColor: '#121111', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)', margin: 0 }}>
                      📞 Contact Information & Location
                    </h3>
                    <Button type="submit" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save Contact
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label htmlFor="settings-email">Support Email Address</label>
                        <Input id="settings-email" name="email" type="email" defaultValue={settings.contact?.email} required />
                      </div>
                      <div>
                        <label htmlFor="settings-contactWhatsapp">Contact WhatsApp Number</label>
                        <Input id="settings-contactWhatsapp" name="contactWhatsapp" defaultValue={settings.contact?.whatsapp} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="settings-address">Headquarters Address</label>
                      <Input id="settings-address" name="address" defaultValue={settings.contact?.address} required />
                    </div>
                  </div>
                </div>
              </form>

              {/* Bottom spacer */}
              <div style={{ height: '40px' }}></div>

            </div>
          </div>
        )}

      </main>

      {/* -------------------- 1. COURSE FORM MODAL -------------------- */}
      {courseModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#121111', maxWidth: '600px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {courseModal.mode === 'create' ? 'Create New Course' : 'Edit Course Details'}
            </h2>
            
            <form onSubmit={handleSaveCourse}>
              <Input
                label="Course Name"
                id="name"
                name="name"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.name : ''}
                required
                placeholder="e.g. Data Structures, rookie-rise"
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

              {/* Color Theme custom settings with Manual Pickers and Hex Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label>Primary Theme Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={primaryColorHex}
                      onChange={e => setPrimaryColorHex(e.target.value)}
                      style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <input 
                      type="text" 
                      value={primaryColorHex}
                      onChange={e => setPrimaryColorHex(e.target.value)}
                      placeholder="#8b5cf6"
                      required
                      style={{ flexGrow: 1, height: '42px' }}
                    />
                  </div>
                </div>

                <div>
                  <label>Secondary Theme Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={secondaryColorHex}
                      onChange={e => setSecondaryColorHex(e.target.value)}
                      style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <input 
                      type="text" 
                      value={secondaryColorHex}
                      onChange={e => setSecondaryColorHex(e.target.value)}
                      placeholder="#d946ef"
                      required
                      style={{ flexGrow: 1, height: '42px' }}
                    />
                  </div>
                </div>
              </div>

              <Textarea
                label="Description"
                id="description"
                name="description"
                rows="4"
                defaultValue={courseModal.mode === 'edit' ? courseModal.data.description : ''}
                placeholder="Enter a description for this course..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <Button variant="secondary" onClick={() => setCourseModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                <Button type="submit">Save Course</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODULE / TOPIC FORM MODAL */}
      {moduleModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#121111' }}>
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
          <div className="modal-content glass-container" style={{ background: '#121111', maxWidth: '650px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {sessionModal.mode === 'create' ? 'Add Session' : 'Edit Session'}
            </h2>
            
            {/* Validation Errors */}
            {Object.keys(sessionFormErrors).length > 0 && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f87171', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Please correct the following errors:</div>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {Object.values(sessionFormErrors).map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Session Code"
                id="sessionCode"
                name="sessionCode"
                defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.sessionCode : ''}
                required
                placeholder="e.g. ST-01"
              />

              <Input
                label="Session Content / Title"
                id="contentTitle"
                name="contentTitle"
                defaultValue={sessionModal.mode === 'edit' ? sessionModal.data.contentTitle : ''}
                required
                placeholder="e.g. Introduction to Stack"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <Select
                  label="Importance Level"
                  id="importanceLevel"
                  name="importanceLevel"
                  value={importanceType}
                  onChange={(e) => setImportanceType(e.target.value)}
                  options={[
                    { value: 'Core Concept', label: 'Core Concept' },
                    { value: 'Very Easy', label: 'Very Easy' },
                    { value: 'Easy', label: 'Easy' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Hard', label: 'Hard' },
                    { value: 'Very Hard', label: 'Very Hard' },
                    { value: 'Interview', label: 'Interview' },
                    { value: 'Must Practice', label: 'Must Practice' },
                    { value: 'Revision', label: 'Revision' },
                    { value: 'Optional', label: 'Optional' },
                    { value: 'Custom', label: 'Custom Option...' }
                  ]}
                />
                
                {importanceType === 'Custom' ? (
                  <Input
                    label="Custom Importance"
                    id="customImportance"
                    name="customImportance"
                    value={customImportanceVal}
                    onChange={(e) => setCustomImportanceVal(e.target.value)}
                    required
                    placeholder="Enter custom value"
                  />
                ) : <div />}
              </div>

              {/* Resources Sub-form */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Resources</label>
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddResourceField}>+ Add Resource</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {sessionResources.map((res, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={res.name}
                        onChange={(e) => handleResourceFieldChange(index, 'name', e.target.value)}
                        style={{
                          background: '#1c1917',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          width: '140px'
                        }}
                      >
                        {['Recording', 'Notes', 'PDF', 'Slides', 'GitHub', 'Google Drive', 'Website', 'Article', 'Cheat Sheet', 'Custom'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Resource URL (e.g., https://...)"
                        value={res.url}
                        onChange={(e) => handleResourceFieldChange(index, 'url', e.target.value)}
                        style={{
                          background: '#1c1917',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          flexGrow: 1
                        }}
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveResourceField(index)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.25rem', padding: '0 4px' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {sessionResources.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>No resources added yet.</span>
                  )}
                </div>
              </div>

              {/* Practice Links Sub-form */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Practice Links</label>
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddPracticeLinkField}>+ Add Practice Link</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {sessionPracticeLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={link.name}
                        onChange={(e) => handlePracticeLinkFieldChange(index, 'name', e.target.value)}
                        style={{
                          background: '#1c1917',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          width: '140px'
                        }}
                      >
                        {['LeetCode', 'GeeksforGeeks', 'HackerRank', 'CodeChef', 'Codeforces', 'AtCoder', 'Worksheet', 'Homework', 'Custom'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Practice URL (e.g., https://...)"
                        value={link.url}
                        onChange={(e) => handlePracticeLinkFieldChange(index, 'url', e.target.value)}
                        style={{
                          background: '#1c1917',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          flexGrow: 1
                        }}
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleRemovePracticeLinkField(index)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.25rem', padding: '0 4px' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {sessionPracticeLinks.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>No practice links added yet.</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <Button type="button" variant="secondary" onClick={() => setSessionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</Button>
                <Button type="submit">Save Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. QUESTION FORM MODAL */}
      {questionModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-container" style={{ background: '#121111', maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              {questionModal.mode === 'create' ? 'Add New Question' : 'Edit Question Details'}
            </h2>
            
            <form onSubmit={handleSaveQuestion}>
              <Textarea
                label="Question Text"
                id="questionText"
                name="questionText"
                rows="3"
                defaultValue={questionModal.mode === 'edit' ? questionModal.data.questionText : ''}
                required
                placeholder="Write the question prompt here..."
              />

              {activeCourse?.courseType !== 'QUESTION_BANK' && (
                <>
                  {/* Question Type Selector */}
                  <div style={{ marginBottom: '16px' }}>
                    <label>Question Type</label>
                    <select 
                      value={selectedQType}
                      onChange={e => setSelectedQType(e.target.value)}
                      style={{ height: '46px', backgroundColor: '#0a0908', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="MCQ">Multiple Choice Question (MCQ)</option>
                      <option value="TF">True / False</option>
                      <option value="FILL_BLANK">Fill in the Blank</option>
                      <option value="DESCRIPTIVE">Descriptive / Model Answer</option>
                    </select>
                  </div>

                  {selectedQType === 'MCQ' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <Input label="Option A" id="optionA" name="optionA" defaultValue={questionModal.mode === 'edit' && questionModal.data.options ? questionModal.data.options[0] : ''} required />
                        <Input label="Option B" id="optionB" name="optionB" defaultValue={questionModal.mode === 'edit' && questionModal.data.options ? questionModal.data.options[1] : ''} required />
                        <Input label="Option C" id="optionC" name="optionC" defaultValue={questionModal.mode === 'edit' && questionModal.data.options ? questionModal.data.options[2] : ''} required />
                        <Input label="Option D" id="optionD" name="optionD" defaultValue={questionModal.mode === 'edit' && questionModal.data.options ? questionModal.data.options[3] : ''} required />
                      </div>
                      
                      <Input
                        label="Correct Answer Text"
                        id="correctAnswer"
                        name="correctAnswer"
                        defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : ''}
                        required
                        placeholder="Must match Option A, B, C, or D exactly"
                      />
                    </>
                  )}

                  {selectedQType === 'TF' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label htmlFor="correctAnswerTF">Correct Answer</label>
                      <select 
                        id="correctAnswerTF" 
                        name="correctAnswerTF" 
                        defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : 'True'}
                        style={{ height: '46px', backgroundColor: '#0a0908', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <option value="True">True</option>
                        <option value="False">False</option>
                      </select>
                    </div>
                  )}

                  {selectedQType === 'FILL_BLANK' && (
                    <div style={{ marginBottom: '16px' }}>
                      <Input
                        label="Correct Answer Text"
                        id="correctAnswerBlank"
                        name="correctAnswerBlank"
                        defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : ''}
                        required
                        placeholder="Provide the exact term or text to match"
                      />
                    </div>
                  )}

                  {selectedQType === 'DESCRIPTIVE' && (
                    <div style={{ marginBottom: '16px' }}>
                      <Textarea
                        label="Model Answer / Standard Key Points"
                        id="correctAnswerDesc"
                        name="correctAnswerDesc"
                        defaultValue={questionModal.mode === 'edit' ? questionModal.data.correctAnswer : ''}
                        required
                        rows="3"
                        placeholder="Standard answer guide text..."
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginBottom: '16px' }}>
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
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <Button variant="secondary" onClick={() => setQuestionModal({ open: false, mode: 'create', moduleId: null, data: null })}>Cancel</Button>
                <Button type="submit">Save Question</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centralized Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />

    </div>
  );
}
