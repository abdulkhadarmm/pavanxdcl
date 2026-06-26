package com.coursemanager.controller;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.ApiResponse;
import com.coursemanager.dto.response.CourseResponse;
import com.coursemanager.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getActiveCourses() {
        List<CourseResponse> courses = courseService.getActiveCourses();
        ApiResponse<List<CourseResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Active courses fetched successfully",
                courses
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/deleted")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getDeletedCourses() {
        List<CourseResponse> courses = courseService.getDeletedCourses();
        ApiResponse<List<CourseResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Soft-deleted courses fetched successfully",
                courses
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        ApiResponse<CourseResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Course fetched successfully",
                course
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.createCourse(request);
        ApiResponse<CourseResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Course created successfully",
                course
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        ApiResponse<CourseResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Course updated successfully",
                course
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteCourse(@PathVariable Long id) {
        courseService.softDeleteCourse(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Course soft-deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreCourse(@PathVariable Long id) {
        courseService.restoreCourse(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Course restored successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderCourses(@RequestBody List<Long> orderedIds) {
        courseService.reorderCourses(orderedIds);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Courses reordered successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}
