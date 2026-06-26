package com.coursemanager.service.impl;

import com.coursemanager.dto.request.LoginRequest;
import com.coursemanager.dto.request.UpdateAdminRequest;
import com.coursemanager.entity.Admin;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.repository.AdminRepository;
import com.coursemanager.security.SessionManager;
import com.coursemanager.service.AuthService;
import com.coursemanager.util.PasswordHasher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AdminRepository adminRepository;
    private final SessionManager sessionManager;

    public AuthServiceImpl(AdminRepository adminRepository, SessionManager sessionManager) {
        this.adminRepository = adminRepository;
        this.sessionManager = sessionManager;
    }

    @Override
    @Transactional(readOnly = true)
    public String login(LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!PasswordHasher.check(request.getPassword(), admin.getPassword())) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }

        log.info("Successful login for email: {}", request.getEmail());
        return sessionManager.createSession(admin.getEmail());
    }

    @Override
    public void logout(String token) {
        log.info("Logging out token session");
        sessionManager.invalidateSession(token);
    }

    @Override
    public Admin updateAdmin(UpdateAdminRequest request) {
        log.info("Attempting credentials update for email: {}", request.getCurrentEmail());
        Admin admin = adminRepository.findByEmail(request.getCurrentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + request.getCurrentEmail()));

        // Hash the new password and set it
        String hashedNewPassword = PasswordHasher.hash(request.getNewPassword());
        
        admin.setEmail(request.getNewEmail());
        admin.setPassword(hashedNewPassword);

        Admin savedAdmin = adminRepository.save(admin);
        log.info("Credentials updated successfully. New email: {}", request.getNewEmail());
        return savedAdmin;
    }

    @Override
    @Transactional(readOnly = true)
    public Admin getProfile() {
        return adminRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No administrative accounts exist"));
    }
}
