package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserRegisterRequestDTO(

        @NotBlank
        String username,

        @NotBlank
        @Size(min = 6, max = 72)
        String password,

        @NotBlank
        String fullname,

        @NotNull
        UserRole role
) {
}
