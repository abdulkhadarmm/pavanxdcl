package com.coursemanager.dto.response;

import java.util.List;

public class SessionResponse {
    private Long id;
    private Long moduleId;
    private String sessionCode;
    private String contentTitle;
    private String importanceLevel;
    private int displayOrder;
    private boolean deleted;
    private List<ResourceResponse> resources;
    private List<PracticeLinkResponse> practiceLinks;
    private String updatedAt;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

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

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public List<ResourceResponse> getResources() {
        return resources;
    }

    public void setResources(List<ResourceResponse> resources) {
        this.resources = resources;
    }

    public List<PracticeLinkResponse> getPracticeLinks() {
        return practiceLinks;
    }

    public void setPracticeLinks(List<PracticeLinkResponse> practiceLinks) {
        this.practiceLinks = practiceLinks;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
