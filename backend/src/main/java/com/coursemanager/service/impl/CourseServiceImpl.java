package com.coursemanager.service.impl;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.CourseResponse;
import com.coursemanager.entity.Course;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.mapper.CourseMapper;
import com.coursemanager.repository.CourseRepository;
import com.coursemanager.service.CourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private static final Logger log = LoggerFactory.getLogger(CourseServiceImpl.class);

    private final CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getActiveCourses() {
        log.info("Fetching all active courses");
        return courseRepository.findByDeletedFalseOrderByDisplayOrderAsc().stream()
                .map(CourseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getDeletedCourses() {
        log.info("Fetching all deleted courses");
        return courseRepository.findByDeletedTrueOrderByDisplayOrderAsc().stream()
                .map(CourseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        log.info("Fetching course with ID: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return CourseMapper.toResponse(course);
    }

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        log.info("Creating a new course with name: {}", request.getName());
        Course course = CourseMapper.toEntity(request);
        int maxOrder = courseRepository.findMaxDisplayOrder();
        course.setDisplayOrder(maxOrder + 1);
        Course savedCourse = courseRepository.save(course);
        return CourseMapper.toResponse(savedCourse);
    }

    @Override
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        log.info("Updating course with ID: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        CourseMapper.updateEntity(request, course);
        Course updatedCourse = courseRepository.save(course);
        return CourseMapper.toResponse(updatedCourse);
    }

    @Override
    public void softDeleteCourse(Long id) {
        log.info("Soft deleting course with ID: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        course.setDeleted(true);
        courseRepository.save(course);
    }

    @Override
    public void restoreCourse(Long id) {
        log.info("Restoring course with ID: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        course.setDeleted(false);
        courseRepository.save(course);
    }

    @Override
    public void reorderCourses(List<Long> orderedIds) {
        log.info("Reordering courses with ID sequence: {}", orderedIds);
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                course.setDisplayOrder(i);
                courseRepository.save(course);
            } else {
                log.warn("Reorder request: Course with ID {} not found", id);
            }
        }
    }
}
