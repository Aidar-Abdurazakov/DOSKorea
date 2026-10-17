package com.doskorea.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(
                        AbstractHttpConfigurer::disable
                )

                /*
                 * Теперь Spring разрешает обычную
                 * HTTP-сессию для пользователей.
                 */
                .sessionManagement(
                        s -> s.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )

                .authorizeHttpRequests(
                        a -> a
                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole("ADMIN")

                                .anyRequest()
                                .permitAll()
                )

                /*
                 * Это старая авторизация администратора.
                 */
                .httpBasic(
                        b -> b.authenticationEntryPoint(
                                (req, res, ex) ->
                                        res.sendError(
                                                HttpStatus.UNAUTHORIZED.value()
                                        )
                        )
                )

                .headers(
                        h -> h.frameOptions(
                                Customizer.withDefaults()
                        )
                );

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    /*
     * АДМИНА НЕ МЕНЯЕМ.
     */
    @Bean
    UserDetailsService users(
            @Value("${app.admin.username}")
            String username,

            @Value("${app.admin.password}")
            String password,

            PasswordEncoder encoder
    ) {

        return new InMemoryUserDetailsManager(

                User.withUsername(username)
                        .password(
                                encoder.encode(password)
                        )
                        .roles("ADMIN")
                        .build()
        );
    }
}