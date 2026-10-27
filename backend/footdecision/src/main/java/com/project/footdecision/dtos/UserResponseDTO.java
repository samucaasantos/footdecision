package com.project.footdecision.dtos;

import com.project.footdecision.models.User;
import com.project.footdecision.models.enums.UserRole;

public record UserResponseDTO(
        Long id,
        String username,
        String fullname,
        UserRole role
) {
    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getFullname(),
                user.getRole()
        );
    }
}
