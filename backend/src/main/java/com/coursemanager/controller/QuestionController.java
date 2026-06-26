package com.coursemanager.controller;

import com.coursemanager.dto.request.QuestionRequest;
import com.coursemanager.dto.response.ApiResponse;
import com.coursemanager.dto.response.QuestionResponse;
import com.coursemanager.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/modules/{topicId}/questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getActiveQuestionsByTopic(@PathVariable Long topicId) {
        List<QuestionResponse> questions = questionService.getActiveQuestionsByTopic(topicId);
        ApiResponse<List<QuestionResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Active questions fetched successfully",
                questions
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/modules/{topicId}/questions/deleted")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getDeletedQuestionsByTopic(@PathVariable Long topicId) {
        List<QuestionResponse> questions = questionService.getDeletedQuestionsByTopic(topicId);
        ApiResponse<List<QuestionResponse>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Soft-deleted questions fetched successfully",
                questions
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long id) {
        QuestionResponse question = questionService.getQuestionById(id);
        ApiResponse<QuestionResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Question fetched successfully",
                question
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/modules/{topicId}/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @PathVariable Long topicId,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.createQuestion(topicId, request);
        ApiResponse<QuestionResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Question created successfully",
                question
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.updateQuestion(id, request);
        ApiResponse<QuestionResponse> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Question updated successfully",
                question
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteQuestion(@PathVariable Long id) {
        questionService.softDeleteQuestion(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Question soft-deleted successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/questions/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreQuestion(@PathVariable Long id) {
        questionService.restoreQuestion(id);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Question restored successfully",
                null
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/questions/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderQuestions(@RequestBody List<Long> orderedIds) {
        questionService.reorderQuestions(orderedIds);
        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Questions reordered successfully",
                null
        );
        return ResponseEntity.ok(response);
    }
}
