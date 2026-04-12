package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Room;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.bill.BillResponse;
import com.smartrent.dto.bill.CreateBillRequest;
import com.smartrent.dto.bill.UpdateBillRequest;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.RoomFeeUnitRepository;
import com.smartrent.domain.RoomFeeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final RoomFeeUnitRepository roomFeeUnitRepository;

    @Transactional(readOnly = true)
    public ApiResponse<Page<BillResponse>> getBills(Long tenantId, String status, String billType,
                                                     String roomNumber, Pageable pageable) {
        Bill.BillStatus billStatus = status != null ? Bill.BillStatus.valueOf(status) : null;
        Bill.BillType type = billType != null ? Bill.BillType.valueOf(billType) : null;
        
        Specification<Bill> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));
            if (billStatus != null) {
                predicates.add(cb.equal(root.get("status"), billStatus));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("billType"), type));
            }
            if (roomNumber != null && !roomNumber.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("roomNumber")), "%" + roomNumber.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Bill> bills = billRepository.findAll(spec, pageable);
        Page<BillResponse> response = bills.map(this::toResponse);
        return ApiResponse.success(response, "Lấy danh sách hóa đơn thành công");
    }

    @Transactional(readOnly = true)
    public ApiResponse<BillResponse> getBillById(Long id, Long tenantId) {
        Bill bill = billRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với ID: " + id));
        return ApiResponse.success(toResponse(bill), "Lấy thông tin hóa đơn thành công");
    }

    @Transactional
    public ApiResponse<BillResponse> createBill(CreateBillRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));

        Bill.BillBuilder billBuilder = Bill.builder()
            .tenant(tenant)
            .billType(Bill.BillType.valueOf(request.getBillType()))
            .amount(request.getAmount())
            .description(request.getDescription())
            .dueDate(request.getDueDate())
            .status(Bill.BillStatus.UNPAID);

        if (request.getRoomId() != null) {
            Room room = roomRepository.findByIdAndTenantId(request.getRoomId(), request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));
            billBuilder.room(room).roomNumber(room.getRoomNumber());
        } else if (request.getRoomNumber() != null) {
            billBuilder.roomNumber(request.getRoomNumber());
        }

        Bill bill = billRepository.save(billBuilder.build());
        log.info("Created bill {} for tenant {}", bill.getId(), request.getTenantId());
        return ApiResponse.success(toResponse(bill), "Tạo hóa đơn thành công");
    }

    @Transactional
    public ApiResponse<BillResponse> updateBill(Long id, Long tenantId, UpdateBillRequest request) {
        Bill bill = billRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với ID: " + id));

        if (request.getBillType() != null) bill.setBillType(Bill.BillType.valueOf(request.getBillType()));
        if (request.getAmount() != null) bill.setAmount(request.getAmount());
        if (request.getDescription() != null) bill.setDescription(request.getDescription());
        if (request.getDueDate() != null) bill.setDueDate(request.getDueDate());
        if (request.getStatus() != null) bill.setStatus(Bill.BillStatus.valueOf(request.getStatus()));
        if (request.getPaymentReference() != null) bill.setPaymentReference(request.getPaymentReference());

        bill = billRepository.save(bill);
        log.info("Updated bill {}", id);
        return ApiResponse.success(toResponse(bill), "Cập nhật hóa đơn thành công");
    }

    @Transactional
    public ApiResponse<Void> deleteBill(Long id, Long tenantId) {
        Bill bill = billRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với ID: " + id));
        billRepository.delete(bill);
        log.info("Deleted bill {}", id);
        return ApiResponse.success(null, "Xóa hóa đơn thành công");
    }

    @Transactional
    public ApiResponse<BillResponse> markAsPaid(Long id, Long tenantId, String paymentReference) {
        Bill bill = billRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với ID: " + id));
        bill.setStatus(Bill.BillStatus.PAID);
        bill.setPaymentDate(LocalDateTime.now());
        bill.setPaymentReference(paymentReference);
        bill = billRepository.save(bill);
        log.info("Marked bill {} as paid", id);
        return ApiResponse.success(toResponse(bill), "Đánh dấu đã thanh toán thành công");
    }

    @Transactional
    public ApiResponse<Void> generateBatchMeterBills(Long tenantId, com.smartrent.dto.bill.MeterReadingRequestDTO.BatchRequest payload) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Tenant"));
                
        RoomFeeUnit feeUnit = roomFeeUnitRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Vui lòng thiết lập Đơn giá Dịch vụ trước khi Chốt số điện nước!"));

        List<Bill> finalBills = new ArrayList<>();
        java.time.LocalDate dueDate = java.time.LocalDate.now().plusDays(5); // Default due date 5 days ahead
        
        for (com.smartrent.dto.bill.MeterReadingRequestDTO.ReadingItem item : payload.getReadings()) {
            Room room = roomRepository.findByIdAndTenantId(item.getRoomId(), tenantId).orElse(null);
            if(room == null) continue;
            
            // Electricity Bill Formatter
            if(item.getOldElectricity() != null && item.getNewElectricity() != null && item.getNewElectricity() >= item.getOldElectricity()) {
                int consumed = item.getNewElectricity() - item.getOldElectricity();
                java.math.BigDecimal amount = feeUnit.getElectricityPerUnit().multiply(java.math.BigDecimal.valueOf(consumed));
                
                Bill elecBill = Bill.builder()
                        .tenant(tenant)
                        .room(room)
                        .roomNumber(room.getRoomNumber())
                        .billType(Bill.BillType.ELECTRICITY)
                        .amount(amount)
                        .dueDate(dueDate)
                        .status(Bill.BillStatus.UNPAID)
                        .description(String.format("Tiêu thụ điện: %d kWh (Từ %d -> %d). Giá mức: %s đ/kWh", consumed, item.getOldElectricity(), item.getNewElectricity(), feeUnit.getElectricityPerUnit().longValue()))
                        .build();
                finalBills.add(elecBill);
            }
            
            // Water Bill Formatter
            if(item.getOldWater() != null && item.getNewWater() != null && item.getNewWater() >= item.getOldWater()) {
                int consumed = item.getNewWater() - item.getOldWater();
                java.math.BigDecimal amount = feeUnit.getWaterPerUnit().multiply(java.math.BigDecimal.valueOf(consumed));
                
                Bill waterBill = Bill.builder()
                        .tenant(tenant)
                        .room(room)
                        .roomNumber(room.getRoomNumber())
                        .billType(Bill.BillType.WATER)
                        .amount(amount)
                        .dueDate(dueDate)
                        .status(Bill.BillStatus.UNPAID)
                        .description(String.format("Tiêu thụ nước: %d khối (Từ %d -> %d). Giá mức: %s đ/khối", consumed, item.getOldWater(), item.getNewWater(), feeUnit.getWaterPerUnit().longValue()))
                        .build();
                finalBills.add(waterBill);
            }
        }
        
        if(!finalBills.isEmpty()) {
            billRepository.saveAll(finalBills);
            log.info("Batch created {} meter bills for tenant {}", finalBills.size(), tenantId);
        }
        
        return ApiResponse.success(null, "Đã chốt xong toàn bộ " + finalBills.size() + " hóa đơn điện/nước hàng loạt.");
    }

    private BillResponse toResponse(Bill bill) {
        return BillResponse.builder()
            .id(bill.getId())
            .tenantId(bill.getTenant().getId())
            .roomId(bill.getRoom() != null ? bill.getRoom().getId() : null)
            .roomNumber(bill.getRoomNumber())
            .billType(bill.getBillType().name())
            .amount(bill.getAmount())
            .description(bill.getDescription())
            .dueDate(bill.getDueDate())
            .status(bill.getStatus().name())
            .paymentDate(bill.getPaymentDate())
            .paymentReference(bill.getPaymentReference())
            .createdAt(bill.getCreatedAt())
            .updatedAt(bill.getUpdatedAt())
            .build();
    }
}
