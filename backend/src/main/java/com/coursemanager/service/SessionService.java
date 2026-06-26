package com.coursemanager.service;

import com.coursemanager.dto.request.PracticeLinkRequest;
import com.coursemanager.dto.request.ResourceRequest;
import com.coursemanager.dto.request.SessionRequest;
import com.coursemanager.dto.response.PracticeLinkResponse;
import com.coursemanager.dto.response.ResourceResponse;
import com.coursemanager.dto.response.SessionResponse;

import java.util.List;

public interface SessionService {

    List<SessionResponse> getActiveSessionsByModule(Long moduleId);

    List<SessionResponse> getDeletedSessionsByModule(Long moduleId);

    SessionResponse getSessionById(Long id);

    SessionResponse createSession(Long moduleId, SessionRequest request);

    SessionResponse updateSession(Long id, SessionRequest request);

    void softDeleteSession(Long id);

    void restoreSession(Long id);

    void reorderSessions(List<Long> orderedIds);

    ResourceResponse addResourceToSession(Long sessionId, ResourceRequest request);

    void removeResource(Long resourceId);

    PracticeLinkResponse addPracticeLinkToSession(Long sessionId, PracticeLinkRequest request);

    void removePracticeLink(Long practiceLinkId);
}
