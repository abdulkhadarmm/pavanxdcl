package com.coursemanager.repository;

import com.coursemanager.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByDeletedFalseOrderByDisplayOrderAsc();

    List<Course> findByDeletedTrueOrderByDisplayOrderAsc();

    @Query("SELECT COALESCE(MAX(c.displayOrder), 0) FROM Course c")
    int findMaxDisplayOrder();

    long countByDeletedFalse();
}
