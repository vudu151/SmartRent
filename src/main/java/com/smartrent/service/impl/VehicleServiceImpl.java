package com.smartrent.service.impl;

import com.smartrent.domain.Building;
import com.smartrent.domain.Resident;
import com.smartrent.domain.Room;
import com.smartrent.domain.Vehicle;
import com.smartrent.domain.VehicleType;
import com.smartrent.dto.vehicle.VehicleRequest;
import com.smartrent.dto.vehicle.VehicleResponse;
import com.smartrent.exception.BusinessException;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.BuildingRepository;
import com.smartrent.repository.ResidentRepository;
import com.smartrent.repository.VehicleRepository;
import com.smartrent.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for Vehicle Management (Quản lý Xe)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ResidentRepository residentRepository;
    private final BuildingRepository buildingRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<VehicleResponse> getVehicles(Long buildingId, int page, int size, String search, VehicleType vehicleType, Long roomId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : "";
        VehicleType typeParam = vehicleType;

        Page<Vehicle> vehicles = vehicleRepository.findByFilters(buildingId, typeParam, roomId, searchParam, pageable);
        return vehicles.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Xe không tồn tại với ID: " + id));
        return toResponse(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request, Long buildingId) {
        // Check biển số trùng trong building
        if (vehicleRepository.existsByLicensePlateAndBuildingId(request.getLicensePlate().trim(), buildingId)) {
            throw new BusinessException("Biển số xe '" + request.getLicensePlate() + "' đã tồn tại trong khu trọ");
        }

        // Validate resident
        Resident resident = residentRepository.findById(request.getResidentId())
            .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại với ID: " + request.getResidentId()));

        // Validate building
        Building building = buildingRepository.findById(buildingId)
            .orElseThrow(() -> new ResourceNotFoundException("Khu trọ không tồn tại với ID: " + buildingId));

        // Auto-fill phí mặc định nếu không truyền
        var monthlyFee = request.getMonthlyFee();
        if (monthlyFee == null || monthlyFee.signum() == 0) {
            monthlyFee = request.getVehicleType().getDefaultFee();
        }

        Vehicle vehicle = Vehicle.builder()
            .licensePlate(request.getLicensePlate().trim().toUpperCase())
            .vehicleType(request.getVehicleType())
            .brand(request.getBrand())
            .color(request.getColor())
            .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new java.util.ArrayList<>())
            .monthlyFee(monthlyFee)
            .notes(request.getNotes())
            .resident(resident)
            .building(building)
            .build();

        vehicle = vehicleRepository.save(vehicle);
        log.info("Created vehicle: {} for resident: {} in building: {}", vehicle.getLicensePlate(), resident.getFullName(), buildingId);

        return toResponse(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Xe không tồn tại với ID: " + id));

        // Check biển số trùng (exclude chính nó)
        if (vehicleRepository.existsByLicensePlateAndBuildingIdAndIdNot(
                request.getLicensePlate().trim(), vehicle.getBuilding().getId(), id)) {
            throw new BusinessException("Biển số xe '" + request.getLicensePlate() + "' đã tồn tại trong khu trọ");
        }

        // Validate resident nếu đổi
        if (!vehicle.getResident().getId().equals(request.getResidentId())) {
            Resident newResident = residentRepository.findById(request.getResidentId())
                .orElseThrow(() -> new ResourceNotFoundException("Cư dân không tồn tại với ID: " + request.getResidentId()));
            vehicle.setResident(newResident);
        }

        // Auto-fill phí mặc định nếu không truyền
        var monthlyFee = request.getMonthlyFee();
        if (monthlyFee == null || monthlyFee.signum() == 0) {
            monthlyFee = request.getVehicleType().getDefaultFee();
        }

        vehicle.setLicensePlate(request.getLicensePlate().trim().toUpperCase());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setColor(request.getColor());
        vehicle.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : new java.util.ArrayList<>());
        vehicle.setMonthlyFee(monthlyFee);
        vehicle.setNotes(request.getNotes());

        vehicle = vehicleRepository.save(vehicle);
        log.info("Updated vehicle: {} (ID: {})", vehicle.getLicensePlate(), id);

        return toResponse(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Xe không tồn tại với ID: " + id));

        vehicleRepository.delete(vehicle);
        log.info("Deleted vehicle: {} (ID: {})", vehicle.getLicensePlate(), id);
    }

    // ===== Private helpers =====

    private VehicleResponse toResponse(Vehicle vehicle) {
        // Lấy danh sách phòng của cư dân
        List<String> roomNumbers = vehicle.getResident().getRooms().stream()
            .map(Room::getRoomNumber)
            .sorted()
            .collect(Collectors.toList());

        return VehicleResponse.builder()
            .id(vehicle.getId())
            .licensePlate(vehicle.getLicensePlate())
            .vehicleType(vehicle.getVehicleType().name())
            .vehicleTypeName(vehicle.getVehicleType().getLabel())
            .brand(vehicle.getBrand())
            .color(vehicle.getColor())
            .imageUrls(vehicle.getImageUrls() != null ? vehicle.getImageUrls() : new java.util.ArrayList<>())
            .monthlyFee(vehicle.getMonthlyFee())
            .residentId(vehicle.getResident().getId())
            .residentName(vehicle.getResident().getFullName())
            .roomNumbers(roomNumbers)
            .notes(vehicle.getNotes())
            .createdAt(vehicle.getCreatedAt())
            .updatedAt(vehicle.getUpdatedAt())
            .build();
    }
}
