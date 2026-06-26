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
        response.setColorTheme(course.getColorTheme());
        response.setDisplayOrder(course.getDisplayOrder());
        response.setDeleted(course.isDeleted());
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
        course.setColorTheme(request.getColorTheme() == null ? "blue" : request.getColorTheme());
        return course;
    }

    public static void updateEntity(CourseRequest request, Course course) {
        if (request == null || course == null) {
            return;
        }
        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setCourseType(request.getCourseType());
        if (request.getColorTheme() != null) {
            course.setColorTheme(request.getColorTheme());
        }
    }
}
