package com.smartrent.service.impl;

import com.smartrent.domain.*;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.contract.ContractRequestDTO;
import com.smartrent.dto.contract.ContractResponseDTO;
import com.smartrent.exception.BusinessException;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.*;
import com.smartrent.service.ContractService;
import com.smartrent.dto.contract.LiquidationDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final ResidentRepository residentRepository;
    private final BillRepository billRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ContractResponseDTO>> getContracts(Long tenantId, String search, Pageable pageable) {
        Page<Contract> contracts = contractRepository.findByTenantId(tenantId, search != null ? search : "", pageable);
        Page<ContractResponseDTO> response = contracts.map(this::toResponseDTO);
        return ApiResponse.success(response, "Lấy danh sách hợp đồng thành công");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ContractResponseDTO> getContractById(Long id, Long tenantId) {
        Contract contract = contractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại với ID: " + id));
        return ApiResponse.success(toResponseDTO(contract), "Lấy chi tiết hợp đồng thành công");
    }

    @Override
    @Transactional
    public ApiResponse<ContractResponseDTO> createContract(Long tenantId, ContractRequestDTO request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));
        
        Room room = roomRepository.findByIdAndTenantId(request.getRoomId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));

        Resident resident = residentRepository.findByIdAndTenantId(request.getResidentId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại"));

        // Validation nghiệp vụ
        if (request.getEndDate() != null && request.getStartDate() != null && 
            request.getEndDate().isBefore(request.getStartDate().plusMonths(1))) {
            throw new BusinessException("Ngày kết thúc phải sau ngày bắt đầu tối thiểu 1 tháng");
        }
        if (request.getDepositAmount() != null && request.getDepositAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Tiền cọc không được là số âm");
        }
        if (request.getMonthlyRent() != null && request.getMonthlyRent().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Giá thuê không được là số âm");
        }

        // Generate contract number
        String contractNumber = generateContractNumber(room.getRoomNumber(), resident.getIdCard());

        Contract contract = Contract.builder()
                .tenant(tenant)
                .room(room)
                .resident(resident)
                .contractNumber(contractNumber)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyRent(request.getMonthlyRent())
                .depositAmount(request.getDepositAmount())
                .status(request.getStatus() != null ? request.getStatus() : ContractStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        // Business Logic: Auto-update room status and link resident
        if (contract.getStatus() == ContractStatus.ACTIVE) {
            room.setStatus(Room.RoomStatus.OCCUPIED);
            room.getResidents().add(resident);
            roomRepository.save(room);
        }

        contract = contractRepository.save(contract);
        log.info("Created contract {} for tenant {}", contract.getContractNumber(), tenantId);
        
        return ApiResponse.success(toResponseDTO(contract), "Tạo hợp đồng mới thành công");
    }

    @Override
    @Transactional
    public ApiResponse<ContractResponseDTO> updateContract(Long id, Long tenantId, ContractRequestDTO request) {
        Contract contract = contractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại"));

        // Validation nghiệp vụ
        if (request.getEndDate() != null && request.getStartDate() != null && 
            request.getEndDate().isBefore(request.getStartDate().plusMonths(1))) {
            throw new BusinessException("Ngày kết thúc phải sau ngày bắt đầu tối thiểu 1 tháng");
        }
        if (request.getDepositAmount() != null && request.getDepositAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Tiền cọc không được là số âm");
        }
        if (request.getMonthlyRent() != null && request.getMonthlyRent().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Giá thuê không được là số âm");
        }

        // Only allow updating basic fields in this phase
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setMonthlyRent(request.getMonthlyRent());
        contract.setDepositAmount(request.getDepositAmount());
        contract.setNotes(request.getNotes());
        
        if (request.getStatus() != null) {
            // Logic for status transition
            if (contract.getStatus() == ContractStatus.ACTIVE && request.getStatus() == ContractStatus.EXPIRED) {
                // Terminating contract logic could go here (e.g., mark room as VACANT if no other residents)
                // For now, just update status
            }
            contract.setStatus(request.getStatus());
        }

        contract = contractRepository.save(contract);
        log.info("Updated contract {}", id);
        
        return ApiResponse.success(toResponseDTO(contract), "Cập nhật hợp đồng thành công");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteContract(Long id, Long tenantId) {
        Contract contract = contractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại"));
        
        if (contract.getStatus() == ContractStatus.ACTIVE) {
            throw new BusinessException("Không thể xóa hợp đồng đang HIỆU LỰC. Vui lòng sử dụng chức năng THANH LÝ.");
        }
        
        try {
            contractRepository.delete(contract);
            contractRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new BusinessException("Không thể xóa hợp đồng này vì đã có hóa đơn hoặc lịch sử giao dịch liên kết.");
        }
        
        log.info("Deleted contract {}", id);
        return ApiResponse.success(null, "Xóa hợp đồng thành công");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LiquidationDTO> getLiquidationSummary(Long id, Long tenantId, Integer stayDays) {
        Contract contract = contractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại"));

        // 1. Tính tiền phòng lẻ ngày
        BigDecimal proRatedRent = Optional.ofNullable(stayDays)
                .filter(d -> d > 0)
                .map(d -> contract.getMonthlyRent()
                        .divide(new BigDecimal(30), 0, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal(d)))
                .orElse(BigDecimal.ZERO);

        // 2. Lấy danh sách hóa đơn chưa thanh toán cho phòng này
        List<Bill.BillStatus> unpaidStatuses = List.of(Bill.BillStatus.UNPAID, Bill.BillStatus.OVERDUE);
        List<Bill> unpaidBills = billRepository.findByTenantIdAndStatusIn(tenantId, unpaidStatuses)
                .stream()
                .filter(b -> b.getRoom() != null && b.getRoom().getId().equals(contract.getRoom().getId()))
                .collect(Collectors.toList());

        List<LiquidationDTO.BillDebts> debtList = unpaidBills.stream()
                .map(b -> LiquidationDTO.BillDebts.builder()
                        .title(b.getBillType().name() + " - " + (b.getDueDate() != null ? b.getDueDate() : "Kỳ này"))
                        .amount(b.getAmount())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalBillDebts = unpaidBills.stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDebts = totalBillDebts.add(proRatedRent);
        BigDecimal finalRefund = contract.getDepositAmount().subtract(totalDebts);

        LiquidationDTO summary = LiquidationDTO.builder()
                .contractId(contract.getId())
                .contractNumber(contract.getContractNumber())
                .roomNumber(contract.getRoom().getRoomNumber())
                .residentName(contract.getResident().getFullName())
                .depositAmount(contract.getDepositAmount())
                .unpaidBills(debtList)
                .proRatedRent(proRatedRent)
                .totalDebts(totalDebts)
                .finalRefund(finalRefund)
                .build();

        return ApiResponse.success(summary, "Lấy thông tin thanh lý thành công");
    }

    @Override
    @Transactional
    public ApiResponse<Void> liquidate(Long id, Long tenantId, LiquidationDTO.Request request) {
        Contract contract = contractRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại"));

        if (contract.getStatus() == ContractStatus.EXPIRED) {
            throw new BusinessException("Hợp đồng này đã được thanh lý trước đó");
        }

        // 1. Cập nhật trạng thái hợp đồng
        contract.setStatus(ContractStatus.EXPIRED);
        contract.setNotes(contract.getNotes() + "\n[THANH LÝ] " + LocalDateTime.now() + ": " + request.getNotes());
        contractRepository.save(contract);

        // 2. Trả phòng - Cập nhật trạng thái phòng về TRỐNG
        Room room = contract.getRoom();
        room.setStatus(Room.RoomStatus.VACANT);
        // Gỡ cư dân đại diện khỏi phòng
        room.getResidents().remove(contract.getResident());
        roomRepository.save(room);

        // 3. Đánh dấu các hóa đơn cũ là đã xử lý (tùy chọn, ở đây ta giữ nguyên để làm báo cáo)
        
        log.info("Contract {} liquidated by tenant {}. Room {} is now VACANT.", 
                contract.getContractNumber(), tenantId, room.getRoomNumber());

        return ApiResponse.success(null, "Thanh lý hợp đồng và trả phòng thành công");
    }

    private String generateContractNumber(String roomNumber, String idCard) {
        String idCardStr = (idCard != null && !idCard.trim().isEmpty()) ? idCard.trim() : "NOCCCD";
        return "HĐ-" + roomNumber + "-" + idCardStr;
    }

    private ContractResponseDTO toResponseDTO(Contract contract) {
        return ContractResponseDTO.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .tenantId(contract.getTenant().getId())
                .roomId(contract.getRoom().getId())
                .roomNumber(contract.getRoom().getRoomNumber())
                .residentId(contract.getResident().getId())
                .residentName(contract.getResident().getFullName())
                .residentPhone(contract.getResident().getPhone())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .monthlyRent(contract.getMonthlyRent())
                .depositAmount(contract.getDepositAmount())
                .status(contract.getStatus())
                .notes(contract.getNotes())
                .portalToken(contract.getPortalToken())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
