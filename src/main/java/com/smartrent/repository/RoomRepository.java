package com.smartrent.repository;

import com.smartrent.domain.Room;
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
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    Page<Room> findByTenantId(Long tenantId, Pageable pageable);

    List<Room> findByTenantId(Long tenantId);

    List<Room> findByTenantIdAndStatus(Long tenantId, Room.RoomStatus status);

    Optional<Room> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndRoomNumber(Long tenantId, String roomNumber);

    @Query("SELECT DISTINCT r.floor FROM Room r WHERE r.tenant.id = :tenantId ORDER BY r.floor")
    List<Integer> findDistinctFloorsByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT r FROM Room r WHERE r.tenant.id = :tenantId " +
           "AND (:buildingId IS NULL OR r.building.id = :buildingId) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:type IS NULL OR r.type = :type) " +
           "AND (:floor IS NULL OR r.floor = :floor) " +
           "AND (:search IS NULL OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Room> findByFilters(
        @Param("tenantId") Long tenantId,
        @Param("buildingId") Long buildingId,
        @Param("status") Room.RoomStatus status,
        @Param("type") Room.RoomType type,
        @Param("floor") Integer floor,
        @Param("search") String search,
        Pageable pageable
    );

    long countByTenantIdAndStatus(Long tenantId, Room.RoomStatus status);

    @Query("SELECT r.id FROM Room r WHERE r.building.id = :buildingId")
    List<Long> findRoomIdsByBuildingId(@Param("buildingId") Long buildingId);
}
