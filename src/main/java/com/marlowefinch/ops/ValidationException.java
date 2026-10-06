package com.marlowefinch.ops;

import java.util.List;

/** Thrown when request parameters are invalid; rendered as a 400 by {@link ApiExceptionHandler}. */
public class ValidationException extends RuntimeException {

    private final List<String> errors;

    public ValidationException(List<String> errors) {
        super(String.join("; ", errors));
        this.errors = List.copyOf(errors);
    }

    public List<String> errors() {
        return errors;
    }
}
