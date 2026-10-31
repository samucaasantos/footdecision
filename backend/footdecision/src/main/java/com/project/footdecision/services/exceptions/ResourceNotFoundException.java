package com.project.footdecision.services.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String username) {
        super("Recurso não encontrado. Username " + username);
    }

    public ResourceNotFoundException(Long id) {
        super("Recurso não encontrado. Id " + id);
    }
}
