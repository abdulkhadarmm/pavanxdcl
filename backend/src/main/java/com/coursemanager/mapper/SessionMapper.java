package com.coursemanager.mapper;

import com.coursemanager.dto.request.PracticeLinkRequest;
import com.coursemanager.dto.request.ResourceRequest;
import com.coursemanager.dto.request.SessionRequest;
import com.coursemanager.dto.response.PracticeLinkResponse;
import com.coursemanager.dto.response.ResourceResponse;
import com.coursemanager.dto.response.SessionResponse;
import com.coursemanager.entity.PracticeLink;
import com.coursemanager.entity.Resource;
import com.coursemanager.entity.Session;

import java.util.Collections;
import java.util.stream.Collectors;

public class SessionMapper {

    public static SessionResponse toResponse(Session session) {
        if (session == null) {
            return null;
        }
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setModuleId(session.getModule().getId());
        response.setSessionCode(session.getSessionCode());
        response.setContentTitle(session.getContentTitle());
        response.setImportanceLevel(session.getImportanceLevel());
        response.setDisplayOrder(session.getDisplayOrder());
        response.setDeleted(session.isDeleted());

        if (session.getResources() != null) {
            response.setResources(session.getResources().stream()
                    .map(SessionMapper::toResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setResources(Collections.emptyList());
        }

        if (session.getPracticeLinks() != null) {
            response.setPracticeLinks(session.getPracticeLinks().stream()
                    .map(SessionMapper::toResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setPracticeLinks(Collections.emptyList());
        }

        return response;
    }

    public static ResourceResponse toResponse(Resource resource) {
        if (resource == null) {
            return null;
        }
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setSessionId(resource.getSession().getId());
        response.setName(resource.getName());
        response.setUrl(resource.getUrl());
        return response;
    }

    public static PracticeLinkResponse toResponse(PracticeLink link) {
        if (link == null) {
            return null;
        }
        PracticeLinkResponse response = new PracticeLinkResponse();
        response.setId(link.getId());
        response.setSessionId(link.getSession().getId());
        response.setName(link.getName());
        response.setUrl(link.getUrl());
        return response;
    }

    public static Session toEntity(SessionRequest request) {
        if (request == null) {
            return null;
        }
        Session session = new Session();
        session.setSessionCode(request.getSessionCode());
        session.setContentTitle(request.getContentTitle());
        session.setImportanceLevel(request.getImportanceLevel() == null ? "MEDIUM" : request.getImportanceLevel());
        return session;
    }

    public static Resource toEntity(ResourceRequest request) {
        if (request == null) {
            return null;
        }
        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setUrl(request.getUrl());
        return resource;
    }

    public static PracticeLink toEntity(PracticeLinkRequest request) {
        if (request == null) {
            return null;
        }
        PracticeLink link = new PracticeLink();
        link.setName(request.getName());
        link.setUrl(request.getUrl());
        return link;
    }

    public static void updateEntity(SessionRequest request, Session session) {
        if (request == null || session == null) {
            return;
        }
        session.setSessionCode(request.getSessionCode());
        session.setContentTitle(request.getContentTitle());
        if (request.getImportanceLevel() != null) {
            session.setImportanceLevel(request.getImportanceLevel());
        }
    }
}
