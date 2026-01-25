package com.smartrent.util;

/**
 * Utility class for password operations
 * This can be used to generate password hashes for initial data setup
 */
public class PasswordUtil {

    /**
     * Generate BCrypt hash for a password
     * This is a utility method that can be used in development/testing
     * 
     * Usage example:
     * PasswordEncoder encoder = new BCryptPasswordEncoder();
     * String hash = encoder.encode("your-password");
     * System.out.println(hash);
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: PasswordUtil <password>");
            System.out.println("Example: PasswordUtil admin123");
            return;
        }

        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        
        String password = args[0];
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
    }
}