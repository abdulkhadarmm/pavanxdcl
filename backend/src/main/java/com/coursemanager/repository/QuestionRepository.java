package com.coursemanager.repository;

import com.coursemanager.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(Long moduleId);

    List<Question> findByModuleIdAndDeletedTrueOrderByDisplayOrderAsc(Long moduleId);

    @Query("SELECT COALESCE(MAX(q.displayOrder), 0) FROM Question q WHERE q.module.id = :moduleId")
    int findMaxDisplayOrderByModuleId(Long moduleId);

    long countByDeletedFalse();
}
