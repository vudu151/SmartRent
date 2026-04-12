package com.smartrent.service;

import com.smartrent.domain.Resident;
import com.smartrent.domain.Room;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.resident.CreateResidentRequest;
import com.smartrent.dto.resident.ResidentResponse;
import com.smartrent.dto.resident.UpdateResidentRequest;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.ResidentRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;

/**
 * Service for Resident Management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public ApiResponse<Page<ResidentResponse>> getResidents(Long tenantId, String status,
                                                             String search, Pageable pageable) {
        Resident.ResidentStatus residentStatus = status != null ? Resident.ResidentStatus.valueOf(status) : null;
        
        Specification<Resident> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));
            if (residentStatus != null) {
                predicates.add(cb.equal(root.get("status"), residentStatus));
            }
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate fullNameLike = cb.like(cb.lower(root.get("fullName")), searchLower);
                Predicate emailLike = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate phoneLike = cb.like(cb.lower(root.get("phone")), searchLower);
                predicates.add(cb.or(fullNameLike, emailLike, phoneLike));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Resident> residents = residentRepository.findAll(spec, pageable);
        Page<ResidentResponse> response = residents.map(this::toResponse);
        return ApiResponse.success(response, "Lấy danh sách cư dân thành công");
    }

    @Transactional(readOnly = true)
    public ApiResponse<ResidentResponse> getResidentById(Long id, Long tenantId) {
        Resident resident = residentRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại với ID: " + id));
        return ApiResponse.success(toResponse(resident), "Lấy thông tin cư dân thành công");
    }

    @Transactional
    public ApiResponse<ResidentResponse> createResident(CreateResidentRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));

        Resident resident = Resident.builder()
            .tenant(tenant)
            .fullName(request.getFullName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .idCard(request.getIdCard())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender())
            .notes(request.getNotes())
            .status(Resident.ResidentStatus.ACTIVE)
            .build();

        resident = residentRepository.save(resident);

        // Link rooms if provided
        if (request.getRoomIds() != null && !request.getRoomIds().isEmpty()) {
            linkResidentToRooms(resident, request.getRoomIds(), request.getTenantId());
        }

        log.info("Created resident {} for tenant {}", resident.getFullName(), request.getTenantId());
        return ApiResponse.success(toResponse(resident), "Tạo cư dân thành công");
    }

    @Transactional
    public ApiResponse<ResidentResponse> updateResident(Long id, Long tenantId, UpdateResidentRequest request) {
        Resident resident = residentRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại với ID: " + id));

        if (request.getFullName() != null) resident.setFullName(request.getFullName());
        if (request.getEmail() != null) resident.setEmail(request.getEmail());
        if (request.getPhone() != null) resident.setPhone(request.getPhone());
        if (request.getIdCard() != null) resident.setIdCard(request.getIdCard());
        if (request.getDateOfBirth() != null) resident.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) resident.setGender(request.getGender());
        if (request.getStatus() != null) resident.setStatus(Resident.ResidentStatus.valueOf(request.getStatus()));
        if (request.getNotes() != null) resident.setNotes(request.getNotes());

        // Update room links if provided
        if (request.getRoomIds() != null) {
            // Remove from all current rooms
            for (Room room : new HashSet<>(resident.getRooms())) {
                room.getResidents().remove(resident);
                roomRepository.save(room);
            }
            resident.getRooms().clear();
            // Add to new rooms
            if (!request.getRoomIds().isEmpty()) {
                linkResidentToRooms(resident, request.getRoomIds(), tenantId);
            }
        }

        resident = residentRepository.save(resident);
        log.info("Updated resident {}", id);
        return ApiResponse.success(toResponse(resident), "Cập nhật cư dân thành công");
    }

    @Transactional
    public ApiResponse<Void> deleteResident(Long id, Long tenantId) {
        Resident resident = residentRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại với ID: " + id));

        // Remove from rooms first
        for (Room room : new HashSet<>(resident.getRooms())) {
            room.getResidents().remove(resident);
            roomRepository.save(room);
        }

        residentRepository.delete(resident);
        log.info("Deleted resident {}", id);
        return ApiResponse.success(null, "Xóa cư dân thành công");
    }

    private void linkResidentToRooms(Resident resident, Set<Long> roomIds, Long tenantId) {
        for (Long roomId : roomIds) {
            Room room = roomRepository.findByIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại với ID: " + roomId));
            room.getResidents().add(resident);
            if (room.getStatus() == Room.RoomStatus.VACANT) {
                room.setStatus(Room.RoomStatus.OCCUPIED);
            }
            roomRepository.save(room);
        }
    }

    private ResidentResponse toResponse(Resident resident) {
        Set<ResidentResponse.RoomSummary> roomSummaries = null;
        try {
            if (resident.getRooms() != null) {
                roomSummaries = resident.getRooms().stream()
                    .map(r -> ResidentResponse.RoomSummary.builder()
                        .id(r.getId())
                        .roomNumber(r.getRoomNumber())
                        .floor(r.getFloor())
                        .status(r.getStatus().name())
                        .build())
                    .collect(Collectors.toSet());
            }
        } catch (Exception e) {
            // LazyInitializationException
        }

        return ResidentResponse.builder()
            .id(resident.getId())
            .tenantId(resident.getTenant().getId())
            .fullName(resident.getFullName())
            .email(resident.getEmail())
            .phone(resident.getPhone())
            .idCard(resident.getIdCard())
            .dateOfBirth(resident.getDateOfBirth())
            .gender(resident.getGender())
            .status(resident.getStatus().name())
            .notes(resident.getNotes())
            .rooms(roomSummaries)
            .createdAt(resident.getCreatedAt())
            .updatedAt(resident.getUpdatedAt())
            .build();
    }
}
