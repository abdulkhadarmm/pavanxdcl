package com.coursemanager.dto.response;

import java.util.List;

public class ModuleSyllabusResponse {
    private Long id;
    private String name;
    private String description;
    private int displayOrder;
    private List<SessionResponse> sessions;
    private List<QuestionResponse> questions;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<SessionResponse> getSessions() {
        return sessions;
    }

    public void setSessions(List<SessionResponse> sessions) {
        this.sessions = sessions;
    }

    public List<QuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResponse> questions) {
        this.questions = questions;
    }
}
