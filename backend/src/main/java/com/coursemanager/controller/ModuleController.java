package com.coursemanager.controller;

import com.coursemanager.dto.request.ModuleRequest;
import com.coursemanager.dto.response.ApiResponse;
import com.coursemanager.dto.response.ModuleResponse;
import com.coursemanager.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getActiveModulesByCourse(@PathVariable Long courseId) {
        List<ModuleResponse> modules = moduleService.getActiveModulesByCourse(courseId);
        ApiResponse<List<ModuleResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Active modules/topics fetched successfully",
                modules
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{courseId}/modules/deleted")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getDeletedModulesByCourse(@PathVariable Long courseId) {
        List<ModuleResponse> modules = moduleService.getDeletedModulesByCourse(courseId);
        ApiResponse<List<ModuleResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Soft-deleted modules/topics fetched successfully",
                modules
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> getModuleById(@PathVariable Long id) {
        ModuleResponse module = moduleService.getModuleById(id);
        ApiResponse<ModuleResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Module/Topic fetched successfully",
                module
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody ModuleRequest request) {
        ModuleResponse module = moduleService.createModule(courseId, request);
        ApiResponse<ModuleResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Module/Topic created successfully",
                module
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody ModuleRequest request) {
        ModuleResponse module = moduleService.updateModule(id, request);
        ApiResponse<ModuleResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Module/Topic updated successfully",
                module
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteModule(@PathVariable Long id) {
        moduleService.softDeleteModule(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Module/Topic soft-deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/modules/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreModule(@PathVariable Long id) {
        moduleService.restoreModule(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Module/Topic restored successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/modules/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderModules(@RequestBody List<Long> orderedIds) {
        moduleService.reorderModules(orderedIds);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Modules/Topics reordered successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}
