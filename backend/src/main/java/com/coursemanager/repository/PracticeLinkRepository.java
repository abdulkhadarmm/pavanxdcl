package com.coursemanager.repository;

import com.coursemanager.entity.PracticeLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeLinkRepository extends JpaRepository<PracticeLink, Long> {
}
