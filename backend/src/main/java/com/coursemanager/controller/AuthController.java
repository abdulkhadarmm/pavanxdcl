package com.coursemanager.controller;

import com.coursemanager.dto.request.LoginRequest;
import com.coursemanager.dto.request.UpdateAdminRequest;
import com.coursemanager.dto.response.ApiResponse;
import com.coursemanager.entity.Admin;
import com.coursemanager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        
        Map<String, String> responseData = new HashMap<>();
        responseData.put("email", request.getEmail());
        responseData.put("token", token);

        ApiResponse<Map<String, String>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Login successful",
                responseData
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Logged out successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateAdmin(@Valid @RequestBody UpdateAdminRequest request) {
        Admin admin = authService.updateAdmin(request);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("email", admin.getEmail());

        ApiResponse<Map<String, String>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Credentials updated successfully",
                responseData
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, String>>> getProfile() {
        Admin admin = authService.getProfile();

        Map<String, String> responseData = new HashMap<>();
        responseData.put("email", admin.getEmail());

        ApiResponse<Map<String, String>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Admin profile fetched successfully",
                responseData
        );
        return ResponseEntity.ok(response);
    }
}
