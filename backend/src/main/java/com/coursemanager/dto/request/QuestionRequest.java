package com.coursemanager.dto.request;

import jakarta.validation.constraints.NotBlank;

public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
}
