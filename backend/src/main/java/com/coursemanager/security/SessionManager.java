package com.coursemanager.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class SessionManager {
    // 10 minutes in milliseconds
    private static final long SESSION_TIMEOUT_MS = 10 * 60 * 1000;
    
    private final Map<String, Long> tokenToLastActivity = new ConcurrentHashMap<>();
    private final Map<String, String> tokenToEmail = new ConcurrentHashMap<>();
    private final Map<String, String> emailToToken = new ConcurrentHashMap<>();

    public String createSession(String email) {
        if (email == null) return null;
        
        // If there's an existing session for this email, invalidate it immediately
        String oldToken = emailToToken.get(email);
        if (oldToken != null) {
            tokenToLastActivity.remove(oldToken);
            tokenToEmail.remove(oldToken);
        }
        
        String token = UUID.randomUUID().toString();
        long now = System.currentTimeMillis();
        tokenToLastActivity.put(token, now);
        tokenToEmail.put(token, email);
        emailToToken.put(email, token);
        return token;
    }

    public boolean isValidSession(String token) {
        if (token == null) {
            return false;
        }
        Long lastActivity = tokenToLastActivity.get(token);
        if (lastActivity == null) {
            return false;
        }
        if (System.currentTimeMillis() - lastActivity > SESSION_TIMEOUT_MS) {
            invalidateSession(token);
            return false;
        }
        // Update last activity time (sliding window)
        tokenToLastActivity.put(token, System.currentTimeMillis());
        return true;
    }

    public void invalidateSession(String token) {
        if (token != null) {
            tokenToLastActivity.remove(token);
            String email = tokenToEmail.remove(token);
            if (email != null) {
                // Only remove from emailToToken if it's the exact same token
                emailToToken.remove(email, token);
            }
        }
    }
}
