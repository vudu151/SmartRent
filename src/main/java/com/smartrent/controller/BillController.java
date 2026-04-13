package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.bill.BillResponse;
import com.smartrent.dto.bill.CreateBillRequest;
import com.smartrent.dto.bill.UpdateBillRequest;
import com.smartrent.service.BillService;
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
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Bill Management", description = "APIs for managing bills/invoices")
public class BillController {

    private final BillService billService;

    @GetMapping
    @Operation(summary = "Get bills", description = "Get paginated list of bills with filters")
    public ResponseEntity<ApiResponse<Page<BillResponse>>> getBills(
            @RequestParam Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String billType,
            @RequestParam(required = false) String roomNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(billService.getBills(tenantId, status, billType, roomNumber, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(
            @PathVariable Long id, @RequestParam Long tenantId) {
        return ResponseEntity.ok(billService.getBillById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create bill")
    public ResponseEntity<ApiResponse<BillResponse>> createBill(
            @Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.ok(billService.createBill(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update bill")
    public ResponseEntity<ApiResponse<BillResponse>> updateBill(
            @PathVariable Long id, @RequestParam Long tenantId,
            @Valid @RequestBody UpdateBillRequest request) {
        return ResponseEntity.ok(billService.updateBill(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bill")
    public ResponseEntity<ApiResponse<Void>> deleteBill(
            @PathVariable Long id, @RequestParam Long tenantId) {
        return ResponseEntity.ok(billService.deleteBill(id, tenantId));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Mark a bill as paid")
    public ResponseEntity<ApiResponse<BillResponse>> markAsPaid(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @RequestParam(required = false) String paymentReference) {
        return ResponseEntity.ok(billService.markAsPaid(id, tenantId, paymentReference));
    }

    @PostMapping("/meter-readings")
    @Operation(summary = "Generate electricity and water bills based on input meter readings")
    public ResponseEntity<ApiResponse<Void>> generateBatchMeterBills(
            @RequestParam Long tenantId,
            @Valid @RequestBody com.smartrent.dto.bill.MeterReadingRequestDTO.BatchRequest request) {
        return ResponseEntity.ok(billService.generateBatchMeterBills(tenantId, request));
    }
}
