package com.coursemanager.mapper;

import com.coursemanager.dto.request.QuestionRequest;
import com.coursemanager.dto.response.QuestionResponse;
import com.coursemanager.entity.Question;

import java.util.ArrayList;

public class QuestionMapper {

    public static QuestionResponse toResponse(Question question) {
        if (question == null) {
            return null;
        }
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setModuleId(question.getModule().getId());
        response.setQuestionText(question.getQuestionText());
        response.setOptions(new ArrayList<>(question.getOptions()));
        response.setCorrectAnswer(question.getCorrectAnswer());
        response.setExplanation(question.getExplanation());
        response.setDifficultyLevel(question.getDifficultyLevel());
        response.setTags(question.getTags());
        response.setDisplayOrder(question.getDisplayOrder());
        response.setDeleted(question.isDeleted());
        return response;
    }

    public static Question toEntity(QuestionRequest request) {
        if (request == null) {
            return null;
        }
        Question question = new Question();
        question.setQuestionText(request.getQuestionText());
        question.setOptions(new ArrayList<>());
        question.setCorrectAnswer("");
        question.setDifficultyLevel("MEDIUM");
        question.setTags("type_descriptive");
        return question;
    }

    public static void updateEntity(QuestionRequest request, Question question) {
        if (request == null || question == null) {
            return;
        }
        question.setQuestionText(request.getQuestionText());
    }
}
