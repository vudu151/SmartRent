package com.smartrent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for SmartRent Backend
 * 
 * @author SmartRent Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class SmartRentApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartRentApplication.class, args);
    }
}
