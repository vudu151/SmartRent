package com.smartrent.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email Service
 * Handles sending emails (password reset, notifications, etc.)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/auth/reset-password?token=" + resetToken;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Đặt lại mật khẩu SmartRent");
            message.setText(buildPasswordResetEmailContent(resetLink));
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.", e);
        }
    }

    /**
     * Send email with attachment
     */
    public void sendEmailWithAttachment(String toEmail, String subject, String body, byte[] attachment, String fileName) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML format if needed, but plain text is fine too if we don't put HTML tags

            // Add the attachment
            org.springframework.core.io.ByteArrayResource byteArrayResource = new org.springframework.core.io.ByteArrayResource(attachment);
            helper.addAttachment(fileName, byteArrayResource);

            mailSender.send(message);
            log.info("Email with attachment sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send email with attachment to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng kiểm tra lại.", e);
        }
    }

    /**
     * Build password reset email content
     */
    private String buildPasswordResetEmailContent(String resetLink) {
        return "Xin chào,\n\n" +
               "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản SmartRent của bạn.\n\n" +
               "Vui lòng click vào link sau để đặt lại mật khẩu:\n" +
               resetLink + "\n\n" +
               "Link này sẽ hết hạn sau 1 giờ.\n\n" +
               "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
               "Trân trọng,\n" +
               "Đội ngũ SmartRent";
    }
}
