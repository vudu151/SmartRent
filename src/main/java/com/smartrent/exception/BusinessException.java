package com.smartrent.exception;

import lombok.Getter;

/**
 * Exception thrown for business logic errors
 */
@Getter
public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        super(message);
        this.code = "BUSINESS_ERROR";
    }
}
