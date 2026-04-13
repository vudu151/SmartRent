package com.smartrent.repository;

import com.smartrent.domain.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query("SELECT c FROM Contract c WHERE c.tenant.id = :tenantId AND (c.contractNumber LIKE %:search% OR c.resident.fullName LIKE %:search% OR c.room.roomNumber LIKE %:search%)")
    Page<Contract> findByTenantId(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Contract c WHERE c.room.id = :roomId AND c.status = 'ACTIVE'")
    Optional<Contract> findActiveContractByRoom(@Param("roomId") Long roomId);

    Optional<Contract> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.tenant.id = :tenantId")
    long countByTenantId(@Param("tenantId") Long tenantId);

    Optional<Contract> findByPortalToken(String portalToken);
}
