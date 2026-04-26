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
    private final BuildingRepository buildingRepository;
    private final BillRepository billRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(TenantRepository tenantRepository, UserRepository userRepository, 
                           RoomRepository roomRepository, ResidentRepository residentRepository,
                           ContractRepository contractRepository, MeterReadingRepository meterReadingRepository,
                           BuildingRepository buildingRepository,
                           BillRepository billRepository,
                           TicketRepository ticketRepository,
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
        if (buildingRepository.findByTenantId(tenant.getId()).isEmpty()) {
            Building building = new Building();
            building.setTenant(tenant);
            building.setName("Khu Mặc Định");
            building.setElectricityPrice(BigDecimal.valueOf(3500));
            building.setWaterPrice(BigDecimal.valueOf(25000));
            building.setServicePrice(BigDecimal.valueOf(100000));
            building.setInternetPrice(BigDecimal.valueOf(100000));
            building.setParkingPrice(BigDecimal.valueOf(120000));
            buildingRepository.save(building);
            System.out.println("✅ Default Room Fee Unit created for Tenant.");
        }

        // 2. Create default users for all 4 roles (only INSERT if not exists)
        // Default password: DTech@150102
        final String defaultPassword = "DTech@150102";

        // 2a. SUPER_ADMIN (superadmin)
        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User admin = new User();
            admin.setTenant(tenant);
            admin.setUsername("superadmin");
            admin.setEmail("superadmin@smartrent.com");
            admin.setPasswordHash(passwordEncoder.encode(defaultPassword));
            admin.setFullName("Super Admin");
            admin.setPhone("0901000001");
            admin.setRole(User.UserRole.SUPER_ADMIN);
            admin.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(admin);
            System.out.println("✅ Created SUPER_ADMIN: superadmin / " + defaultPassword);
        }

        // 2a2. SUPER_ADMIN (admin - legacy from V5 migration)
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminLegacy = new User();
            adminLegacy.setTenant(tenant);
            adminLegacy.setUsername("admin");
            adminLegacy.setEmail("admin@smartrent.com");
            adminLegacy.setPasswordHash(passwordEncoder.encode(defaultPassword));
            adminLegacy.setFullName("System Administrator");
            adminLegacy.setPhone("0901000000");
            adminLegacy.setRole(User.UserRole.SUPER_ADMIN);
            adminLegacy.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(adminLegacy);
            System.out.println("✅ Created ADMIN: admin / " + defaultPassword);
        }

        // 2b. TENANT_MANAGER
        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setTenant(tenant);
            manager.setUsername("manager");
            manager.setEmail("manager@smartrent.com");
            manager.setPasswordHash(passwordEncoder.encode(defaultPassword));
            manager.setFullName("Nguyễn Văn Quản Lý");
            manager.setPhone("0901000002");
            manager.setRole(User.UserRole.TENANT_MANAGER);
            manager.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(manager);
            System.out.println("✅ Created TENANT_MANAGER: manager / " + defaultPassword);
        }

        // 2c. GUARD
        if (userRepository.findByUsername("guard").isEmpty()) {
            User guard = new User();
            guard.setTenant(tenant);
            guard.setUsername("guard");
            guard.setEmail("guard@smartrent.com");
            guard.setPasswordHash(passwordEncoder.encode(defaultPassword));
            guard.setFullName("Trần Văn Bảo Vệ");
            guard.setPhone("0901000003");
            guard.setRole(User.UserRole.GUARD);
            guard.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(guard);
            System.out.println("✅ Created GUARD: guard / " + defaultPassword);
        }

        // 2d. TENANT (Người thuê trọ)
        if (userRepository.findByUsername("tenant").isEmpty()) {
            User tenantUser = new User();
            tenantUser.setTenant(tenant);
            tenantUser.setUsername("tenant");
            tenantUser.setEmail("tenant@smartrent.com");
            tenantUser.setPasswordHash(passwordEncoder.encode(defaultPassword));
            tenantUser.setFullName("Lê Thị Người Thuê");
            tenantUser.setPhone("0901000004");
            tenantUser.setRole(User.UserRole.TENANT);
            tenantUser.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(tenantUser);
            System.out.println("✅ Created TENANT: tenant / " + defaultPassword);
        }


        // 3. Bulk Seed for Building A, B, C FOR ALL TENANTS
        tenantRepository.findAll().forEach(t -> {
            if (buildingRepository.findByTenantId(t.getId()).isEmpty()) {
                String[] buildingNames = {"Khu A", "Khu B", "Khu C"};
                for (String bName : buildingNames) {
                    Building b = new Building();
                    b.setTenant(t);
                    b.setName(bName);
                    b.setAddress("Địa chỉ " + bName + " của " + t.getEmail());
                    b.setElectricityPrice(BigDecimal.valueOf(3500));
                    b.setWaterPrice(BigDecimal.valueOf(25000));
                    b.setServicePrice(BigDecimal.valueOf(100000));
                    b.setInternetPrice(BigDecimal.valueOf(100000));
                    b.setParkingPrice(BigDecimal.valueOf(120000));
                    buildingRepository.save(b);
                }
            }

            // Also seed rooms if less than 8
            buildingRepository.findByTenantId(t.getId()).forEach(building -> {
                if (roomRepository.findByTenantId(t.getId()).stream().filter(r -> r.getBuilding() != null && r.getBuilding().getId().equals(building.getId())).count() < 8) {
                    for (int i = 1; i <= 8; i++) {
                        String roomNum = building.getName().replace("Khu ", "") + "0" + i;
                        int floor = (i <= 4) ? 1 : 2;
                        Room room = createRoom(t, building, roomNum, floor, 3000000.0 + (i * 100000), Room.RoomStatus.OCCUPIED, i);

                        Resident res = createResident(t, "Cư dân " + roomNum, "resident" + t.getId() + roomNum + "@gmail.com", "090" + Math.abs((t.getId() + roomNum).hashCode() % 10000000));
                        Contract contract = createContract(t, room, res, "HD-" + roomNum, room.getPrice().doubleValue());

                        createMeterReading(t, room, MeterType.ELECTRICITY, 150 + (i * 10));
                        createMeterReading(t, room, MeterType.WATER, 20 + i);

                        createBill(t, room, roomNum);
                        createTicket(t, room, res, roomNum);
                    }
                    System.out.println("✅ Seeded " + building.getName() + " for tenant " + t.getEmail());
                }
            });
        });

        System.out.println("✨ System Ready!");
    }

    private void createTicket(Tenant tenant, Room room, Resident resident, String roomNum) {
        if (ticketRepository.findAll().stream().anyMatch(t -> t.getRoom().getId().equals(room.getId()))) return;
        Ticket ticket = new Ticket();
        ticket.setTenant(tenant);
        ticket.setRoom(room);
        ticket.setResident(resident);
        ticket.setTitle("Sự cố điều hòa phòng " + roomNum);
        ticket.setDescription("Điều hòa không mát, cần kiểm tra gas.");
        ticket.setStatus(Ticket.TicketStatus.PENDING);
        ticket.setPriority(Ticket.TicketPriority.MEDIUM);
        ticket.setCategory(Ticket.TicketCategory.APPLIANCE);
        ticketRepository.save(ticket);
    }

    private void createBill(Tenant tenant, Room room, String roomNum) {
        if (billRepository.findAll().stream().anyMatch(b -> b.getRoom().getId().equals(room.getId()))) return;
        Bill bill = new Bill();
        bill.setTenant(tenant);
        bill.setRoom(room);
        bill.setRoomNumber(roomNum);
        bill.setBillType(Bill.BillType.RENT);
        bill.setDescription("Hóa đơn tiền thuê phòng " + roomNum + " tháng này");
        bill.setAmount(BigDecimal.valueOf(room.getPrice().doubleValue() + 500000)); // Rent + utilities
        bill.setStatus(Bill.BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(5));
        billRepository.save(bill);
    }

    private void createMeterReading(Tenant tenant, Room room, MeterType type, int value) {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        if (meterReadingRepository.findAll().stream().anyMatch(m -> m.getRoom().getId().equals(room.getId()) && m.getType() == type && m.getReadingMonth() == lastMonth.getMonthValue() && m.getReadingYear() == lastMonth.getYear())) return;
        
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

    private Room createRoom(Tenant tenant, Building building, String number, int floor, double price, Room.RoomStatus status, int index) {
        Optional<Room> existing = roomRepository.findAll().stream()
                .filter(r -> r.getRoomNumber().equals(number) && r.getTenant().getId().equals(tenant.getId()))
                .findFirst();
        if (existing.isPresent()) return existing.get();

        Room room = new Room();
        room.setTenant(tenant);
        room.setBuilding(building);
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

    private Contract createContract(Tenant tenant, Room room, Resident resident, String number, double rent) {
        Optional<Contract> existing = contractRepository.findByContractNumber(number);
        if (existing.isPresent()) return existing.get();

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
        return contractRepository.save(contract);
    }
}
