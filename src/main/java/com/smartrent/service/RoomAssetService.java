package com.smartrent.service;

import com.smartrent.domain.Room;
import com.smartrent.domain.RoomAsset;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.asset.RoomAssetDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.RoomAssetRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomAssetService {

    private final RoomAssetRepository roomAssetRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<RoomAssetDTO.Response>> getAssetsByRoom(Long roomId, Long tenantId) {
        List<RoomAsset> assets = roomAssetRepository.findByRoomIdAndTenantId(roomId, tenantId);
        List<RoomAssetDTO.Response> responseList = assets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(responseList, "Lấy danh sách tài sản thành công");
    }

    @Transactional
    public ApiResponse<RoomAssetDTO.Response> createAsset(Long tenantId, RoomAssetDTO.Request request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));

        Room room = roomRepository.findByIdAndTenantId(request.getRoomId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));

        RoomAsset asset = RoomAsset.builder()
                .tenant(tenant)
                .room(room)
                .name(request.getName())
                .quantity(request.getQuantity())
                .condition(request.getCondition())
                .compensationValue(request.getCompensationValue())
                .description(request.getDescription())
                .build();

        asset = roomAssetRepository.save(asset);
        log.info("Asset '{}' created for room {}/tenant {}", asset.getName(), room.getId(), tenantId);
        return ApiResponse.success(mapToResponse(asset), "Thêm tài sản mới thành công");
    }

    @Transactional
    public ApiResponse<RoomAssetDTO.Response> updateAsset(Long id, Long tenantId, RoomAssetDTO.Request request) {
        RoomAsset asset = roomAssetRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản không tồn tại"));

        asset.setName(request.getName());
        asset.setQuantity(request.getQuantity());
        asset.setCondition(request.getCondition());
        asset.setCompensationValue(request.getCompensationValue());
        asset.setDescription(request.getDescription());

        asset = roomAssetRepository.save(asset);
        log.info("Asset {} updated for tenant {}", id, tenantId);
        return ApiResponse.success(mapToResponse(asset), "Cập nhật tài sản thành công");
    }

    @Transactional
    public ApiResponse<Void> deleteAsset(Long id, Long tenantId) {
        RoomAsset asset = roomAssetRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản không tồn tại"));

        roomAssetRepository.delete(asset);
        log.info("Asset {} deleted by tenant {}", id, tenantId);
        return ApiResponse.success(null, "Xóa tài sản thành công");
    }

    private RoomAssetDTO.Response mapToResponse(RoomAsset asset) {
        return RoomAssetDTO.Response.builder()
                .id(asset.getId())
                .roomId(asset.getRoom().getId())
                .roomNumber(asset.getRoom().getRoomNumber())
                .name(asset.getName())
                .quantity(asset.getQuantity())
                .condition(asset.getCondition())
                .compensationValue(asset.getCompensationValue())
                .description(asset.getDescription())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
}
