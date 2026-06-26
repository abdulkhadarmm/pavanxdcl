package com.coursemanager.service;

import com.coursemanager.dto.request.QuestionRequest;
import com.coursemanager.dto.response.QuestionResponse;

import java.util.List;

public interface QuestionService {

    List<QuestionResponse> getActiveQuestionsByTopic(Long topicId);

    List<QuestionResponse> getDeletedQuestionsByTopic(Long topicId);

    QuestionResponse getQuestionById(Long id);

    QuestionResponse createQuestion(Long topicId, QuestionRequest request);

    QuestionResponse updateQuestion(Long id, QuestionRequest request);

    void softDeleteQuestion(Long id);

    void restoreQuestion(Long id);

    void reorderQuestions(List<Long> orderedIds);
}
