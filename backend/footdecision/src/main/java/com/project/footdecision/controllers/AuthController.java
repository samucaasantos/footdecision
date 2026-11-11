package com.project.footdecision.controllers;

import com.project.footdecision.dtos.AuthResponseDTO;
import com.project.footdecision.dtos.LoginRequestDTO;
import com.project.footdecision.dtos.UserRegisterRequestDTO;
import com.project.footdecision.dtos.UserResponseDTO;
import com.project.footdecision.models.User;
import com.project.footdecision.services.TokenService;
import com.project.footdecision.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authManager;
    private final TokenService tokenService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(request.username(), request.password());
        var auth = authManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();
        String token = tokenService.generateToken(user);

         return ResponseEntity.ok(AuthResponseDTO.fromEntity(user, token, tokenService.getExpiration()));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRegisterRequestDTO request) {
        UserResponseDTO newUser = userService.register(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("{id}")
                .buildAndExpand(newUser.id()).toUri();
        return ResponseEntity.created(uri).body(newUser);
    }
}
