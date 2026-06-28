package com.coursemanager.dto.response;

import java.util.List;

public class DashboardStatsResponse {
    private long courses;
    private long modules;
    private long sessions;
    private long questions;
    private long resources;
    private List<SessionResponse> recentSessions;

    public long getCourses() {
        return courses;
    }

    public void setCourses(long courses) {
        this.courses = courses;
    }

    public long getModules() {
        return modules;
    }

    public void setModules(long modules) {
        this.modules = modules;
    }

    public long getSessions() {
        return sessions;
    }

    public void setSessions(long sessions) {
        this.sessions = sessions;
    }

    public long getQuestions() {
        return questions;
    }

    public void setQuestions(long questions) {
        this.questions = questions;
    }

    public long getResources() {
        return resources;
    }

    public void setResources(long resources) {
        this.resources = resources;
    }

    public List<SessionResponse> getRecentSessions() {
        return recentSessions;
    }

    public void setRecentSessions(List<SessionResponse> recentSessions) {
        this.recentSessions = recentSessions;
    }
}
