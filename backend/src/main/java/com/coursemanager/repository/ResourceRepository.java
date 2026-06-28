package com.coursemanager.repository;

import com.coursemanager.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Query("SELECT COUNT(r) FROM Resource r WHERE r.session.deleted = false")
    long countActiveResources();
}
