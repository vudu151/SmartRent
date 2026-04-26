package com.smartrent.service;

import com.smartrent.domain.Room;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.room.CreateRoomRequest;
import com.smartrent.dto.room.RoomResponse;
import com.smartrent.dto.room.UpdateRoomRequest;
import com.smartrent.exception.BusinessException;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;

/**
 * Service for Room Management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public ApiResponse<Page<RoomResponse>> getRooms(Long tenantId, String status, String type,
                                                     Integer floor, String search, Pageable pageable) {
        Room.RoomStatus roomStatus = status != null ? Room.RoomStatus.valueOf(status) : null;
        Room.RoomType roomType = type != null ? Room.RoomType.valueOf(type) : null;

        Specification<Room> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));
            if (roomStatus != null) {
                predicates.add(cb.equal(root.get("status"), roomStatus));
            }
            if (roomType != null) {
                predicates.add(cb.equal(root.get("type"), roomType));
            }
            if (floor != null) {
                predicates.add(cb.equal(root.get("floor"), floor));
            }
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("roomNumber")), "%" + search.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Room> rooms = roomRepository.findAll(spec, pageable);
        Page<RoomResponse> response = rooms.map(this::toResponse);
        return ApiResponse.success(response, "Lấy danh sách phòng thành công");
    }

    @Transactional(readOnly = true)
    public ApiResponse<RoomResponse> getRoomById(Long id, Long tenantId) {
        Room room = roomRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại với ID: " + id));
        return ApiResponse.success(toResponse(room), "Lấy thông tin phòng thành công");
    }

    @Transactional
    public ApiResponse<RoomResponse> createRoom(CreateRoomRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));

        if (roomRepository.existsByTenantIdAndRoomNumber(request.getTenantId(), request.getRoomNumber())) {
            throw new BusinessException("Số phòng đã tồn tại: " + request.getRoomNumber());
        }

        Room room = Room.builder()
            .tenant(tenant)
            .roomNumber(request.getRoomNumber())
            .floor(request.getFloor())
            .area(request.getArea())
            .type(request.getType() != null ? Room.RoomType.valueOf(request.getType()) : Room.RoomType.STANDARD)
            .status(Room.RoomStatus.VACANT)
            .description(request.getDescription())
            .price(request.getPrice())
            .build();

        room = roomRepository.save(room);
        log.info("Created room {} for tenant {}", room.getRoomNumber(), request.getTenantId());
        return ApiResponse.success(toResponse(room), "Tạo phòng thành công");
    }

    @Transactional
    public ApiResponse<RoomResponse> updateRoom(Long id, Long tenantId, UpdateRoomRequest request) {
        Room room = roomRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại với ID: " + id));

        if (request.getRoomNumber() != null && !request.getRoomNumber().equals(room.getRoomNumber())) {
            if (roomRepository.existsByTenantIdAndRoomNumber(tenantId, request.getRoomNumber())) {
                throw new BusinessException("Số phòng đã tồn tại: " + request.getRoomNumber());
            }
            room.setRoomNumber(request.getRoomNumber());
        }
        if (request.getFloor() != null) room.setFloor(request.getFloor());
        if (request.getArea() != null) room.setArea(request.getArea());
        if (request.getType() != null) room.setType(Room.RoomType.valueOf(request.getType()));
        if (request.getStatus() != null) room.setStatus(Room.RoomStatus.valueOf(request.getStatus()));
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getPrice() != null) room.setPrice(request.getPrice());

        room = roomRepository.save(room);
        log.info("Updated room {}", id);
        return ApiResponse.success(toResponse(room), "Cập nhật phòng thành công");
    }

    @Transactional
    public ApiResponse<Void> deleteRoom(Long id, Long tenantId) {
        Room room = roomRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại với ID: " + id));
            
        if (room.getStatus() != Room.RoomStatus.VACANT) {
            throw new BusinessException("Chỉ có thể xóa phòng TRỐNG. Phòng đang có người thuê hoặc bảo trì không thể xóa.");
        }
        
        try {
            roomRepository.delete(room);
            roomRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new BusinessException("Không thể xóa phòng này vì đã có lịch sử dữ liệu (Hợp đồng, Hóa đơn) liên kết với nó.");
        }
        
        log.info("Deleted room {}", id);
        return ApiResponse.success(null, "Xóa phòng thành công");
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<Integer>> getFloors(Long tenantId) {
        List<Integer> floors = roomRepository.findDistinctFloorsByTenantId(tenantId);
        return ApiResponse.success(floors, "Lấy danh sách tầng thành công");
    }

    @Transactional
    public ApiResponse<Void> batchUpdateStatus(Long tenantId, List<Long> roomIds, String status) {
        Room.RoomStatus newStatus = Room.RoomStatus.valueOf(status);
        for (Long roomId : roomIds) {
            Room room = roomRepository.findByIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại với ID: " + roomId));
            room.setStatus(newStatus);
            roomRepository.save(room);
        }
        log.info("Batch updated {} rooms to status {}", roomIds.size(), status);
        return ApiResponse.success(null, "Cập nhật trạng thái hàng loạt thành công");
    }

    private RoomResponse toResponse(Room room) {
        Set<RoomResponse.ResidentSummary> residentSummaries = null;
        int residentCount = 0;
        try {
            if (room.getResidents() != null) {
                residentSummaries = room.getResidents().stream()
                    .map(r -> RoomResponse.ResidentSummary.builder()
                        .id(r.getId())
                        .fullName(r.getFullName())
                        .phone(r.getPhone())
                        .status(r.getStatus().name())
                        .build())
                    .collect(Collectors.toSet());
                residentCount = residentSummaries.size();
            }
        } catch (Exception e) {
            // LazyInitializationException - ignore
        }

        return RoomResponse.builder()
            .id(room.getId())
            .tenantId(room.getTenant().getId())
            .roomNumber(room.getRoomNumber())
            .floor(room.getFloor())
            .area(room.getArea())
            .status(room.getStatus().name())
            .type(room.getType().name())
            .description(room.getDescription())
            .price(room.getPrice())
            .residentCount(residentCount)
            .residents(residentSummaries)
            .createdAt(room.getCreatedAt())
            .updatedAt(room.getUpdatedAt())
            .build();
    }
}
