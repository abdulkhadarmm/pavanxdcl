package com.coursemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PracticeLinkRequest {

    @NotBlank(message = "Practice link name is required")
    @Size(max = 150, message = "Practice link name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Practice link URL is required")
    @Size(max = 500, message = "Practice link URL cannot exceed 500 characters")
    private String url;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
