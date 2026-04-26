package com.smartrent;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbCheck {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void fixUsers() {
        System.out.println("FIXING USERS...");
        
        jdbcTemplate.update("UPDATE users SET role = 'TENANT_MANAGER' WHERE email = 'tenant@gmail.com'");
        jdbcTemplate.update("UPDATE users SET role = 'TENANT' WHERE email = 'resident@gmail.com'");
        jdbcTemplate.update("UPDATE users SET role = 'GUARD' WHERE email = 'guard@gmail.com'");
        
        System.out.println("USER_LIST_START");
        List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT id, username, email, phone, role, status FROM users");
        for (Map<String, Object> u : users) {
            System.out.println(u);
        }
        System.out.println("USER_LIST_END");
    }
}
