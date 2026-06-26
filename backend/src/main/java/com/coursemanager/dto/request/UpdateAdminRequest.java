package com.coursemanager.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateAdminRequest {

    @NotBlank(message = "Current email is required")
    @Email(message = "Please provide a valid current email address")
    private String currentEmail;

    @NotBlank(message = "New email is required")
    @Email(message = "Please provide a valid new email address")
    private String newEmail;

    @NotBlank(message = "New password is required")
    private String newPassword;

    public UpdateAdminRequest() {
    }

    public UpdateAdminRequest(String currentEmail, String newEmail, String newPassword) {
        this.currentEmail = currentEmail;
        this.newEmail = newEmail;
        this.newPassword = newPassword;
    }

    public String getCurrentEmail() {
        return currentEmail;
    }

    public void setCurrentEmail(String currentEmail) {
        this.currentEmail = currentEmail;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
