package com.smartrent.repository;

import com.smartrent.domain.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

/**
 * Repository for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find user by username or email with roles and permissions loaded
     */
    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    /**
     * Find user by ID with roles and permissions loaded
     */
    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    @Override
    Optional<User> findById(Long id);

    /**
     * Find users by tenant ID
     */
    @Query("SELECT u FROM User u WHERE u.tenant.id = :tenantId")
    java.util.List<User> findByTenantId(@Param("tenantId") Long tenantId);

    /**
     * Find users by tenant ID (paginated)
     */
    @Query("SELECT u FROM User u WHERE u.tenant.id = :tenantId")
    Page<User> findByTenantId(@Param("tenantId") Long tenantId, Pageable pageable);
}
