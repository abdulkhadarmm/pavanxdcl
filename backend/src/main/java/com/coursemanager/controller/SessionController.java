package com.coursemanager.controller;

import com.coursemanager.dto.request.PracticeLinkRequest;
import com.coursemanager.dto.request.ResourceRequest;
import com.coursemanager.dto.request.SessionRequest;
import com.coursemanager.dto.response.ApiResponse;
import com.coursemanager.dto.response.PracticeLinkResponse;
import com.coursemanager.dto.response.ResourceResponse;
import com.coursemanager.dto.response.SessionResponse;
import com.coursemanager.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/modules/{moduleId}/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getActiveSessionsByModule(@PathVariable Long moduleId) {
        List<SessionResponse> sessions = sessionService.getActiveSessionsByModule(moduleId);
        ApiResponse<List<SessionResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Active sessions fetched successfully",
                sessions
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/modules/{moduleId}/sessions/deleted")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getDeletedSessionsByModule(@PathVariable Long moduleId) {
        List<SessionResponse> sessions = sessionService.getDeletedSessionsByModule(moduleId);
        ApiResponse<List<SessionResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Soft-deleted sessions fetched successfully",
                sessions
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionById(@PathVariable Long id) {
        SessionResponse session = sessionService.getSessionById(id);
        ApiResponse<SessionResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Session fetched successfully",
                session
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/modules/{moduleId}/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @PathVariable Long moduleId,
            @Valid @RequestBody SessionRequest request) {
        SessionResponse session = sessionService.createSession(moduleId, request);
        ApiResponse<SessionResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Session created successfully",
                session
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> updateSession(
            @PathVariable Long id,
            @Valid @RequestBody SessionRequest request) {
        SessionResponse session = sessionService.updateSession(id, request);
        ApiResponse<SessionResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Session updated successfully",
                session
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteSession(@PathVariable Long id) {
        sessionService.softDeleteSession(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Session soft-deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/sessions/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreSession(@PathVariable Long id) {
        sessionService.restoreSession(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Session restored successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/sessions/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderSessions(@RequestBody List<Long> orderedIds) {
        sessionService.reorderSessions(orderedIds);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Sessions reordered successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionId}/resources")
    public ResponseEntity<ApiResponse<ResourceResponse>> addResourceToSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody ResourceRequest request) {
        ResourceResponse resource = sessionService.addResourceToSession(sessionId, request);
        ApiResponse<ResourceResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Resource added successfully",
                resource
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> removeResource(@PathVariable Long resourceId) {
        sessionService.removeResource(resourceId);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Resource removed successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionId}/practice-links")
    public ResponseEntity<ApiResponse<PracticeLinkResponse>> addPracticeLinkToSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody PracticeLinkRequest request) {
        PracticeLinkResponse link = sessionService.addPracticeLinkToSession(sessionId, request);
        ApiResponse<PracticeLinkResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Practice link added successfully",
                link
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/practice-links/{practiceLinkId}")
    public ResponseEntity<ApiResponse<Void>> removePracticeLink(@PathVariable Long practiceLinkId) {
        sessionService.removePracticeLink(practiceLinkId);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Practice link removed successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}
