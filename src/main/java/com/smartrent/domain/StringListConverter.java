package com.smartrent.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Converter: List<String> ↔ JSON text trong DB
 * Ví dụ: ["/uploads/a.jpg", "/uploads/b.jpg"] ↔ '["\/uploads\/a.jpg","\/uploads\/b.jpg"]'
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return mapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            // Nếu JSON bắt đầu bằng "[" → parse như array
            if (json.trim().startsWith("[")) {
                return mapper.readValue(json, new TypeReference<List<String>>() {});
            }
            // Nếu là single URL cũ (legacy data) → wrap vào list
            List<String> list = new ArrayList<>();
            list.add(json);
            return list;
        } catch (JsonProcessingException e) {
            // Fallback: coi như single URL
            List<String> list = new ArrayList<>();
            list.add(json);
            return list;
        }
    }
}
