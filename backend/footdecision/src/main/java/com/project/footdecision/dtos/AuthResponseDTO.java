package com.project.footdecision.dtos;

import com.project.footdecision.models.User;
import com.project.footdecision.models.enums.UserRole;

public record AuthResponseDTO(
        String token,
        String type,
        Long expiresIn,
        UserRole role,
        String username
) {
    public static AuthResponseDTO fromEntity(User user, String token, Long expiresIn) {
        return new AuthResponseDTO(
                token,
                "Bearer",
                expiresIn,
                user.getRole(),
                user.getUsername()
        );
    }
}
