package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Contract;
import com.smartrent.domain.Resident;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.portal.PortalDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.ContractRepository;
import com.smartrent.repository.TicketRepository;
import com.smartrent.repository.RoomAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortalService {

    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final NotificationService notificationService;
    private final TicketRepository ticketRepository;
    private final RoomAssetRepository roomAssetRepository;

    @Transactional(readOnly = true)
    public ApiResponse<PortalDTO> getPortalInfo(String portalToken) {
        Contract contract = contractRepository.findByPortalToken(portalToken)
                .orElseThrow(() -> new ResourceNotFoundException("Đường dẫn không hợp lệ hoặc đã hết hạn"));

        Tenant tenant = contract.getTenant();
        Resident resident = contract.getResident();

        // Get unpaid & overdue bills for this tenant & room
        // Proper way: Find bills by room AND status UNPAID/OVERDUE
        // Here we just fetch tenant bills and filter by room (Simpler for demo scope)
        List<Bill.BillStatus> statuses = List.of(Bill.BillStatus.UNPAID, Bill.BillStatus.OVERDUE);
        List<Bill> tenantBills = billRepository.findByTenantIdAndStatusIn(tenant.getId(), statuses);
        
        List<Bill> roomBills = tenantBills.stream()
                .filter(b -> b.getRoom() != null && b.getRoom().getId().equals(contract.getRoom().getId()))
                .collect(Collectors.toList());

        BigDecimal totalUnpaid = roomBills.stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PortalDTO.BillInfo> billInfos = roomBills.stream()
                .map(b -> PortalDTO.BillInfo.builder()
                        .billId(b.getId())
                        .billType(b.getBillType().name())
                        .title(b.getBillType() == Bill.BillType.OTHER ? "Hóa đơn dịch vụ tổng hợp" : "Hóa đơn " + b.getBillType())
                        .amount(b.getAmount())
                        .dueDate(b.getDueDate())
                        .description(b.getDescription())
                        .build())
                .collect(Collectors.toList());

        PortalDTO dto = PortalDTO.builder()
                .roomNumber(contract.getRoom().getRoomNumber())
                .resident(PortalDTO.ResidentInfo.builder()
                        .fullName(resident.getFullName())
                        .phone(resident.getPhone())
                        .build())
                .contract(PortalDTO.ContractInfo.builder()
                        .contractNumber(contract.getContractNumber())
                        .startDate(contract.getStartDate())
                        .endDate(contract.getEndDate())
                        .monthlyRent(contract.getMonthlyRent())
                        .build())
                .bankInfo(PortalDTO.BankInfo.builder()
                        .bankName(tenant.getBankName())
                        .bankAccount(tenant.getBankAccount())
                        .bankOwner(tenant.getBankOwner())
                        .build())
                .unpaidBills(billInfos)
                .totalUnpaidAmount(totalUnpaid)
                .build();

        return ApiResponse.success(dto, "Lấy dữ liệu Portal thành công");
    }

    @Transactional
    public ApiResponse<Void> notifyPayment(String portalToken) {
        Contract contract = contractRepository.findByPortalToken(portalToken)
                .orElseThrow(() -> new ResourceNotFoundException("Đường dẫn không hợp lệ"));

        log.info("Resident in room {} has reported payment completion via Portal.", contract.getRoom().getRoomNumber());
        
        return ApiResponse.success(null, "Đã thông báo thanh toán đến chủ phòng");
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<com.smartrent.dto.ticket.TicketDTO.Response>> getPortalTickets(String portalToken) {
        Contract contract = contractRepository.findByPortalToken(portalToken)
                .orElseThrow(() -> new ResourceNotFoundException("Đường dẫn không hợp lệ"));
        
        // Find tickets associated with this resident
        // To be meticulous, we could filter by room. We'll fetch by resident ID for now.
        List<com.smartrent.domain.Ticket> tickets = ticketRepository.findByResidentIdOrderByCreatedAtDesc(contract.getResident().getId());
        
        List<com.smartrent.dto.ticket.TicketDTO.Response> responses = tickets.stream().map(t -> com.smartrent.dto.ticket.TicketDTO.Response.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .category(t.getCategory())
                .resolvedAt(t.getResolvedAt())
                .createdAt(t.getCreatedAt())
                .build()).collect(Collectors.toList());
                
        return ApiResponse.success(responses, "Tải danh sách yêu cầu hỗ trợ thành công");
    }

    @Transactional
    public ApiResponse<Void> createPortalTicket(String portalToken, com.smartrent.dto.ticket.TicketDTO.Request request) {
        Contract contract = contractRepository.findByPortalToken(portalToken)
                .orElseThrow(() -> new ResourceNotFoundException("Đường dẫn không hợp lệ"));
                
        com.smartrent.domain.Ticket ticket = com.smartrent.domain.Ticket.builder()
                .tenant(contract.getTenant())
                .room(contract.getRoom())
                .resident(contract.getResident())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : com.smartrent.domain.Ticket.TicketPriority.MEDIUM)
                .category(request.getCategory() != null ? request.getCategory() : com.smartrent.domain.Ticket.TicketCategory.OTHER)
                .status(com.smartrent.domain.Ticket.TicketStatus.PENDING)
                .build();
                
        ticketRepository.save(ticket);
        
        return ApiResponse.success(null, "Gửi yêu cầu hỗ trợ thành công");
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<com.smartrent.dto.asset.RoomAssetDTO.Response>> getPortalAssets(String portalToken) {
        Contract contract = contractRepository.findByPortalToken(portalToken)
                .orElseThrow(() -> new ResourceNotFoundException("Đường dẫn không hợp lệ"));
        
        List<com.smartrent.domain.RoomAsset> assets = roomAssetRepository.findByRoomIdAndTenantId(
                contract.getRoom().getId(), contract.getTenant().getId());
        
        List<com.smartrent.dto.asset.RoomAssetDTO.Response> responses = assets.stream().map(a -> 
                com.smartrent.dto.asset.RoomAssetDTO.Response.builder()
                    .id(a.getId())
                    .name(a.getName())
                    .quantity(a.getQuantity())
                    .condition(a.getCondition())
                    .compensationValue(a.getCompensationValue())
                    .description(a.getDescription())
                    .build()
        ).collect(Collectors.toList());
        
        return ApiResponse.success(responses, "Tải danh sách tài sản phòng thành công");
    }
}
