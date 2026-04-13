package com.smartrent.repository;

import com.smartrent.domain.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t WHERE t.tenant.id = :tenantId AND (:status IS NULL OR t.status = :status) AND (t.title LIKE %:search% OR t.room.roomNumber LIKE %:search%)")
    Page<Ticket> findByTenantIdAndFilters(
            @Param("tenantId") Long tenantId, 
            @Param("status") Ticket.TicketStatus status, 
            @Param("search") String search, 
            Pageable pageable);

    Optional<Ticket> findByIdAndTenantId(Long id, Long tenantId);

    // List all tickets for a specific resident (Used for Portal View)
    List<Ticket> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    
    // Quick metric query for Dashboard
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tenant.id = :tenantId AND t.status = 'PENDING'")
    long countPendingTicketsByTenantId(@Param("tenantId") Long tenantId);
}
