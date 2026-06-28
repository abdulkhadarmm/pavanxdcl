package com.coursemanager.repository;

import com.coursemanager.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findByCourseIdAndDeletedFalseOrderByDisplayOrderAsc(Long courseId);

    List<Module> findByCourseIdAndDeletedTrueOrderByDisplayOrderAsc(Long courseId);

    @Query("SELECT COALESCE(MAX(m.displayOrder), 0) FROM Module m WHERE m.course.id = :courseId")
    int findMaxDisplayOrderByCourseId(Long courseId);

    long countByDeletedFalse();
}
