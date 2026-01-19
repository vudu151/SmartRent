# Hướng Dẫn Phát Triển - SmartRent

## 1. Yêu Cầu Hệ Thống

### 1.1 Backend
- **Java**: 17 hoặc cao hơn
- **Maven**: 3.8+
- **PostgreSQL**: 14+
- **IDE**: IntelliJ IDEA / Eclipse / VS Code

### 1.2 Frontend
- **Node.js**: 18+
- **npm/yarn**: Latest
- **IDE**: VS Code (khuyến nghị)

## 2. Setup Môi Trường Phát Triển

### 2.1 Clone Repository

```bash
git clone <repository-url>
cd SmartRent
```

### 2.2 Setup Backend

```bash
# Chuyển sang nhánh BE
git checkout BE

# Tạo database
createdb smartrent_dev

# Cấu hình database trong application.properties
# src/main/resources/application.properties

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 2.3 Setup Frontend

```bash
# Chuyển sang nhánh FE
git checkout FE

# Cài đặt dependencies
npm install
# hoặc
yarn install

# Chạy development server
npm run dev
# hoặc
yarn dev
```

Frontend sẽ chạy tại: `http://localhost:3000` (hoặc port khác)

### 2.4 Setup Database

```bash
# Tạo database
createdb smartrent_dev

# Chạy migrations (nếu dùng Flyway)
mvn flyway:migrate
```

## 3. Cấu Trúc Dự Án

### 3.1 Backend Structure

```
BE/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/smartrent/
│   │   │       ├── SmartRentApplication.java
│   │   │       ├── config/
│   │   │       ├── domain/
│   │   │       ├── repository/
│   │   │       ├── service/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── mapper/
│   │   │       ├── security/
│   │   │       └── exception/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── db/migration/ (Flyway)
│   └── test/
├── pom.xml
└── README.md
```

### 3.2 Frontend Structure

```
FE/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   └── App.tsx
├── public/
├── package.json
└── README.md
```

## 4. Coding Standards

### 4.1 Backend (Java)

#### Naming Conventions
- **Classes**: PascalCase (`UserService`, `RoomController`)
- **Methods**: camelCase (`getRooms`, `createContract`)
- **Variables**: camelCase (`tenantId`, `roomNumber`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

#### Code Style
- Sử dụng 4 spaces cho indentation
- Maximum line length: 120 characters
- Luôn có JavaDoc cho public methods
- Sử dụng `@Override` annotation

#### Example:

```java
/**
 * Service for managing rooms
 */
@Service
@Transactional
public class RoomService {
    
    private final RoomRepository roomRepository;
    
    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
    
    /**
     * Get all rooms for current tenant
     * @return List of rooms
     */
    public List<RoomDTO> getRooms() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return roomRepository.findByTenantId(tenantId)
            .stream()
            .map(RoomMapper::toDTO)
            .collect(Collectors.toList());
    }
}
```

### 4.2 Frontend (TypeScript/React)

#### Naming Conventions
- **Components**: PascalCase (`RoomList.tsx`, `InvoiceForm.tsx`)
- **Functions**: camelCase (`getRooms`, `handleSubmit`)
- **Variables**: camelCase (`tenantId`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

#### Code Style
- Sử dụng 2 spaces cho indentation
- Maximum line length: 100 characters
- Sử dụng TypeScript cho type safety
- Functional components với hooks

#### Example:

```typescript
interface RoomListProps {
  buildingId?: number;
  onRoomSelect: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ 
  buildingId, 
  onRoomSelect 
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [buildingId]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRooms({ buildingId });
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <RoomGrid rooms={rooms} onSelect={onRoomSelect} />
      )}
    </div>
  );
};
```

## 5. Git Workflow

### 5.1 Branch Strategy

- **main**: Production code
- **BE**: Backend development
- **FE**: Frontend development
- **feature/***: Feature branches
- **bugfix/***: Bug fix branches

### 5.2 Commit Messages

Format: `[type] <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat: Add room management API
fix: Fix invoice calculation bug
docs: Update API documentation
refactor: Refactor user service
```

### 5.3 Pull Request Process

1. Tạo feature branch từ BE hoặc FE
2. Commit changes với messages rõ ràng
3. Push và tạo Pull Request
4. Code review
5. Merge sau khi approved

## 6. Testing

### 6.1 Backend Testing

#### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class RoomServiceTest {
    
    @Mock
    private RoomRepository roomRepository;
    
    @InjectMocks
    private RoomService roomService;
    
    @Test
    void shouldGetRoomsForCurrentTenant() {
        // Given
        Long tenantId = 1L;
        when(roomRepository.findByTenantId(tenantId))
            .thenReturn(Collections.singletonList(new Room()));
        
        // When
        List<RoomDTO> result = roomService.getRooms();
        
        // Then
        assertThat(result).hasSize(1);
    }
}
```

#### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class RoomControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldGetRooms() throws Exception {
        mockMvc.perform(get("/api/rooms")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
```

### 6.2 Frontend Testing

#### Unit Tests (Jest + React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import { RoomList } from './RoomList';

describe('RoomList', () => {
  it('should render rooms', () => {
    const rooms = [
      { id: 1, roomNumber: '101', price: 2000000 }
    ];
    
    render(<RoomList rooms={rooms} />);
    
    expect(screen.getByText('101')).toBeInTheDocument();
  });
});
```

## 7. Database Migrations

### 7.1 Flyway

Tạo migration file:
```
V1__Create_tenants_table.sql
V2__Create_users_table.sql
V3__Create_buildings_table.sql
```

### 7.2 Migration Best Practices

- Mỗi migration chỉ làm một việc
- Không sửa migration đã chạy (tạo migration mới)
- Test migration trên dev trước
- Backup database trước khi chạy migration

## 8. Environment Variables

### 8.1 Backend (.env hoặc application.properties)

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/smartrent_dev
spring.datasource.username=postgres
spring.datasource.password=password

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-password
```

### 8.2 Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=SmartRent
```

## 9. Debugging

### 9.1 Backend

- Sử dụng IDE debugger
- Logging với SLF4J + Logback
- Spring Boot Actuator cho health checks

### 9.2 Frontend

- React DevTools
- Redux DevTools
- Browser DevTools
- Console logging

## 10. Performance Optimization

### 10.1 Backend

- Connection pooling (HikariCP)
- Query optimization
- Caching (Redis)
- Async processing cho heavy tasks

### 10.2 Frontend

- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## 11. Security Best Practices

### 11.1 Backend

- Luôn validate input
- Sử dụng parameterized queries
- Hash passwords (BCrypt)
- JWT token expiration
- CORS configuration
- Rate limiting

### 11.2 Frontend

- Không lưu sensitive data trong localStorage
- Validate input phía client
- Sanitize user input
- HTTPS trong production

## 12. Deployment

### 12.1 Backend

```bash
# Build
mvn clean package

# Run
java -jar target/smartrent-0.0.1-SNAPSHOT.jar
```

### 12.2 Frontend

```bash
# Build
npm run build

# Deploy dist/ folder
```

## 13. Troubleshooting

### Common Issues

#### Database Connection Error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra credentials trong application.properties
- Kiểm tra firewall

#### CORS Error
- Cấu hình CORS trong Spring Boot
- Kiểm tra API base URL

#### JWT Token Expired
- Refresh token
- Đăng nhập lại

## 14. Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 15. Getting Help

- Tạo issue trên GitHub
- Liên hệ team qua Slack/Email
- Xem documentation trong `/docs`
