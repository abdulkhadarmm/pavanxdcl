package com.coursemanager.service;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.CourseResponse;
import com.coursemanager.dto.response.CourseSyllabusResponse;
import com.coursemanager.dto.response.DashboardStatsResponse;

import java.util.List;

public interface CourseService {

    List<CourseResponse> getActiveCourses();

    List<CourseResponse> getDeletedCourses();

    CourseResponse getCourseById(Long id);

    CourseSyllabusResponse getCourseSyllabus(Long id);

    DashboardStatsResponse getDashboardStats();

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long id, CourseRequest request);

    void softDeleteCourse(Long id);

    void restoreCourse(Long id);

    void reorderCourses(List<Long> orderedIds);
}
