package com.grecale.grecale_backend.exception;

/**
 * ResourceNotFoundException custom exception.
 */
public class ConfigurationException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * constructor.
     * @param message error text.
     * @param cause error cause.
     */
    public ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * constructor.
     * @param message error text.
     */
    public ConfigurationException(String message) {
        super(message);
    }

}
