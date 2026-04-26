package com.smartrent.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.smartrent.repository.RoomRepository;
import java.util.List;

@Aspect
@Component
public class HibernateFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private RoomRepository roomRepository;

    @Before("execution(* com.smartrent.service.*.*(..))")
    public void enableFilter() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String buildingIdStr = request.getHeader("X-Building-Id");
            if (buildingIdStr != null && !buildingIdStr.trim().isEmpty() && !buildingIdStr.equalsIgnoreCase("all") && !buildingIdStr.equalsIgnoreCase("null")) {
                try {
                    Long buildingId = Long.parseLong(buildingIdStr);
                    Session session = entityManager.unwrap(Session.class);
                    
                    // Enable building filter for Rooms
                    session.enableFilter("buildingFilter").setParameter("buildingId", buildingId);

                    // Enable roomIds filter for other entities
                    List<Long> roomIds = roomRepository.findRoomIdsByBuildingId(buildingId);
                    if (roomIds.isEmpty()) {
                        roomIds.add(-1L); // Force empty result if no rooms exist in this building
                    }
                    session.enableFilter("roomFilter").setParameterList("roomIds", roomIds);
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
    }
}
