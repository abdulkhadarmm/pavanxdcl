package com.coursemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class SessionRequest {

    @NotBlank(message = "Session code is required")
    @Size(max = 50, message = "Session code cannot exceed 50 characters")
    private String sessionCode;

    @NotBlank(message = "Content title is required")
    @Size(max = 250, message = "Content title cannot exceed 250 characters")
    private String contentTitle;

    @Size(max = 50, message = "Importance level cannot exceed 50 characters")
    private String importanceLevel = "MEDIUM";



    private List<ResourceRequest> resources;

    private List<PracticeLinkRequest> practiceLinks;

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



    public List<ResourceRequest> getResources() {
        return resources;
    }

    public void setResources(List<ResourceRequest> resources) {
        this.resources = resources;
    }

    public List<PracticeLinkRequest> getPracticeLinks() {
        return practiceLinks;
    }

    public void setPracticeLinks(List<PracticeLinkRequest> practiceLinks) {
        this.practiceLinks = practiceLinks;
    }
}
