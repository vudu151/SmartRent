package com.smartrent.repository;

import com.smartrent.domain.Vehicle;
import com.smartrent.domain.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Page<Vehicle> findByBuildingId(Long buildingId, Pageable pageable);

    List<Vehicle> findByResidentId(Long residentId);

    boolean existsByLicensePlateAndBuildingId(String licensePlate, Long buildingId);

    boolean existsByLicensePlateAndBuildingIdAndIdNot(String licensePlate, Long buildingId, Long id);

    @Query(value = "SELECT DISTINCT v FROM Vehicle v " +
           "LEFT JOIN FETCH v.resident r " +
           "LEFT JOIN FETCH r.rooms rm " +
           "WHERE v.building.id = :buildingId " +
           "AND (:#{#vehicleType == null} = true OR v.vehicleType = :vehicleType) " +
           "AND (:#{#roomId == null} = true OR rm.id = :roomId) " +
           "AND (LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(COALESCE(v.brand, '')) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(v.resident.fullName) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(DISTINCT v.id) FROM Vehicle v " +
           "LEFT JOIN v.resident r " +
           "LEFT JOIN r.rooms rm " +
           "WHERE v.building.id = :buildingId " +
           "AND (:#{#vehicleType == null} = true OR v.vehicleType = :vehicleType) " +
           "AND (:#{#roomId == null} = true OR rm.id = :roomId) " +
           "AND (LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(COALESCE(v.brand, '')) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(v.resident.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vehicle> findByFilters(
        @Param("buildingId") Long buildingId,
        @Param("vehicleType") VehicleType vehicleType,
        @Param("roomId") Long roomId,
        @Param("search") String search,
        Pageable pageable
    );

    long countByBuildingId(Long buildingId);

    long countByBuildingIdAndVehicleType(Long buildingId, VehicleType vehicleType);
}
