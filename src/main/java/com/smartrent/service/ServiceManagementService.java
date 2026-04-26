package com.smartrent.service;

import com.smartrent.domain.*;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.service.MeterReadingDTO;
import com.smartrent.dto.service.RecordMeterRequest;
import com.smartrent.dto.service.BuildingDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceManagementService {

    private final MeterReadingRepository meterReadingRepository;
    private final BuildingRepository buildingRepository;
    private final BillRepository billRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;

    // --- Room Fee Unit Configurations ---

    @Transactional(readOnly = true)
    public ApiResponse<BuildingDTO> getBuildingConfig(Long tenantId, Long buildingId) {
        Building building = buildingRepository.findByIdAndTenantId(buildingId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Khu trọ không tồn tại"));
        return ApiResponse.success(toBuildingDTO(building), "Lấy cấu hình giá dịch vụ thành công");
    }

    @Transactional
    public ApiResponse<BuildingDTO> updateBuildingConfig(Long tenantId, Long buildingId, BuildingDTO request) {
        Building building = buildingRepository.findByIdAndTenantId(buildingId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Khu trọ không tồn tại"));

        if (request.getName() != null) building.setName(request.getName());
        if (request.getAddress() != null) building.setAddress(request.getAddress());
        if (request.getServicePrice() != null) building.setServicePrice(request.getServicePrice());
        if (request.getParkingPrice() != null) building.setParkingPrice(request.getParkingPrice());
        if (request.getWaterPrice() != null) building.setWaterPrice(request.getWaterPrice());
        if (request.getElectricityPrice() != null) building.setElectricityPrice(request.getElectricityPrice());
        if (request.getInternetPrice() != null) building.setInternetPrice(request.getInternetPrice());
        if (request.getMeterRecordingStartDay() != null) building.setMeterRecordingStartDay(request.getMeterRecordingStartDay());
        if (request.getMeterRecordingEndDay() != null) building.setMeterRecordingEndDay(request.getMeterRecordingEndDay());

        building = buildingRepository.save(building);
        log.info("Updated building config for building {}", buildingId);
        return ApiResponse.success(toBuildingDTO(building), "Cập nhật khu trọ thành công");
    }

    // --- Meter Readings ---

    @Transactional(readOnly = true)
    public ApiResponse<Page<MeterReadingDTO>> getMeterReadings(Long tenantId, Integer month, Integer year, String search, Pageable pageable) {
        Page<MeterReading> readings = meterReadingRepository.findByTenantIdAndPeriod(tenantId, month, year, search != null ? search : "", pageable);
        return ApiResponse.success(readings.map(this::toReadingDTO), "Lấy danh sách chỉ số thành công");
    }

    @Transactional
    public ApiResponse<MeterReadingDTO> recordMeter(Long tenantId, RecordMeterRequest request) {
        Room room = roomRepository.findByIdAndTenantId(request.getRoomId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));

        // Check if there is already a reading for this period
        Optional<MeterReading> existing = meterReadingRepository.findByRoomAndTypeAndPeriod(
                room.getId(), request.getType(), request.getReadingMonth(), request.getReadingYear());

        MeterReading reading;
        if (existing.isPresent()) {
            reading = existing.get();
            reading.setNewIndex(request.getNewIndex());
            // Only update oldIndex if strictly requested
            if (request.getOldIndex() != null) {
                reading.setOldIndex(request.getOldIndex());
            }
        } else {
            // New reading: Fetch previous month's final index as old_index
            BigDecimal oldIndexToUse = request.getOldIndex();
            if (oldIndexToUse == null) {
                Optional<MeterReading> previous = meterReadingRepository.findLatestByRoomAndType(room.getId(), request.getType());
                oldIndexToUse = previous.map(MeterReading::getNewIndex).orElse(BigDecimal.ZERO);
            }

            reading = MeterReading.builder()
                    .tenant(room.getTenant())
                    .room(room)
                    .type(request.getType())
                    .readingMonth(request.getReadingMonth())
                    .readingYear(request.getReadingYear())
                    .oldIndex(oldIndexToUse)
                    .newIndex(request.getNewIndex())
                    .readingDate(LocalDate.now())
                    .build();
        }

        reading = meterReadingRepository.save(reading);
        log.info("Recorded {} index for room {} (period {}/{})", request.getType(), room.getRoomNumber(), request.getReadingMonth(), request.getReadingYear());
        return ApiResponse.success(toReadingDTO(reading), "Ghi chỉ số thành công");
    }

    @Transactional
    public ApiResponse<Void> generateCombinedBill(Long tenantId, Long roomId, Integer month, Integer year) {
        Room room = roomRepository.findByIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại"));

        Building building = room.getBuilding();
        if (building == null) {
            throw new ResourceNotFoundException("Phòng chưa được gán vào khu trọ nào");
        }

        // Retrieve readings for the month
        Optional<MeterReading> elecReading = meterReadingRepository.findByRoomAndTypeAndPeriod(roomId, MeterType.ELECTRICITY, month, year);
        Optional<MeterReading> waterReading = meterReadingRepository.findByRoomAndTypeAndPeriod(roomId, MeterType.WATER, month, year);

        // Retrieve contract to get rental fee
        Optional<Contract> activeContract = contractRepository.findActiveContractByRoom(roomId);

        BigDecimal totalAmount = BigDecimal.ZERO;
        StringBuilder description = new StringBuilder();
        description.append(String.format("Hóa đơn tổng hợp Tháng %d/%d - Phòng %s\n", month, year, room.getRoomNumber()));
        
        // 1. Rent
        if (activeContract.isPresent()) {
            BigDecimal rent = activeContract.get().getMonthlyRent();
            totalAmount = totalAmount.add(rent);
            description.append(String.format("- Tiền phòng: %,.0f đ\n", rent));
        }

        // 2. Electricity
        if (elecReading.isPresent()) {
            MeterReading er = elecReading.get();
            BigDecimal usage = er.getNewIndex().subtract(er.getOldIndex());
            if (usage.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal elecCost = usage.multiply(building.getElectricityPrice());
                totalAmount = totalAmount.add(elecCost);
                description.append(String.format("- Điện (Cũ: %.0f, Mới: %.0f, Dùng: %.0f): %,.0f đ\n", 
                    er.getOldIndex(), er.getNewIndex(), usage, elecCost));
            }
        }

        // 3. Water
        if (waterReading.isPresent()) {
            MeterReading wr = waterReading.get();
            BigDecimal usage = wr.getNewIndex().subtract(wr.getOldIndex());
            if (usage.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal waterCost = usage.multiply(building.getWaterPrice());
                totalAmount = totalAmount.add(waterCost);
                description.append(String.format("- Nước (Cũ: %.0f, Mới: %.0f, Dùng: %.0f): %,.0f đ\n", 
                    wr.getOldIndex(), wr.getNewIndex(), usage, waterCost));
            }
        }

        // 4. Other Fixed Fees (Internet, Service, Parking)
        if (building.getInternetPrice() != null && building.getInternetPrice().compareTo(BigDecimal.ZERO) > 0) {
            totalAmount = totalAmount.add(building.getInternetPrice());
            description.append(String.format("- Internet: %,.0f đ\n", building.getInternetPrice()));
        }
        if (building.getParkingPrice() != null && building.getParkingPrice().compareTo(BigDecimal.ZERO) > 0) {
            totalAmount = totalAmount.add(building.getParkingPrice());
            description.append(String.format("- Gửi xe định mức: %,.0f đ\n", building.getParkingPrice()));
        }

        // Check if an UNPAID bill for this month already exists to combine or override
        // For simplicity, we just create a new one. In a real system, you might check if one exists and update.
        Bill combinedBill = Bill.builder()
                .tenant(room.getTenant())
                .room(room)
                .roomNumber(room.getRoomNumber())
                .billType(Bill.BillType.OTHER) // Using OTHER to denote Combined
                .amount(totalAmount)
                .description(description.toString())
                .dueDate(LocalDate.of(year, month, 1).plusMonths(1).withDayOfMonth(5)) // Due on the 5th of next month
                .status(Bill.BillStatus.UNPAID)
                .build();

        billRepository.save(combinedBill);
        log.info("Generated combined bill for room {} for {}/{}", room.getRoomNumber(), month, year);

        return ApiResponse.success(null, "Chốt hóa đơn gộp thành công");
    }

    private BuildingDTO toBuildingDTO(Building b) {
        return BuildingDTO.builder()
                .id(b.getId())
                .tenantId(b.getTenant().getId())
                .name(b.getName())
                .address(b.getAddress())
                .servicePrice(b.getServicePrice())
                .parkingPrice(b.getParkingPrice())
                .waterPrice(b.getWaterPrice())
                .electricityPrice(b.getElectricityPrice())
                .internetPrice(b.getInternetPrice())
                .meterRecordingStartDay(b.getMeterRecordingStartDay())
                .meterRecordingEndDay(b.getMeterRecordingEndDay())
                .build();
    }

    private MeterReadingDTO toReadingDTO(MeterReading r) {
        return MeterReadingDTO.builder()
                .id(r.getId())
                .roomId(r.getRoom().getId())
                .roomNumber(r.getRoom().getRoomNumber())
                .type(r.getType())
                .readingMonth(r.getReadingMonth())
                .readingYear(r.getReadingYear())
                .oldIndex(r.getOldIndex())
                .newIndex(r.getNewIndex())
                .usageAmount(r.getNewIndex().subtract(r.getOldIndex()))
                .readingDate(r.getReadingDate())
                .build();
    }
}
