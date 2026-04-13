package com.smartrent.repository;

import com.smartrent.domain.RoomFeeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomFeeUnitRepository extends JpaRepository<RoomFeeUnit, Long> {
    Optional<RoomFeeUnit> findByTenantId(Long tenantId);
}
