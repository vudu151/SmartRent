package com.smartrent.service;

import com.smartrent.domain.VehicleType;
import com.smartrent.dto.vehicle.VehicleRequest;
import com.smartrent.dto.vehicle.VehicleResponse;
import org.springframework.data.domain.Page;

public interface VehicleService {

    Page<VehicleResponse> getVehicles(Long buildingId, int page, int size, String search, VehicleType vehicleType, Long roomId);

    VehicleResponse getVehicleById(Long id);

    VehicleResponse createVehicle(VehicleRequest request, Long buildingId);

    VehicleResponse updateVehicle(Long id, VehicleRequest request);

    void deleteVehicle(Long id);
}
