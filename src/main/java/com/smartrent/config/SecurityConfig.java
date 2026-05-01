package com.smartrent.config;

import com.smartrent.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security Configuration
 * Configures JWT authentication, CORS, and security filters
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/api/health",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/forgot-password",
                    "/api/auth/google",
                    "/api/portal/**",
                    "/uploads/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                // Tenant specific endpoints
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/me", "/api/users/me/portal").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_TENANT_MANAGER", "ROLE_GUARD", "ROLE_TENANT")

                // GUARD has limited read-only permissions
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/residents/**", "/api/tickets/**", "/api/users/**", "/api/vehicles/**", "/api/rooms/**", "/api/notifications/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_TENANT_MANAGER", "ROLE_GUARD")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/tickets/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_TENANT_MANAGER", "ROLE_GUARD")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/tickets/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_TENANT_MANAGER", "ROLE_GUARD")
                
                // Manager and Admin have full access to these financial / core modules
                .requestMatchers("/api/bills/**", "/api/contracts/**", "/api/rooms/**", "/api/assets/**", "/api/services/**", "/api/tenants/**", "/api/vehicles/**", "/api/reports/**", "/api/dashboard/**", "/api/audit-logs/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_TENANT_MANAGER")

                // Admin exclusive (system settings, etc if any)
                // .requestMatchers("/api/admin/**").hasAuthority("ROLE_SUPER_ADMIN")
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
