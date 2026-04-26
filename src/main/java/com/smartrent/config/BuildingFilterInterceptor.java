package com.smartrent.config;

import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class BuildingFilterInterceptor implements HandlerInterceptor {

    private final EntityManager entityManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String buildingId = request.getHeader("X-Building-Id");
        if (buildingId != null && !buildingId.trim().isEmpty() && !buildingId.equalsIgnoreCase("all")) {
            try {
                Long bId = Long.parseLong(buildingId);
                // Unwrapping the Hibernate Session from the EntityManager
                Session session = entityManager.unwrap(Session.class);
                // Enable the filter globally for the current transaction
                session.enableFilter("buildingFilter").setParameter("buildingId", bId);
            } catch (NumberFormatException e) {
                // Ignore invalid building id
            }
        }
        return true;
    }
}
