package com.smartrent.repository;

import com.smartrent.domain.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long>, JpaSpecificationExecutor<Bill> {

    Page<Bill> findByTenantId(Long tenantId, Pageable pageable);

    Optional<Bill> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT b FROM Bill b WHERE b.tenant.id = :tenantId " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:billType IS NULL OR b.billType = :billType) " +
           "AND (:roomNumber IS NULL OR LOWER(b.roomNumber) LIKE LOWER(CONCAT('%', :roomNumber, '%')))")
    Page<Bill> findByFilters(
        @Param("tenantId") Long tenantId,
        @Param("status") Bill.BillStatus status,
        @Param("billType") Bill.BillType billType,
        @Param("roomNumber") String roomNumber,
        Pageable pageable
    );

    long countByTenantIdAndStatus(Long tenantId, Bill.BillStatus status);

    @Query("SELECT b FROM Bill b WHERE b.tenant.id = :tenantId AND b.dueDate >= :startDate AND b.dueDate <= :endDate")
    java.util.List<Bill> findByTenantIdAndDateRange(@Param("tenantId") Long tenantId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    java.util.List<Bill> findTop10ByTenantIdAndStatusOrderByPaymentDateDesc(Long tenantId, Bill.BillStatus status);

    java.util.List<Bill> findByTenantIdAndStatusIn(Long tenantId, java.util.List<Bill.BillStatus> statuses);

    java.util.List<Bill> findByRoomIdOrderByCreatedAtDesc(Long roomId);
}
