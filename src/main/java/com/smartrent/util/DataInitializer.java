package com.smartrent.util;

import com.smartrent.domain.*;
import com.smartrent.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ResidentRepository residentRepository;
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final RoomFeeUnitRepository roomFeeUnitRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(TenantRepository tenantRepository, UserRepository userRepository, 
                           RoomRepository roomRepository, ResidentRepository residentRepository,
                           ContractRepository contractRepository, MeterReadingRepository meterReadingRepository,
                           RoomFeeUnitRepository roomFeeUnitRepository,
                           PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.residentRepository = residentRepository;
        this.contractRepository = contractRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.roomFeeUnitRepository = roomFeeUnitRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🚀 Starting Bulk Data Seeding Process...");

        // 1. Create Default Tenant
        Tenant tenant = tenantRepository.findByEmail("admin@smartrent.com")
                .orElseGet(() -> {
                    Tenant t = new Tenant();
                    t.setName("Hệ Thống SmartRent");
                    t.setEmail("admin@smartrent.com");
                    t.setStatus(Tenant.TenantStatus.ACTIVE);
                    return tenantRepository.save(t);
                });

        // 1.5. Setup Default Room Fee Unit
        if (roomFeeUnitRepository.findByTenantId(tenant.getId()).isEmpty()) {
            RoomFeeUnit feeUnit = new RoomFeeUnit();
            feeUnit.setTenant(tenant);
            feeUnit.setElectricityPerUnit(BigDecimal.valueOf(3500));
            feeUnit.setWaterPerUnit(BigDecimal.valueOf(20000));
            feeUnit.setInternetFee(BigDecimal.valueOf(100000));
            feeUnit.setParkingFee(BigDecimal.valueOf(150000));
            feeUnit.setRentPerSqm(BigDecimal.valueOf(0));
            feeUnit.setServicePerSqm(BigDecimal.valueOf(5000));
            roomFeeUnitRepository.save(feeUnit);
            System.out.println("✅ Default Room Fee Unit created for Tenant.");
        }

        // 2. Create Test Users for all 4 roles (create or update password)
        // 2a. SUPER_ADMIN
        userRepository.findByUsername("superadmin").ifPresentOrElse(
            existing -> {
                existing.setPasswordHash(passwordEncoder.encode("123456"));
                userRepository.save(existing);
                System.out.println("🔄 Updated SUPER_ADMIN password: superadmin / 123456");
            },
            () -> {
                User admin = new User();
                admin.setTenant(tenant);
                admin.setUsername("superadmin");
                admin.setEmail("superadmin@smartrent.com");
                admin.setPasswordHash(passwordEncoder.encode("123456"));
                admin.setFullName("Super Admin");
                admin.setPhone("0901000001");
                admin.setRole(User.UserRole.SUPER_ADMIN);
                admin.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(admin);
                System.out.println("✅ Created SUPER_ADMIN: superadmin / 123456");
            }
        );

        // 2b. TENANT_MANAGER
        userRepository.findByUsername("manager").ifPresentOrElse(
            existing -> {
                existing.setPasswordHash(passwordEncoder.encode("123456"));
                userRepository.save(existing);
                System.out.println("🔄 Updated TENANT_MANAGER password: manager / 123456");
            },
            () -> {
                User manager = new User();
                manager.setTenant(tenant);
                manager.setUsername("manager");
                manager.setEmail("manager@smartrent.com");
                manager.setPasswordHash(passwordEncoder.encode("123456"));
                manager.setFullName("Nguyễn Văn Quản Lý");
                manager.setPhone("0901000002");
                manager.setRole(User.UserRole.TENANT_MANAGER);
                manager.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(manager);
                System.out.println("✅ Created TENANT_MANAGER: manager / 123456");
            }
        );

        // 2c. GUARD
        userRepository.findByUsername("guard").ifPresentOrElse(
            existing -> {
                existing.setPasswordHash(passwordEncoder.encode("123456"));
                userRepository.save(existing);
                System.out.println("🔄 Updated GUARD password: guard / 123456");
            },
            () -> {
                User guard = new User();
                guard.setTenant(tenant);
                guard.setUsername("guard");
                guard.setEmail("guard@smartrent.com");
                guard.setPasswordHash(passwordEncoder.encode("123456"));
                guard.setFullName("Trần Văn Bảo Vệ");
                guard.setPhone("0901000003");
                guard.setRole(User.UserRole.GUARD);
                guard.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(guard);
                System.out.println("✅ Created GUARD: guard / 123456");
            }
        );

        // 2d. TENANT (Người thuê trọ)
        userRepository.findByUsername("tenant").ifPresentOrElse(
            existing -> {
                existing.setPasswordHash(passwordEncoder.encode("123456"));
                userRepository.save(existing);
                System.out.println("🔄 Updated TENANT password: tenant / 123456");
            },
            () -> {
                User tenantUser = new User();
                tenantUser.setTenant(tenant);
                tenantUser.setUsername("tenant");
                tenantUser.setEmail("tenant@smartrent.com");
                tenantUser.setPasswordHash(passwordEncoder.encode("123456"));
                tenantUser.setFullName("Lê Thị Người Thuê");
                tenantUser.setPhone("0901000004");
                tenantUser.setRole(User.UserRole.TENANT);
                tenantUser.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(tenantUser);
                System.out.println("✅ Created TENANT: tenant / 123456");
            }
        );

        // 3. Bulk Seed: 20 Rooms, Residents, Contracts
        if (roomRepository.findByTenantId(tenant.getId()).size() < 10) {
            for (int i = 1; i <= 20; i++) {
                String roomNum = (100 + i) + "";
                int floor = (i / 5) + 1;
                Room.RoomStatus status = (i <= 12) ? Room.RoomStatus.OCCUPIED : Room.RoomStatus.VACANT;
                Room room = createRoom(tenant, roomNum, floor, 3000000.0 + (i * 100000), status, i);

                if (status == Room.RoomStatus.OCCUPIED) {
                    Resident res = createResident(tenant, "Cư dân " + i, "resident" + i + "@gmail.com", "090" + (1000000 + i));
                    createContract(tenant, room, res, "HD-" + roomNum, room.getPrice().doubleValue());
                    
                    // Initial Meter Readings (Previous values)
                    createMeterReading(tenant, room, MeterType.ELECTRICITY, 100 + (i * 10));
                    createMeterReading(tenant, room, MeterType.WATER, 10 + i);
                }
            }
            System.out.println("✅ Bulk Seeding Completed: 20 Rooms, 12 Residents, 12 Contracts, 24 Meter Readings.");
        }

        System.out.println("✨ System Ready!");
    }

    private void createMeterReading(Tenant tenant, Room room, MeterType type, int value) {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        MeterReading reading = new MeterReading();
        reading.setTenant(tenant);
        reading.setRoom(room);
        reading.setType(type);
        reading.setReadingMonth(lastMonth.getMonthValue());
        reading.setReadingYear(lastMonth.getYear());
        reading.setOldIndex(BigDecimal.valueOf(value - 50));
        reading.setNewIndex(BigDecimal.valueOf(value));
        reading.setReadingDate(lastMonth);
        meterReadingRepository.save(reading);
    }

    private Room createRoom(Tenant tenant, String number, int floor, double price, Room.RoomStatus status, int index) {
        Optional<Room> existing = roomRepository.findAll().stream()
                .filter(r -> r.getRoomNumber().equals(number) && r.getTenant().getId().equals(tenant.getId()))
                .findFirst();
        if (existing.isPresent()) return existing.get();

        Room room = new Room();
        room.setTenant(tenant);
        room.setRoomNumber(number);
        room.setFloor(floor);
        room.setPrice(BigDecimal.valueOf(price));
        room.setStatus(status);
        room.setArea(BigDecimal.valueOf(20.0 + (floor * 2)));
        room.setType(index % 5 == 0 ? Room.RoomType.PENTHOUSE : Room.RoomType.STANDARD);
        return roomRepository.save(room);
    }

    private Resident createResident(Tenant tenant, String name, String email, String phone) {
        return residentRepository.findByPhone(phone)
                .orElseGet(() -> residentRepository.save(Resident.builder()
                        .tenant(tenant)
                        .fullName(name)
                        .email(email)
                        .phone(phone)
                        .status(Resident.ResidentStatus.ACTIVE)
                        .build()));
    }

    private void createContract(Tenant tenant, Room room, Resident resident, String number, double rent) {
        if (contractRepository.findByContractNumber(number).isPresent()) return;

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setRoom(room);
        contract.setResident(resident);
        contract.setContractNumber(number);
        contract.setStartDate(LocalDate.now().minusMonths(1));
        contract.setEndDate(LocalDate.now().plusMonths(11));
        contract.setMonthlyRent(BigDecimal.valueOf(rent));
        contract.setDepositAmount(BigDecimal.valueOf(rent));
        contract.setStatus(ContractStatus.ACTIVE);
        contractRepository.save(contract);
    }
}
