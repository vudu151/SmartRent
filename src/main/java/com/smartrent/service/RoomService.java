package com.smartrent.service;

import com.smartrent.domain.*;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.room.CreateRoomRequest;
import com.smartrent.dto.room.RoomInvoiceDTO;
import com.smartrent.dto.room.RoomResponse;
import com.smartrent.dto.room.UpdateRoomRequest;
import com.smartrent.exception.BusinessException;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.ContractRepository;
import com.smartrent.repository.MeterReadingRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.TicketRepository;
import com.smartrent.dto.room.TimelineEventDTO;
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
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final TicketRepository ticketRepository;

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
            .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new java.util.ArrayList<>())
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
        if (request.getImageUrls() != null) {
            room.setImageUrls(request.getImageUrls());
        }

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
            .imageUrls(room.getImageUrls() != null ? room.getImageUrls() : new java.util.ArrayList<>())
            .createdAt(room.getCreatedAt())
            .updatedAt(room.getUpdatedAt())
            .build();
    }

    @Transactional(readOnly = true)
    public ApiResponse<RoomInvoiceDTO> getRoomInvoice(Long roomId, Long tenantId, Integer month, Integer year) {
        Room room = roomRepository.findByIdAndTenantId(roomId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Ph\u00f2ng kh\u00f4ng t\u1ed3n t\u1ea1i v\u1edbi ID: " + roomId));

        Tenant tenant = room.getTenant();
        Building building = room.getBuilding();

        // L\u1ea5y h\u1ee3p \u0111\u1ed3ng \u0111ang hi\u1ec7u l\u1ef1c
        var activeContract = contractRepository.findActiveContractByRoom(roomId);
        java.math.BigDecimal monthlyRent = activeContract.map(Contract::getMonthlyRent).orElse(room.getPrice());

        // L\u1ea5y c\u01b0 d\u00e2n t\u1eeb h\u1ee3p \u0111\u1ed3ng ho\u1eb7c t\u1eeb ph\u00f2ng
        String residentName = activeContract.map(c -> c.getResident().getFullName()).orElse(null);
        String residentPhone = activeContract.map(c -> c.getResident().getPhone()).orElse(null);
        if (residentName == null && room.getResidents() != null && !room.getResidents().isEmpty()) {
            Resident firstResident = room.getResidents().iterator().next();
            residentName = firstResident.getFullName();
            residentPhone = firstResident.getPhone();
        }

        // L\u1ea5y ch\u1ec9 s\u1ed1 \u0111i\u1ec7n
        var electricReading = meterReadingRepository.findByRoomAndTypeAndPeriod(roomId, MeterType.ELECTRICITY, month, year);
        java.math.BigDecimal elecOld = electricReading.map(MeterReading::getOldIndex).orElse(java.math.BigDecimal.ZERO);
        java.math.BigDecimal elecNew = electricReading.map(MeterReading::getNewIndex).orElse(java.math.BigDecimal.ZERO);
        java.math.BigDecimal elecUsage = elecNew.subtract(elecOld);
        java.math.BigDecimal elecPrice = building != null ? building.getElectricityPrice() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal elecAmount = elecUsage.multiply(elecPrice);

        // L\u1ea5y ch\u1ec9 s\u1ed1 n\u01b0\u1edbc
        var waterReading = meterReadingRepository.findByRoomAndTypeAndPeriod(roomId, MeterType.WATER, month, year);
        java.math.BigDecimal waterOld = waterReading.map(MeterReading::getOldIndex).orElse(java.math.BigDecimal.ZERO);
        java.math.BigDecimal waterNew = waterReading.map(MeterReading::getNewIndex).orElse(java.math.BigDecimal.ZERO);
        java.math.BigDecimal waterUsage = waterNew.subtract(waterOld);
        java.math.BigDecimal waterPrice = building != null ? building.getWaterPrice() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal waterAmount = waterUsage.multiply(waterPrice);

        // Ph\u00ed d\u1ecbch v\u1ee5
        java.math.BigDecimal serviceAmount = building != null ? building.getServicePrice() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal internetAmount = building != null ? building.getInternetPrice() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal parkingAmount = building != null ? building.getParkingPrice() : java.math.BigDecimal.ZERO;

        // T\u1ed5ng c\u1ed9ng
        java.math.BigDecimal totalAmount = monthlyRent
            .add(elecAmount)
            .add(waterAmount)
            .add(serviceAmount)
            .add(internetAmount)
            .add(parkingAmount);

        // Ng\u00e0y l\u1eadp phi\u1ebfu
        java.time.LocalDate invoiceDate = java.time.LocalDate.of(year, month, 1);
        java.time.LocalDate dueDate = invoiceDate.plusMonths(1).withDayOfMonth(15);

        RoomInvoiceDTO dto = RoomInvoiceDTO.builder()
            .buildingName(building != null ? building.getName() : "")
            .buildingAddress(building != null ? building.getAddress() : "")
            .tenantPhone(tenant.getPhone())
            .tenantName(tenant.getName())
            .bankName(tenant.getBankName())
            .bankAccount(tenant.getBankAccount())
            .bankOwner(tenant.getBankOwner())
            .bankQrUrl(tenant.getBankQrUrl())
            .roomNumber(room.getRoomNumber())
            .residentName(residentName != null ? residentName : "Ch\u01b0a c\u00f3 c\u01b0 d\u00e2n")
            .residentPhone(residentPhone != null ? residentPhone : "")
            .month(month)
            .year(year)
            .monthlyRent(monthlyRent)
            .electricOldIndex(elecOld)
            .electricNewIndex(elecNew)
            .electricUsage(elecUsage)
            .electricUnitPrice(elecPrice)
            .electricAmount(elecAmount)
            .waterOldIndex(waterOld)
            .waterNewIndex(waterNew)
            .waterUsage(waterUsage)
            .waterUnitPrice(waterPrice)
            .waterAmount(waterAmount)
            .serviceAmount(serviceAmount)
            .internetAmount(internetAmount)
            .parkingAmount(parkingAmount)
            .totalAmount(totalAmount)
            .invoiceDate(invoiceDate.toString())
            .dueDate(dueDate.toString())
            .build();

        return ApiResponse.success(dto, "L\u1ea5y d\u1eef li\u1ec7u phi\u1ebfu in th\u00e0nh c\u00f4ng");
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<TimelineEventDTO>> getRoomTimeline(Long roomId, Long tenantId) {
        Room room = roomRepository.findByIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        List<TimelineEventDTO> events = new ArrayList<>();

        // Add residents events
        for (Resident r : room.getResidents()) {
            events.add(TimelineEventDTO.builder()
                    .id("resident-" + r.getId())
                    .type("RESIDENT")
                    .title("Thêm cư dân: " + r.getFullName())
                    .description("SĐT: " + (r.getPhone() != null ? r.getPhone() : "N/A"))
                    .timestamp(r.getCreatedAt() != null ? r.getCreatedAt() : room.getCreatedAt())
                    .status(r.getStatus().name())
                    .color("green")
                    .build());
        }

        // Add contract events
        List<Contract> contracts = contractRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        for (Contract c : contracts) {
            events.add(TimelineEventDTO.builder()
                    .id("contract-" + c.getId())
                    .type("CONTRACT")
                    .title("Hợp đồng thuê: " + c.getContractNumber())
                    .description("Từ: " + c.getStartDate() + " đến " + c.getEndDate())
                    .timestamp(c.getCreatedAt() != null ? c.getCreatedAt() : room.getCreatedAt())
                    .status(c.getStatus().name())
                    .color("blue")
                    .build());
        }

        // Add bill events
        List<Bill> bills = billRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        for (Bill b : bills) {
            String type = b.getBillType() == Bill.BillType.RENT ? "Tiền phòng" :
                          b.getBillType() == Bill.BillType.ELECTRICITY ? "Tiền điện" :
                          b.getBillType() == Bill.BillType.WATER ? "Tiền nước" :
                          b.getBillType() == Bill.BillType.SERVICE ? "Dịch vụ" : b.getBillType().name();
            events.add(TimelineEventDTO.builder()
                    .id("bill-" + b.getId())
                    .type("BILL")
                    .title("Hóa đơn " + type)
                    .description("Số tiền: " + b.getAmount() + " đ - " + (b.getStatus() == Bill.BillStatus.PAID ? "Đã thanh toán" : "Chưa thanh toán"))
                    .timestamp(b.getCreatedAt() != null ? b.getCreatedAt() : (b.getDueDate() != null ? b.getDueDate().atStartOfDay() : room.getCreatedAt()))
                    .status(b.getStatus().name())
                    .color(b.getStatus() == Bill.BillStatus.PAID ? "green" : "red")
                    .build());
        }

        // Add ticket events
        List<Ticket> tickets = ticketRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        for (Ticket t : tickets) {
            events.add(TimelineEventDTO.builder()
                    .id("ticket-" + t.getId())
                    .type("TICKET")
                    .title("Báo cáo: " + t.getTitle())
                    .description(t.getDescription())
                    .timestamp(t.getCreatedAt())
                    .status(t.getStatus().name())
                    .color(t.getStatus() == Ticket.TicketStatus.RESOLVED ? "green" : "orange")
                    .build());
        }

        // Sort by timestamp descending
        events.sort((e1, e2) -> {
            if (e1.getTimestamp() == null && e2.getTimestamp() == null) return 0;
            if (e1.getTimestamp() == null) return 1;
            if (e2.getTimestamp() == null) return -1;
            return e2.getTimestamp().compareTo(e1.getTimestamp());
        });

        return ApiResponse.success(events, "Fetched room timeline successfully");
    }
}
