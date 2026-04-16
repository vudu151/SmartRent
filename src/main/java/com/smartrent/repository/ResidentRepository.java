package com.smartrent.repository;

import com.smartrent.domain.Resident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long>, JpaSpecificationExecutor<Resident> {

    Page<Resident> findByTenantId(Long tenantId, Pageable pageable);

    List<Resident> findByTenantId(Long tenantId);

    Optional<Resident> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT r FROM Resident r WHERE r.tenant.id = :tenantId " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:search IS NULL OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(r.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(r.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Resident> findByFilters(
        @Param("tenantId") Long tenantId,
        @Param("status") Resident.ResidentStatus status,
        @Param("search") String search,
        Pageable pageable
    );

    long countByTenantIdAndStatus(Long tenantId, Resident.ResidentStatus status);

    Optional<Resident> findByPhone(String phone);
    
    Optional<Resident> findByEmail(String email);
}
