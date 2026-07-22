package com.cadelfriul.backend.core.config; // <-- Assicurati che il package sia quello giusto!

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Calcola il percorso assoluto della cartella uploads sul tuo Mac/Server
        String uploadPath = Paths.get("uploads").toAbsolutePath().toUri().toString();

        // Crea il ponte: Tutto ciò che viene richiesto su /api/rooms/...
        // verrà pescato fisicamente dalla cartella uploads/rooms/
        registry.addResourceHandler("/api/rooms/**")
                .addResourceLocations(uploadPath + "rooms/");

        // (Opzionale) Se ti serve anche per i prodotti:
        registry.addResourceHandler("/api/products/images/**")
                .addResourceLocations(uploadPath + "products/");
    }
}