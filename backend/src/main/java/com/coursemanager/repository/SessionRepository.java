package com.coursemanager.repository;

import com.coursemanager.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(Long moduleId);

    List<Session> findByModuleIdAndDeletedTrueOrderByDisplayOrderAsc(Long moduleId);

    @Query("SELECT COALESCE(MAX(s.displayOrder), 0) FROM Session s WHERE s.module.id = :moduleId")
    int findMaxDisplayOrderByModuleId(Long moduleId);
}
