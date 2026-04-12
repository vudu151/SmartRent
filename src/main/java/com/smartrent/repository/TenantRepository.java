package com.smartrent.repository;

import com.smartrent.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Tenant entity
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long>, JpaSpecificationExecutor<Tenant> {

    /**
     * Find tenant by email
     */
    Optional<Tenant> findByEmail(String email);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
}
