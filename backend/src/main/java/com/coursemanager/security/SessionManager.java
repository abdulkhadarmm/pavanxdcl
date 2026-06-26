package com.coursemanager.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class SessionManager {
    // 10 minutes in milliseconds
    private static final long SESSION_TIMEOUT_MS = 10 * 60 * 1000;
    
    private final Map<String, Long> activeSessions = new ConcurrentHashMap<>();

    public String createSession(String email) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, System.currentTimeMillis());
        return token;
    }

    public boolean isValidSession(String token) {
        if (token == null) {
            return false;
        }
        Long lastActivity = activeSessions.get(token);
        if (lastActivity == null) {
            return false;
        }
        if (System.currentTimeMillis() - lastActivity > SESSION_TIMEOUT_MS) {
            activeSessions.remove(token);
            return false;
        }
        // Update last activity time (sliding window)
        activeSessions.put(token, System.currentTimeMillis());
        return true;
    }

    public void invalidateSession(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }
}
