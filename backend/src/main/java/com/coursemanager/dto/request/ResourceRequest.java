package com.coursemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 150, message = "Resource name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Resource URL is required")
    @Size(max = 500, message = "Resource URL cannot exceed 500 characters")
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
