/**
 * ============================================
 * Script: Generate Password Hash
 * Description: Utility để tạo BCrypt hash cho password
 * Usage: java generate_password_hash.java <password>
 * ============================================
 * 
 * Ví dụ:
 *   java generate_password_hash.java admin123
 *   java generate_password_hash.java mypassword
 */

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class generate_password_hash {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java generate_password_hash.java <password>");
            System.out.println("Example: java generate_password_hash.java admin123");
            return;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args[0];
        String hash = encoder.encode(password);
        
        System.out.println("============================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("============================================");
        System.out.println("\nCopy hash này vào SQL script hoặc code của bạn.");
    }
}
