package com.cadelfriul.backend.core.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API CaDelFriul - Eco-Resort & Wellness")
                        .version("1.0")
                        .description("Documentazione ufficiale delle API REST per il backend. Moduli integrati: Hospitality, Wellness, E-Commerce, E-Bike."));
    }
}