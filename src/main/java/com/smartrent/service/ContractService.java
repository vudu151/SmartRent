package com.smartrent.service;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.contract.ContractRequestDTO;
import com.smartrent.dto.contract.ContractResponseDTO;
import com.smartrent.dto.contract.LiquidationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContractService {
    ApiResponse<Page<ContractResponseDTO>> getContracts(Long tenantId, String search, Pageable pageable);
    ApiResponse<ContractResponseDTO> getContractById(Long id, Long tenantId);
    ApiResponse<ContractResponseDTO> createContract(Long tenantId, ContractRequestDTO request);
    ApiResponse<ContractResponseDTO> updateContract(Long id, Long tenantId, ContractRequestDTO request);
    ApiResponse<Void> deleteContract(Long id, Long tenantId);

    // Phase 3: Liquidation
    ApiResponse<LiquidationDTO> getLiquidationSummary(Long id, Long tenantId, Integer stayDays);
    ApiResponse<Void> liquidate(Long id, Long tenantId, LiquidationDTO.Request request);
}
