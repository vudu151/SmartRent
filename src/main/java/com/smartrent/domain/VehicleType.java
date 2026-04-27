package com.smartrent.domain;

import java.math.BigDecimal;

/**
 * Enum representing Vehicle Types with Vietnamese labels and default monthly fees
 */
public enum VehicleType {
    MOTORBIKE("Xe máy", new BigDecimal("100000")),
    CAR("Ô tô", new BigDecimal("500000")),
    BICYCLE("Xe đạp", new BigDecimal("30000")),
    ELECTRIC_BICYCLE("Xe đạp điện", new BigDecimal("70000"));

    private final String label;
    private final BigDecimal defaultFee;

    VehicleType(String label, BigDecimal defaultFee) {
        this.label = label;
        this.defaultFee = defaultFee;
    }

    public String getLabel() {
        return label;
    }

    public BigDecimal getDefaultFee() {
        return defaultFee;
    }
}
