package com.cadelfriul.backend.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth"; // Il nome dello schema

        return new OpenAPI()
                .info(new Info()
                        .title("API CaDelFriul - Eco-Resort & Wellness")
                        .version("1.0")
                        .description("Documentazione ufficiale delle API REST per il backend. Moduli integrati: Hospitality, Wellness, E-Commerce, E-Bike."))

                // 1. Diciamo a Swagger di applicare questo requisito di sicurezza a tutte le API
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))

                // 2. Configuriamo come deve essere fatto il bottone "Authorize" (Token JWT Bearer)
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}