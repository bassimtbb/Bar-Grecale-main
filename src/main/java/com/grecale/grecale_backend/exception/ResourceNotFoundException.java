package com.grecale.grecale_backend.exception;

/**
 * ResourceNotFoundException custom exception.
 */
public class ResourceNotFoundException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * constructor.
     * @param message error text.
     * @param cause error cause.
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * constructor.
     * @param message error text.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

}
