package com.coursemanager.service.impl;

import com.coursemanager.dto.request.CourseRequest;
import com.coursemanager.dto.response.*;
import com.coursemanager.entity.Course;
import com.coursemanager.entity.Module;
import com.coursemanager.entity.Question;
import com.coursemanager.entity.Session;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.mapper.CourseMapper;
import com.coursemanager.mapper.QuestionMapper;
import com.coursemanager.mapper.SessionMapper;
import com.coursemanager.repository.*;
import com.coursemanager.service.CourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private static final Logger log = LoggerFactory.getLogger(CourseServiceImpl.class);

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final SessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final ResourceRepository resourceRepository;

    public CourseServiceImpl(CourseRepository courseRepository,
                             ModuleRepository moduleRepository,
                             SessionRepository sessionRepository,
                             QuestionRepository questionRepository,
                             ResourceRepository resourceRepository) {
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.resourceRepository = resourceRepository;
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

    @Override
    @Transactional(readOnly = true)
    public CourseSyllabusResponse getCourseSyllabus(Long id) {
        log.info("Fetching course syllabus for course ID: {}", id);
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        CourseSyllabusResponse response = new CourseSyllabusResponse();
        response.setId(course.getId());
        response.setName(course.getName());
        response.setDescription(course.getDescription());
        response.setCourseType(course.getCourseType());
        response.setPrimaryColor(course.getPrimaryColor());
        response.setSecondaryColor(course.getSecondaryColor());
        response.setSlug(CourseMapper.toResponse(course).getSlug());

        List<Module> activeModules = moduleRepository.findByCourseIdAndDeletedFalseOrderByDisplayOrderAsc(id);
        List<ModuleSyllabusResponse> moduleSyllabuses = activeModules.stream().map(m -> {
            ModuleSyllabusResponse modResp = new ModuleSyllabusResponse();
            modResp.setId(m.getId());
            modResp.setName(m.getName());
            modResp.setDescription(m.getDescription());
            modResp.setDisplayOrder(m.getDisplayOrder());

            if (course.getCourseType() == com.coursemanager.entity.CourseType.LEARNING) {
                List<Session> sessions = sessionRepository.findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(m.getId());
                List<SessionResponse> sessionResponses = sessions.stream()
                        .map(SessionMapper::toResponse)
                        .collect(Collectors.toList());
                modResp.setSessions(sessionResponses);
                modResp.setQuestions(new ArrayList<>());
            } else {
                List<Question> questions = questionRepository.findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(m.getId());
                List<QuestionResponse> questionResponses = questions.stream()
                        .map(QuestionMapper::toResponse)
                        .collect(Collectors.toList());
                modResp.setQuestions(questionResponses);
                modResp.setSessions(new ArrayList<>());
            }
            return modResp;
        }).collect(Collectors.toList());

        response.setModules(moduleSyllabuses);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.info("Calculating dashboard statistics");
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setCourses(courseRepository.countByDeletedFalse());
        stats.setModules(moduleRepository.countByDeletedFalse());
        stats.setSessions(sessionRepository.countByDeletedFalse());
        stats.setQuestions(questionRepository.countByDeletedFalse());
        stats.setResources(resourceRepository.countActiveResources());

        List<Session> recentSessions = sessionRepository.findTop5ByDeletedFalseOrderByUpdatedAtDesc();
        List<SessionResponse> recentSessionResponses = recentSessions.stream()
                .map(s -> {
                    SessionResponse sr = SessionMapper.toResponse(s);
                    if (s.getModule() != null) {
                        sr.setModuleName(s.getModule().getName());
                        if (s.getModule().getCourse() != null) {
                            sr.setCourseName(s.getModule().getCourse().getName());
                        }
                    }
                    return sr;
                })
                .collect(Collectors.toList());
        stats.setRecentSessions(recentSessionResponses);

        return stats;
    }
}
