package com.project.footdecision.services;

import com.project.footdecision.dtos.UserRegisterRequestDTO;
import com.project.footdecision.dtos.UserResponseDTO;
import com.project.footdecision.models.User;
import com.project.footdecision.repositories.UserRepository;
import com.project.footdecision.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDTO register(UserRegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username já em uso");
        }
        User user = new User();
        user.setUsername(request.username());

        String encodedPassword = passwordEncoder.encode(request.password());
        user.setPassword(encodedPassword);

        user.setFullname(request.fullname());
        user.setRole(request.role());

        user = userRepository.save(user);

        return UserResponseDTO.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElseThrow(() -> new ResourceNotFoundException(username));
    }

    @Override
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }
}
