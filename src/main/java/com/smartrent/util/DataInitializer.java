package com.smartrent.util;

import com.smartrent.domain.*;
import com.smartrent.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ResidentRepository residentRepository;
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BuildingRepository buildingRepository;
    private final BillRepository billRepository;
    private final TicketRepository ticketRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public DataInitializer(TenantRepository tenantRepository, UserRepository userRepository,
                           RoomRepository roomRepository, ResidentRepository residentRepository,
                           ContractRepository contractRepository, MeterReadingRepository meterReadingRepository,
                           BuildingRepository buildingRepository,
                           BillRepository billRepository,
                           TicketRepository ticketRepository,
                           VehicleRepository vehicleRepository,
                           PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.residentRepository = residentRepository;
        this.contractRepository = contractRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.buildingRepository = buildingRepository;
        this.billRepository = billRepository;
        this.ticketRepository = ticketRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🚀 Starting Bulk Data Seeding Process...");

        // Xóa dữ liệu các bảng (Bao gồm users)
        entityManager.createNativeQuery("TRUNCATE TABLE tickets CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE bills CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE meter_readings CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE contracts CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE vehicles CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE resident_rooms CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE residents CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE rooms CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE buildings CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE users CASCADE").executeUpdate();

        System.out.println("✅ Cleared all transaction tables successfully.");

        // 1. Create Default Tenant
        Tenant tenant = tenantRepository.findByEmail("admin@smartrent.com")
                .orElseGet(() -> {
                    Tenant t = new Tenant();
                    t.setName("Hệ Thống SmartRent");
                    t.setEmail("admin@smartrent.com");
                    t.setStatus(Tenant.TenantStatus.ACTIVE);
                    return tenantRepository.save(t);
                });

        // 2. Create Default Users (if not exist)
        final String defaultPassword = "DTech@150102.";

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setTenant(tenant);
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPasswordHash(passwordEncoder.encode(defaultPassword));
            admin.setFullName("Super Admin");
            admin.setPhone("0901000001");
            admin.setRole(User.UserRole.SUPER_ADMIN);
            admin.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("tenant").isEmpty()) {
            User manager = new User();
            manager.setTenant(tenant);
            manager.setUsername("tenant");
            manager.setEmail("tenant@gmail.com");
            manager.setPasswordHash(passwordEncoder.encode(defaultPassword));
            manager.setFullName("Nguyễn Văn Quản Lý");
            manager.setPhone("0901000002");
            manager.setRole(User.UserRole.TENANT_MANAGER);
            manager.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(manager);
        }

        if (userRepository.findByUsername("guard").isEmpty()) {
            User guard = new User();
            guard.setTenant(tenant);
            guard.setUsername("guard");
            guard.setEmail("guard@gmail.com");
            guard.setPasswordHash(passwordEncoder.encode(defaultPassword));
            guard.setFullName("Trần Văn Bảo Vệ");
            guard.setPhone("0901000003");
            guard.setRole(User.UserRole.GUARD);
            guard.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(guard);
        }

        if (userRepository.findByUsername("resident").isEmpty()) {
            User tenantUser = new User();
            tenantUser.setTenant(tenant);
            tenantUser.setUsername("resident");
            tenantUser.setEmail("resident@gmail.com");
            tenantUser.setPasswordHash(passwordEncoder.encode(defaultPassword));
            tenantUser.setFullName("Lê Thị Người Thuê");
            tenantUser.setPhone("0901000004");
            tenantUser.setRole(User.UserRole.TENANT);
            tenantUser.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(tenantUser);
        }

        // 3. Seed 3 Buildings
        String[] buildingNames = {"Khu An Bình 1", "Khu 33 Nguyễn Lân", "36 Nguyễn Hoàng"};
        Building[] buildings = new Building[3];

        for (int i = 0; i < 3; i++) {
            Building b = new Building();
            b.setTenant(tenant);
            b.setName(buildingNames[i]);
            b.setAddress(buildingNames[i] + " - Hà Nội");
            b.setElectricityPrice(BigDecimal.valueOf(3500));
            b.setWaterPrice(BigDecimal.valueOf(25000));
            b.setServicePrice(BigDecimal.valueOf(100000));
            b.setInternetPrice(BigDecimal.valueOf(100000));
            b.setParkingPrice(BigDecimal.valueOf(120000));
            buildings[i] = buildingRepository.save(b);
        }
        System.out.println("✅ Seeded 3 Buildings.");

        // Generate prefix for buildings
        String[] prefixes = {"AB1", "33NL", "36NH"};
        
        int totalRecords = 20;
        int recordsPerBuilding = totalRecords / 3;
        
        int globalIndex = 1;

        for (int bIdx = 0; bIdx < 3; bIdx++) {
            Building building = buildings[bIdx];
            String prefix = prefixes[bIdx] + "-";
            
            int countForThisBuilding = (bIdx == 2) ? (totalRecords - recordsPerBuilding * 2) : recordsPerBuilding; // 6, 7, 7 to get exactly 20

            for (int i = 1; i <= countForThisBuilding; i++) {
                String roomNum = prefix + (100 + i);
                int floor = (i <= 3) ? 1 : 2;
                
                // Room
                Room room = new Room();
                room.setTenant(tenant);
                room.setBuilding(building);
                room.setRoomNumber(roomNum);
                room.setFloor(floor);
                room.setPrice(BigDecimal.valueOf(3000000.0 + (i * 100000)));
                room.setStatus(Room.RoomStatus.OCCUPIED);
                room.setArea(BigDecimal.valueOf(20.0 + (floor * 2)));
                room.setType(Room.RoomType.STANDARD);
                room = roomRepository.save(room);

                // Resident
                Resident res = new Resident();
                res.setTenant(tenant);
                res.setFullName("Cư dân " + globalIndex);
                res.setEmail("resident" + globalIndex + "@gmail.com");
                res.setPhone(String.format("090%07d", globalIndex));
                res.setStatus(Resident.ResidentStatus.ACTIVE);
                res = residentRepository.save(res);

                // Assign Resident to Room (Room is owning side)
                room.getResidents().add(res);
                roomRepository.save(room);

                // Contract
                Contract contract = new Contract();
                contract.setTenant(tenant);
                contract.setRoom(room);
                contract.setResident(res);
                contract.setContractNumber("HD-" + roomNum);
                contract.setStartDate(LocalDate.now().minusMonths(2));
                contract.setEndDate(LocalDate.now().plusMonths(10));
                contract.setMonthlyRent(room.getPrice());
                contract.setDepositAmount(room.getPrice());
                contract.setStatus(ContractStatus.ACTIVE);
                contractRepository.save(contract);

                // Vehicle
                Vehicle vehicle = new Vehicle();
                vehicle.setBuilding(building);
                vehicle.setResident(res);
                vehicle.setLicensePlate(String.format("29A-%05d", globalIndex));
                vehicle.setVehicleType(globalIndex % 2 == 0 ? VehicleType.MOTORBIKE : VehicleType.CAR);
                vehicle.setColor("Đen");
                vehicle.setMonthlyFee(vehicle.getVehicleType().getDefaultFee());
                vehicleRepository.save(vehicle);

                // Meter Reading (Electricity & Water to make 20 each? Wait, if we create 2 per room, we get 40 total meter readings. User asked for 20 records per table)
                // We just create 1 Electricity and 1 Water for some, or just 1 reading per room to have exactly 20.
                MeterReading reading = new MeterReading();
                reading.setTenant(tenant);
                reading.setRoom(room);
                reading.setType(globalIndex % 2 == 0 ? MeterType.ELECTRICITY : MeterType.WATER);
                reading.setReadingMonth(LocalDate.now().getMonthValue());
                reading.setReadingYear(LocalDate.now().getYear());
                reading.setOldIndex(BigDecimal.valueOf(100));
                reading.setNewIndex(BigDecimal.valueOf(150));
                reading.setReadingDate(LocalDate.now().minusDays(2));
                meterReadingRepository.save(reading);

                // Bill
                Bill bill = new Bill();
                bill.setTenant(tenant);
                bill.setRoom(room);
                bill.setRoomNumber(roomNum);
                bill.setBillType(Bill.BillType.RENT);
                bill.setDescription("Hóa đơn thuê phòng " + roomNum);
                bill.setAmount(room.getPrice().add(BigDecimal.valueOf(200000)));
                bill.setStatus(globalIndex % 2 == 0 ? Bill.BillStatus.PAID : Bill.BillStatus.UNPAID);
                bill.setDueDate(LocalDate.now().plusDays(5));
                billRepository.save(bill);

                // Ticket
                Ticket ticket = new Ticket();
                ticket.setTenant(tenant);
                ticket.setRoom(room);
                ticket.setResident(res);
                ticket.setTitle("Sự cố phòng " + roomNum);
                ticket.setDescription("Mô tả sự cố số " + globalIndex);
                ticket.setStatus(Ticket.TicketStatus.PENDING);
                ticket.setPriority(Ticket.TicketPriority.MEDIUM);
                ticket.setCategory(Ticket.TicketCategory.APPLIANCE);
                ticketRepository.save(ticket);
                
                globalIndex++;
            }

            // 4. Seed Data for each Building
            String prefixUser = bIdx == 0 ? "ab1" : (bIdx == 1 ? "nl" : "nh");

            User buildingManager = new User();
            buildingManager.setTenant(tenant);
            buildingManager.setBuilding(building);
            buildingManager.setUsername("manager_" + prefixUser);
            buildingManager.setEmail("manager_" + prefixUser + "@gmail.com");
            buildingManager.setPasswordHash(passwordEncoder.encode(defaultPassword));
            buildingManager.setFullName("Quản lý " + buildingNames[bIdx]);
            buildingManager.setPhone("09810001" + bIdx);
            buildingManager.setRole(User.UserRole.TENANT_MANAGER);
            buildingManager.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(buildingManager);

            User buildingGuard = new User();
            buildingGuard.setTenant(tenant);
            buildingGuard.setBuilding(building);
            buildingGuard.setUsername("guard_" + prefixUser);
            buildingGuard.setEmail("guard_" + prefixUser + "@gmail.com");
            buildingGuard.setPasswordHash(passwordEncoder.encode(defaultPassword));
            buildingGuard.setFullName("Bảo vệ " + buildingNames[bIdx]);
            buildingGuard.setPhone("09810002" + bIdx);
            buildingGuard.setRole(User.UserRole.GUARD);
            buildingGuard.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(buildingGuard);
        }

        System.out.println("✨ System Ready! Created exactly 20 records for related tables.");
    }
}
