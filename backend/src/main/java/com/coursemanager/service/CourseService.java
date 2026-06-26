package com.coursemanager.service;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.CourseResponse;

import java.util.List;

public interface CourseService {

    List<CourseResponse> getActiveCourses();

    List<CourseResponse> getDeletedCourses();

    CourseResponse getCourseById(Long id);

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long id, CourseRequest request);

    void softDeleteCourse(Long id);

    void restoreCourse(Long id);

    void reorderCourses(List<Long> orderedIds);
}
