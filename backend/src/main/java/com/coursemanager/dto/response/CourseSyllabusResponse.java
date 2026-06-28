package com.coursemanager.dto.response;

import com.coursemanager.entity.CourseType;
import java.util.List;

public class CourseSyllabusResponse {
    private Long id;
    private String name;
    private String description;
    private CourseType courseType;
    private String primaryColor;
    private String secondaryColor;
    private String slug;
    private List<ModuleSyllabusResponse> modules;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CourseType getCourseType() {
        return courseType;
    }

    public void setCourseType(CourseType courseType) {
        this.courseType = courseType;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public List<ModuleSyllabusResponse> getModules() {
        return modules;
    }

    public void setModules(List<ModuleSyllabusResponse> modules) {
        this.modules = modules;
    }
}
