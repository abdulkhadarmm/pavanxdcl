package com.coursemanager.service.impl;

import com.coursemanager.dto.request.PracticeLinkRequest;
import com.coursemanager.dto.request.ResourceRequest;
import com.coursemanager.dto.request.SessionRequest;
import com.coursemanager.dto.response.PracticeLinkResponse;
import com.coursemanager.dto.response.ResourceResponse;
import com.coursemanager.dto.response.SessionResponse;
import com.coursemanager.entity.Module;
import com.coursemanager.entity.PracticeLink;
import com.coursemanager.entity.Resource;
import com.coursemanager.entity.Session;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.mapper.SessionMapper;
import com.coursemanager.repository.ModuleRepository;
import com.coursemanager.repository.PracticeLinkRepository;
import com.coursemanager.repository.ResourceRepository;
import com.coursemanager.repository.SessionRepository;
import com.coursemanager.service.SessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SessionServiceImpl implements SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionServiceImpl.class);

    private final SessionRepository sessionRepository;
    private final ModuleRepository moduleRepository;
    private final ResourceRepository resourceRepository;
    private final PracticeLinkRepository practiceLinkRepository;

    public SessionServiceImpl(SessionRepository sessionRepository, ModuleRepository moduleRepository,
                              ResourceRepository resourceRepository, PracticeLinkRepository practiceLinkRepository) {
        this.sessionRepository = sessionRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
        this.practiceLinkRepository = practiceLinkRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessionsByModule(Long moduleId) {
        log.info("Fetching active sessions for module ID: {}", moduleId);
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module not found with id: " + moduleId);
        }
        return sessionRepository.findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(moduleId).stream()
                .map(SessionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getDeletedSessionsByModule(Long moduleId) {
        log.info("Fetching deleted sessions for module ID: {}", moduleId);
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module not found with id: " + moduleId);
        }
        return sessionRepository.findByModuleIdAndDeletedTrueOrderByDisplayOrderAsc(moduleId).stream()
                .map(SessionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SessionResponse getSessionById(Long id) {
        log.info("Fetching session with ID: {}", id);
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        return SessionMapper.toResponse(session);
    }

    @Override
    public SessionResponse createSession(Long moduleId, SessionRequest request) {
        log.info("Creating a session under module ID: {}", moduleId);
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));
        Session session = SessionMapper.toEntity(request);
        session.setModule(module);
        int maxOrder = sessionRepository.findMaxDisplayOrderByModuleId(moduleId);
        session.setDisplayOrder(maxOrder + 1);
        Session savedSession = sessionRepository.save(session);
        return SessionMapper.toResponse(savedSession);
    }

    @Override
    public SessionResponse updateSession(Long id, SessionRequest request) {
        log.info("Updating session with ID: {}", id);
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        SessionMapper.updateEntity(request, session);
        Session updatedSession = sessionRepository.save(session);
        return SessionMapper.toResponse(updatedSession);
    }

    @Override
    public void softDeleteSession(Long id) {
        log.info("Soft deleting session with ID: {}", id);
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        session.setDeleted(true);
        sessionRepository.save(session);
    }

    @Override
    public void restoreSession(Long id) {
        log.info("Restoring session with ID: {}", id);
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        session.setDeleted(false);
        sessionRepository.save(session);
    }

    @Override
    public void reorderSessions(List<Long> orderedIds) {
        log.info("Reordering sessions with ID sequence: {}", orderedIds);
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            Optional<Session> sessionOpt = sessionRepository.findById(id);
            if (sessionOpt.isPresent()) {
                Session session = sessionOpt.get();
                session.setDisplayOrder(i);
                sessionRepository.save(session);
            } else {
                log.warn("Reorder request: Session with ID {} not found", id);
            }
        }
    }

    @Override
    public ResourceResponse addResourceToSession(Long sessionId, ResourceRequest request) {
        log.info("Adding resource '{}' to session ID: {}", request.getName(), sessionId);
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        Resource resource = SessionMapper.toEntity(request);
        resource.setSession(session);
        Resource savedResource = resourceRepository.save(resource);
        return SessionMapper.toResponse(savedResource);
    }

    @Override
    public void removeResource(Long resourceId) {
        log.info("Deleting resource ID: {}", resourceId);
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found with id: " + resourceId);
        }
        resourceRepository.deleteById(resourceId);
    }

    @Override
    public PracticeLinkResponse addPracticeLinkToSession(Long sessionId, PracticeLinkRequest request) {
        log.info("Adding practice link '{}' to session ID: {}", request.getName(), sessionId);
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        PracticeLink link = SessionMapper.toEntity(request);
        link.setSession(session);
        PracticeLink savedLink = practiceLinkRepository.save(link);
        return SessionMapper.toResponse(savedLink);
    }

    @Override
    public void removePracticeLink(Long practiceLinkId) {
        log.info("Deleting practice link ID: {}", practiceLinkId);
        if (!practiceLinkRepository.existsById(practiceLinkId)) {
            throw new ResourceNotFoundException("Practice link not found with id: " + practiceLinkId);
        }
        practiceLinkRepository.deleteById(practiceLinkId);
    }
}
