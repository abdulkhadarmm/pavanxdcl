package com.coursemanager.mapper;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.CourseResponse;
import com.coursemanager.entity.Course;

public class CourseMapper {

    public static CourseResponse toResponse(Course course) {
        if (course == null) {
            return null;
        }
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setName(course.getName());
        response.setDescription(course.getDescription());
        response.setCourseType(course.getCourseType());
        response.setPrimaryColor(course.getPrimaryColor());
        response.setSecondaryColor(course.getSecondaryColor());
        response.setDisplayOrder(course.getDisplayOrder());
        response.setDeleted(course.isDeleted());
        response.setSlug(generateSlug(course.getName()));
        return response;
    }

    public static Course toEntity(CourseRequest request) {
        if (request == null) {
            return null;
        }
        Course course = new Course();
        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setCourseType(request.getCourseType());
        course.setPrimaryColor(request.getPrimaryColor() == null ? "#8b5cf6" : request.getPrimaryColor());
        course.setSecondaryColor(request.getSecondaryColor() == null ? "#d946ef" : request.getSecondaryColor());
        return course;
    }

    public static void updateEntity(CourseRequest request, Course course) {
        if (request == null || course == null) {
            return;
        }
        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setCourseType(request.getCourseType());
        if (request.getPrimaryColor() != null) {
            course.setPrimaryColor(request.getPrimaryColor());
        }
        if (request.getSecondaryColor() != null) {
            course.setSecondaryColor(request.getSecondaryColor());
        }
    }

    private static String generateSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("^-|-$", "");
    }
}
