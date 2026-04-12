package com.smartrent.repository;

import com.smartrent.domain.MeterReading;
import com.smartrent.domain.MeterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    @Query("SELECT m FROM MeterReading m WHERE m.tenant.id = :tenantId AND m.readingMonth = :month AND m.readingYear = :year AND (:roomNumber IS NULL OR m.room.roomNumber LIKE %:roomNumber%)")
    Page<MeterReading> findByTenantIdAndPeriod(
            @Param("tenantId") Long tenantId, 
            @Param("month") Integer month, 
            @Param("year") Integer year, 
            @Param("roomNumber") String roomNumber, 
            Pageable pageable);

    @Query("SELECT m FROM MeterReading m WHERE m.room.id = :roomId AND m.type = :type AND m.readingMonth = :month AND m.readingYear = :year")
    Optional<MeterReading> findByRoomAndTypeAndPeriod(
            @Param("roomId") Long roomId, 
            @Param("type") MeterType type, 
            @Param("month") Integer month, 
            @Param("year") Integer year);

    // Get previous month's reading to pre-fill the "old_index"
    @Query("SELECT m FROM MeterReading m WHERE m.room.id = :roomId AND m.type = :type ORDER BY m.readingYear DESC, m.readingMonth DESC LIMIT 1")
    Optional<MeterReading> findLatestByRoomAndType(@Param("roomId") Long roomId, @Param("type") MeterType type);
}
