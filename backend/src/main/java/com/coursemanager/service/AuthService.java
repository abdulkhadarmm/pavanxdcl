package com.coursemanager.service;

import com.coursemanager.dto.request.LoginRequest;
import com.coursemanager.dto.request.UpdateAdminRequest;
import com.coursemanager.entity.Admin;

public interface AuthService {
    String login(LoginRequest request);
    void logout(String token);
    Admin updateAdmin(UpdateAdminRequest request);
    Admin getProfile();
}
