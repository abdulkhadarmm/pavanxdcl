package com.coursemanager.mapper;

import com.coursemanager.dto.request.ModuleRequest;
import com.coursemanager.dto.response.ModuleResponse;
import com.coursemanager.entity.Module;

public class ModuleMapper {

    public static ModuleResponse toResponse(Module module) {
        if (module == null) {
            return null;
        }
        ModuleResponse response = new ModuleResponse();
        response.setId(module.getId());
        response.setCourseId(module.getCourse().getId());
        response.setName(module.getName());
        response.setDescription(module.getDescription());
        response.setDisplayOrder(module.getDisplayOrder());
        response.setDeleted(module.isDeleted());
        return response;
    }

    public static Module toEntity(ModuleRequest request) {
        if (request == null) {
            return null;
        }
        Module module = new Module();
        module.setName(request.getName());
        module.setDescription(request.getDescription());
        return module;
    }

    public static void updateEntity(ModuleRequest request, Module module) {
        if (request == null || module == null) {
            return;
        }
        module.setName(request.getName());
        module.setDescription(request.getDescription());
    }
}
