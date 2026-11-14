package com.project.footdecision.config;

import com.project.footdecision.models.Player;
import com.project.footdecision.models.User;
import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;
import com.project.footdecision.models.enums.UserRole;
import com.project.footdecision.repositories.PlayerRepository;
import com.project.footdecision.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;


@Configuration
@Profile({"local", "prod"})
@RequiredArgsConstructor
public class QuickFillConfig implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
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

        if (playerRepository.countByIsSquadMemberTrue() == 0) {
            List<Player> initialSquad = List.of(
                    // Goleiros (GK) - 3 atletas
                    new Player("Rafael Monteiro", Position.GK, 29, new BigDecimal("85000.00"), InjuryRisk.BAIXO),
                    new Player("Caio Valladares", Position.GK, 24, new BigDecimal("42000.00"), InjuryRisk.BAIXO),
                    new Player("Henrique Bastos", Position.GK, 33, new BigDecimal("55000.00"), InjuryRisk.MODERADO),

                    // Defensores (DF) - 10 atletas
                    new Player("Gustavo Alcântara", Position.DF, 27, new BigDecimal("110000.00"), InjuryRisk.BAIXO),
                    new Player("Matheus Ferraz", Position.DF, 25, new BigDecimal("95000.00"), InjuryRisk.BAIXO),
                    new Player("Leonardo Drumond", Position.DF, 30, new BigDecimal("125000.00"), InjuryRisk.MODERADO),
                    new Player("Felipe Nogueira", Position.DF, 22, new BigDecimal("60000.00"), InjuryRisk.BAIXO),
                    new Player("Tiago Peixoto", Position.DF, 28, new BigDecimal("88000.00"), InjuryRisk.MODERADO),
                    new Player("Rodrigo Santoro Silva", Position.DF, 31, new BigDecimal("105000.00"), InjuryRisk.ALTO),
                    new Player("Bruno Cavalcanti", Position.DF, 21, new BigDecimal("48000.00"), InjuryRisk.BAIXO),
                    new Player("Victor Hugo Almeida", Position.DF, 26, new BigDecimal("92000.00"), InjuryRisk.BAIXO),
                    new Player("Danilo Vasconcelos", Position.DF, 29, new BigDecimal("98000.00"), InjuryRisk.MODERADO),
                    new Player("Igor Mendonça", Position.DF, 23, new BigDecimal("64000.00"), InjuryRisk.BAIXO),

                    // Meio-campistas (MF) - 10 atletas
                    new Player("Gabriel Castellani", Position.MF, 26, new BigDecimal("140000.00"), InjuryRisk.BAIXO),
                    new Player("Lucas Bittencourt", Position.MF, 24, new BigDecimal("115000.00"), InjuryRisk.BAIXO),
                    new Player("André Fontenelle", Position.MF, 28, new BigDecimal("130000.00"), InjuryRisk.MODERADO),
                    new Player("Pedro Henrique Siqueira", Position.MF, 20, new BigDecimal("45000.00"), InjuryRisk.BAIXO),
                    new Player("Otávio Marcondes", Position.MF, 32, new BigDecimal("150000.00"), InjuryRisk.ALTO),
                    new Player("Vitor Lacerda", Position.MF, 25, new BigDecimal("96000.00"), InjuryRisk.BAIXO),
                    new Player("Murilo Gouveia", Position.MF, 27, new BigDecimal("108000.00"), InjuryRisk.MODERADO),
                    new Player("Enzo Silveira", Position.MF, 19, new BigDecimal("35000.00"), InjuryRisk.BAIXO),
                    new Player("Renato Albuquerque", Position.MF, 29, new BigDecimal("120000.00"), InjuryRisk.MODERADO),
                    new Player("Eduardo Tavares", Position.MF, 23, new BigDecimal("72000.00"), InjuryRisk.BAIXO),

                    // Atacantes (FW) - 7 atletas
                    new Player("Marcos Vinícius Prado", Position.FW, 25, new BigDecimal("165000.00"), InjuryRisk.BAIXO),
                    new Player("Diego Barcellos", Position.FW, 27, new BigDecimal("180000.00"), InjuryRisk.MODERADO),
                    new Player("Cauã Dornelles", Position.FW, 21, new BigDecimal("68000.00"), InjuryRisk.BAIXO),
                    new Player("Leandro Medeiros", Position.FW, 30, new BigDecimal("155000.00"), InjuryRisk.ALTO),
                    new Player("Yuri Magalhães", Position.FW, 24, new BigDecimal("112000.00"), InjuryRisk.BAIXO),
                    new Player("Arthur Queiroz", Position.FW, 22, new BigDecimal("78000.00"), InjuryRisk.MODERADO),
                    new Player("Breno Sampaio", Position.FW, 28, new BigDecimal("135000.00"), InjuryRisk.BAIXO)
            );

            playerRepository.saveAll(initialSquad);
        }
    }
}
