package com.coursemanager.service.impl;

import com.coursemanager.dto.request.ModuleRequest;
import com.coursemanager.dto.response.ModuleResponse;
import com.coursemanager.entity.Course;
import com.coursemanager.entity.Module;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.mapper.ModuleMapper;
import com.coursemanager.repository.CourseRepository;
import com.coursemanager.repository.ModuleRepository;
import com.coursemanager.service.ModuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ModuleServiceImpl implements ModuleService {

    private static final Logger log = LoggerFactory.getLogger(ModuleServiceImpl.class);

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public ModuleServiceImpl(ModuleRepository moduleRepository, CourseRepository courseRepository) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> getActiveModulesByCourse(Long courseId) {
        log.info("Fetching active modules/topics for course ID: {}", courseId);
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with id: " + courseId);
        }
        return moduleRepository.findByCourseIdAndDeletedFalseOrderByDisplayOrderAsc(courseId).stream()
                .map(ModuleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> getDeletedModulesByCourse(Long courseId) {
        log.info("Fetching deleted modules/topics for course ID: {}", courseId);
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with id: " + courseId);
        }
        return moduleRepository.findByCourseIdAndDeletedTrueOrderByDisplayOrderAsc(courseId).stream()
                .map(ModuleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponse getModuleById(Long id) {
        log.info("Fetching module/topic with ID: {}", id);
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module/Topic not found with id: " + id));
        return ModuleMapper.toResponse(module);
    }

    @Override
    public ModuleResponse createModule(Long courseId, ModuleRequest request) {
        log.info("Creating a new module/topic under course ID: {}", courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        Module module = ModuleMapper.toEntity(request);
        module.setCourse(course);
        int maxOrder = moduleRepository.findMaxDisplayOrderByCourseId(courseId);
        module.setDisplayOrder(maxOrder + 1);
        Module savedModule = moduleRepository.save(module);
        return ModuleMapper.toResponse(savedModule);
    }

    @Override
    public ModuleResponse updateModule(Long id, ModuleRequest request) {
        log.info("Updating module/topic with ID: {}", id);
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module/Topic not found with id: " + id));
        ModuleMapper.updateEntity(request, module);
        Module updatedModule = moduleRepository.save(module);
        return ModuleMapper.toResponse(updatedModule);
    }

    @Override
    public void softDeleteModule(Long id) {
        log.info("Soft deleting module/topic with ID: {}", id);
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module/Topic not found with id: " + id));
        module.setDeleted(true);
        moduleRepository.save(module);
    }

    @Override
    public void restoreModule(Long id) {
        log.info("Restoring module/topic with ID: {}", id);
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module/Topic not found with id: " + id));
        module.setDeleted(false);
        moduleRepository.save(module);
    }

    @Override
    public void reorderModules(List<Long> orderedIds) {
        log.info("Reordering modules/topics with ID sequence: {}", orderedIds);
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            Optional<Module> moduleOpt = moduleRepository.findById(id);
            if (moduleOpt.isPresent()) {
                Module module = moduleOpt.get();
                module.setDisplayOrder(i);
                moduleRepository.save(module);
            } else {
                log.warn("Reorder request: Module/Topic with ID {} not found", id);
            }
        }
    }
}
