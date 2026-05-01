package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.contract.ContractRequestDTO;
import com.smartrent.dto.contract.ContractResponseDTO;
import com.smartrent.dto.contract.LiquidationDTO;
import com.smartrent.service.ContractService;
import com.smartrent.annotation.LogAction;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Tag(name = "Contract Management", description = "APIs for managing rental contracts")
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @Operation(summary = "Get contracts", description = "Get paginated list of contracts for a tenant")
    public ResponseEntity<ApiResponse<Page<ContractResponseDTO>>> getContracts(
            @RequestParam Long tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(contractService.getContracts(tenantId, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contract by ID")
    public ResponseEntity<ApiResponse<ContractResponseDTO>> getContractById(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(contractService.getContractById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create contract")
    @LogAction(action = "CREATE", entityName = "Hợp đồng")
    public ResponseEntity<ApiResponse<ContractResponseDTO>> createContract(
            @RequestParam Long tenantId,
            @Valid @RequestBody ContractRequestDTO request) {
        return ResponseEntity.ok(contractService.createContract(tenantId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update contract")
    @LogAction(action = "UPDATE", entityName = "Hợp đồng")
    public ResponseEntity<ApiResponse<ContractResponseDTO>> updateContract(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @Valid @RequestBody ContractRequestDTO request) {
        return ResponseEntity.ok(contractService.updateContract(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete contract")
    @LogAction(action = "DELETE", entityName = "Hợp đồng")
    public ResponseEntity<ApiResponse<Void>> deleteContract(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(contractService.deleteContract(id, tenantId));
    }

    @GetMapping("/{id}/liquidation")
    @Operation(summary = "Get liquidation summary (calculate debts/refund)")
    public ResponseEntity<ApiResponse<LiquidationDTO>> getLiquidationSummary(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @RequestParam(required = false) Integer stayDays) {
        return ResponseEntity.ok(contractService.getLiquidationSummary(id, tenantId, stayDays));
    }

    @PostMapping("/{id}/liquidate")
    @Operation(summary = "Execute contract liquidation and checkout")
    @LogAction(action = "LIQUIDATE", entityName = "Hợp đồng")
    public ResponseEntity<ApiResponse<Void>> liquidate(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @Valid @RequestBody LiquidationDTO.Request request) {
        return ResponseEntity.ok(contractService.liquidate(id, tenantId, request));
    }
}
