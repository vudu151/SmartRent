package com.smartrent.dto.resident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateResidentRequest {
    private String fullName;
    private String email;
    private String phone;
    private String idCard;
    private LocalDate dateOfBirth;
    private String gender;
    private String idCardImageUrl;
    private String avatarUrl;
    private java.util.List<String> imageUrls;
    private String status;
    private String notes;
    private Set<Long> roomIds;
}
