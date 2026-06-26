package com.coursemanager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_type", nullable = false, length = 50)
    private CourseType courseType;

    @Column(name = "primary_color", length = 50)
    private String primaryColor = "#8b5cf6";

    @Column(name = "secondary_color", length = 50)
    private String secondaryColor = "#d946ef";

    @Column(name = "display_order")
    private int displayOrder = 0;

    @Column(nullable = false)
    private boolean deleted = false;

    public Course() {
    }

    public Course(Long id, String name, String description, CourseType courseType, String primaryColor, String secondaryColor, int displayOrder, boolean deleted) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.courseType = courseType;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.displayOrder = displayOrder;
        this.deleted = deleted;
    }

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
}
