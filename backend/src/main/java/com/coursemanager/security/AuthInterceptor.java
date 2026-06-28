package com.coursemanager.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionManager sessionManager;

    public AuthInterceptor(SessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS pre-flight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Check if the path is public
        if (isPublicEndpoint(path, method)) {
            // Even for public endpoints, if a valid token is provided, update the last activity time
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                sessionManager.isValidSession(token); // updates activity if valid
            }
            return true;
        }

        // Require a valid session token for admin endpoints
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (sessionManager.isValidSession(token)) {
                return true;
            }
        }

        // Return 401 Unauthorized
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"status\":401,\"message\":\"Session expired or invalid. Please login again.\",\"data\":null}");
        return false;
    }

    private boolean isPublicEndpoint(String path, String method) {
        // Normalize trailing slash
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }

        // 1. POST /api/auth/login is public
        if ("/api/auth/login".equals(path) && "POST".equalsIgnoreCase(method)) {
            return true;
        }

        // 2. GET and HEAD requests are public, EXCEPT for profile/update and /deleted endpoints
        if ("GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) {
            if (path.contains("/deleted")) {
                return false;
            }
            if (path.equals("/api/auth/profile") || path.equals("/api/auth/update")) {
                return false;
            }
            // All other GET requests under /api/** are public
            return path.startsWith("/api");
        }

        return false;
    }
}
