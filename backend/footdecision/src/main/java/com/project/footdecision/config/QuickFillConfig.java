package com.project.footdecision.config;

import com.project.footdecision.models.User;
import com.project.footdecision.models.enums.UserRole;
import com.project.footdecision.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
@Profile({"local", "prod"})
@RequiredArgsConstructor
public class QuickFillConfig implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) throws Exception {

        if (!userRepository.existsByUsername("lucca_martinelli")) {
            String encodedPassword1 = passwordEncoder.encode("assrendnehn123");
            User director = new User(null, "lucca_martinelli", encodedPassword1, "Lucas Alfredo da cunha martinelli", UserRole.ROLE_DIRECTOR);
            userRepository.save(director);
        }

        if (!userRepository.existsByUsername("rodrigo_faria")) {
            String encodedPassword2 = passwordEncoder.encode("qwx34@%3@aafgh");
            User analyst = new User(null, "rodrigo_faria", encodedPassword2, "Rodrigo Andrade de Albuquerque Faria", UserRole.ROLE_ANALYST);
            userRepository.save(analyst);
        }
    }
}
