package com.project.footdecision.services.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String username) {
        super("Recurso não encontrado. Username " + username);
    }
}
