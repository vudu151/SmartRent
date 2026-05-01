package com.smartrent.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogAction {
    String action(); // e.g., CREATE, UPDATE, DELETE
    String entityName(); // e.g., Room, Contract
}
