package com.cadelfriul.backend.core.config;

import com.cadelfriul.backend.core.user.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);
            String adminRole = jwtService.extractAdminRole(token);

            // --- SPIE DI DEBUG ---
            System.out.println("=== JWT FILTER DEBUG ===");
            System.out.println("Rotta chiamata: " + request.getRequestURI());
            System.out.println("Email estratta: " + email);
            System.out.println("Ruolo estratto: " + role);
            System.out.println("AdminRole estratto: " + adminRole);

            var authorities = new ArrayList<SimpleGrantedAuthority>();

            // Logica corazzata: se c'è l'adminRole usa quello ed ignora il role base
            if (adminRole != null && !adminRole.trim().isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + adminRole));
                System.out.println("-> Autorità assegnata: ROLE_" + adminRole);
            } else if (role != null && !role.trim().isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                System.out.println("-> Autorità assegnata: ROLE_" + role);
            } else {
                System.out.println("-> NESSUNA AUTORITA' TROVATA!");
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("========================");

        } catch (Exception e) {
            System.out.println("!!! Errore nel parsing del JWT !!! -> " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}