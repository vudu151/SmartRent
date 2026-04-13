package com.smartrent.service.impl;

import com.smartrent.domain.*;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.ticket.TicketDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.ResidentRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.TicketRepository;
import com.smartrent.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final ResidentRepository residentRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<TicketDTO.Response>> getTickets(Long tenantId, Ticket.TicketStatus status, String search, Pageable pageable) {
        Page<Ticket> tickets = ticketRepository.findByTenantIdAndFilters(tenantId, status, search != null ? search : "", pageable);
        return ApiResponse.success(tickets.map(this::toResponseDTO), "Lấy danh sách sự cố thành công");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TicketDTO.Response> getTicketById(Long id, Long tenantId) {
        Ticket ticket = ticketRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu sự cố không tồn tại"));
        return ApiResponse.success(toResponseDTO(ticket), "Lấy chi tiết sự cố thành công");
    }

    @Override
    @Transactional
    public ApiResponse<TicketDTO.Response> updateTicketStatus(Long id, Long tenantId, Ticket.TicketStatus newStatus) {
        Ticket ticket = ticketRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu sự cố không tồn tại"));

        if (newStatus == Ticket.TicketStatus.RESOLVED && ticket.getStatus() != Ticket.TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        ticket.setStatus(newStatus);
        ticket = ticketRepository.save(ticket);
        
        log.info("Ticket {} status updated to {} by Tenant {}", id, newStatus, tenantId);
        return ApiResponse.success(toResponseDTO(ticket), "Cập nhật trạng thái sự cố thành công");
    }

    @Override
    @Transactional
    public ApiResponse<TicketDTO.Response> createTicketAdmin(Long tenantId, TicketDTO.Request request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại"));
        
        Room room = roomRepository.findByIdAndTenantId(request.getRoomId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));

        Resident resident = residentRepository.findByIdAndTenantId(request.getResidentId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại"));

        Ticket ticket = Ticket.builder()
                .tenant(tenant)
                .room(room)
                .resident(resident)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Ticket.TicketPriority.MEDIUM)
                .category(request.getCategory() != null ? request.getCategory() : Ticket.TicketCategory.OTHER)
                .status(request.getStatus() != null ? request.getStatus() : Ticket.TicketStatus.PENDING)
                .build();

        ticket = ticketRepository.save(ticket);
        
        return ApiResponse.success(toResponseDTO(ticket), "Trình báo sự cố mới thành công");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteTicket(Long id, Long tenantId) {
        Ticket ticket = ticketRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu sự cố không tồn tại"));
        ticketRepository.delete(ticket);
        return ApiResponse.success(null, "Xóa hệ thống ghi nhận thành công");
    }

    private TicketDTO.Response toResponseDTO(Ticket ticket) {
        return TicketDTO.Response.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .category(ticket.getCategory())
                .roomId(ticket.getRoom().getId())
                .roomNumber(ticket.getRoom().getRoomNumber())
                .residentId(ticket.getResident().getId())
                .residentName(ticket.getResident().getFullName())
                .residentPhone(ticket.getResident().getPhone())
                .resolvedAt(ticket.getResolvedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
