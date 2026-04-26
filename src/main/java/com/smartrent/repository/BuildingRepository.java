package com.smartrent.repository;

import com.smartrent.domain.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByTenantId(Long tenantId);
    Optional<Building> findByIdAndTenantId(Long id, Long tenantId);
}
