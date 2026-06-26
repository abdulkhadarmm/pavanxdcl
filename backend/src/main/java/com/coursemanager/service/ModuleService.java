package com.coursemanager.service;

import com.coursemanager.dto.request.ModuleRequest;
import com.coursemanager.dto.response.ModuleResponse;

import java.util.List;

public interface ModuleService {

    List<ModuleResponse> getActiveModulesByCourse(Long courseId);

    List<ModuleResponse> getDeletedModulesByCourse(Long courseId);

    ModuleResponse getModuleById(Long id);

    ModuleResponse createModule(Long courseId, ModuleRequest request);

    ModuleResponse updateModule(Long id, ModuleRequest request);

    void softDeleteModule(Long id);

    void restoreModule(Long id);

    void reorderModules(List<Long> orderedIds);
}
