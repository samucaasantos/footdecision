package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.UserRole;

public record UserRegisterRequestDTO(
        String username,
        String password,
        String fullname,
        UserRole role
) {
}
