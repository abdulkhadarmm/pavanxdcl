package com.coursemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SessionRequest {

    @NotBlank(message = "Session code is required")
    @Size(max = 50, message = "Session code cannot exceed 50 characters")
    private String sessionCode;

    @NotBlank(message = "Content title is required")
    @Size(max = 250, message = "Content title cannot exceed 250 characters")
    private String contentTitle;

    @Size(max = 20, message = "Importance level cannot exceed 20 characters")
    private String importanceLevel = "MEDIUM";

    public String getSessionCode() {
        return sessionCode;
    }

    public void setSessionCode(String sessionCode) {
        this.sessionCode = sessionCode;
    }

    public String getContentTitle() {
        return contentTitle;
    }

    public void setContentTitle(String contentTitle) {
        this.contentTitle = contentTitle;
    }

    public String getImportanceLevel() {
        return importanceLevel;
    }

    public void setImportanceLevel(String importanceLevel) {
        this.importanceLevel = importanceLevel;
    }
}
