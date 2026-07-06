package com.cadelfriul.backend.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disabilita i controlli incrociati per testare le API
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Apre tutte le porte a tutti (solo per lo sviluppo!)
                );

        return http.build();
    }
}