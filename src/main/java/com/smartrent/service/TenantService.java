package com.smartrent.service;

import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.tenant.CreateTenantRequest;
import com.smartrent.dto.tenant.TenantResponse;
import com.smartrent.dto.tenant.UpdateTenantRequest;
import com.smartrent.exception.BusinessException;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.TenantRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for Tenant Management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    /**
     * Get all tenants with pagination and optional search
     */
    @Transactional(readOnly = true)
    public ApiResponse<Page<TenantResponse>> getAllTenants(String search, Pageable pageable) {
        Specification<Tenant> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(cb.coalesce(root.get("phone"), cb.literal(""))), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<Tenant> tenants = tenantRepository.findAll(spec, pageable);
        Page<TenantResponse> response = tenants.map(this::toResponse);
        return ApiResponse.success(response, "Lấy danh sách tenant thành công");
    }

    /**
     * Get tenant by ID
     */
    @Transactional(readOnly = true)
    public ApiResponse<TenantResponse> getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại với ID: " + id));
        return ApiResponse.success(toResponse(tenant), "Lấy thông tin tenant thành công");
    }

    /**
     * Create new tenant
     */
    @Transactional
    public ApiResponse<TenantResponse> createTenant(CreateTenantRequest request) {
        // Check if email already exists
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã được sử dụng bởi tenant khác");
        }

        Tenant tenant = Tenant.builder()
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .taxCode(request.getTaxCode())
            .status(Tenant.TenantStatus.ACTIVE)
            .build();

        tenant = tenantRepository.save(tenant);
        log.info("Created tenant with ID: {}", tenant.getId());

        return ApiResponse.success(toResponse(tenant), "Tạo tenant thành công");
    }

    /**
     * Update tenant
     */
    @Transactional
    public ApiResponse<TenantResponse> updateTenant(Long id, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại với ID: " + id));

        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && !request.getEmail().equals(tenant.getEmail())) {
            if (tenantRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Email đã được sử dụng bởi tenant khác");
            }
            tenant.setEmail(request.getEmail());
        }

        // Update fields if provided
        if (request.getName() != null) {
            tenant.setName(request.getName());
        }
        if (request.getPhone() != null) {
            tenant.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            tenant.setAddress(request.getAddress());
        }
        if (request.getTaxCode() != null) {
            tenant.setTaxCode(request.getTaxCode());
        }

        tenant = tenantRepository.save(tenant);
        log.info("Updated tenant with ID: {}", tenant.getId());

        return ApiResponse.success(toResponse(tenant), "Cập nhật tenant thành công");
    }

    /**
     * Delete tenant (soft delete by setting status to CANCELLED)
     */
    @Transactional
    public ApiResponse<Void> deleteTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại với ID: " + id));

        // Soft delete by changing status
        tenant.setStatus(Tenant.TenantStatus.CANCELLED);
        tenantRepository.save(tenant);
        log.info("Deleted (cancelled) tenant with ID: {}", id);

        return ApiResponse.success(null, "Xóa tenant thành công");
    }

    /**
     * Update tenant status
     */
    @Transactional
    public ApiResponse<TenantResponse> updateTenantStatus(Long id, Tenant.TenantStatus status) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại với ID: " + id));

        tenant.setStatus(status);
        tenant = tenantRepository.save(tenant);
        log.info("Updated tenant status to {} for tenant ID: {}", status, id);

        return ApiResponse.success(toResponse(tenant), "Cập nhật trạng thái tenant thành công");
    }

    /**
     * Update tenant auto billing day
     */
    @Transactional
    public void updateAutoBillingDay(Long tenantId, Integer day) {
        if (day == null || day < 1 || day > 28) {
            throw new BusinessException("Ngày chốt hóa đơn phải từ ngày 1 đến 28");
        }
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant không tồn tại với ID: " + tenantId));

        tenant.setAutoBillingDay(day);
        tenantRepository.save(tenant);
        log.info("Updated auto billing day to {} for tenant ID: {}", day, tenantId);
    }

    /**
     * Convert Tenant entity to TenantResponse DTO
     */
    private TenantResponse toResponse(Tenant tenant) {
        return TenantResponse.builder()
            .id(tenant.getId())
            .name(tenant.getName())
            .email(tenant.getEmail())
            .phone(tenant.getPhone())
            .address(tenant.getAddress())
            .taxCode(tenant.getTaxCode())
            .status(tenant.getStatus().name())
            .createdAt(tenant.getCreatedAt())
            .updatedAt(tenant.getUpdatedAt())
            .build();
    }
}
