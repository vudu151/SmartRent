package com.smartrent.repository;

import com.smartrent.domain.RoomAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAssetRepository extends JpaRepository<RoomAsset, Long> {
    List<RoomAsset> findByRoomIdAndTenantId(Long roomId, Long tenantId);
    Optional<RoomAsset> findByIdAndTenantId(Long id, Long tenantId);
}
