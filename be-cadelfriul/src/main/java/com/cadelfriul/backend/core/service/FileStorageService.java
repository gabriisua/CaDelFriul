package com.cadelfriul.backend.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path baseDir;

    public FileStorageService(@Value("${app.storage.base-dir:uploads}") String baseDir) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
    }

    /**
     * Store a file under {baseDir}/{domain}/{entityId}/{uniqueFilename}.
     * Returns the relative URL path: /api/{domain}/{entityId}/images/{uniqueFilename}
     */
    public String storeFile(String domain, UUID entityId, byte[] fileData, String contentType, String originalFilename) {
        try {
            Path domainDir = baseDir.resolve(domain).resolve(entityId.toString());
            Files.createDirectories(domainDir);

            String safeFilename = sanitizeFilename(originalFilename);
            String uniqueFilename = UUID.randomUUID() + "_" + safeFilename;
            Path filePath = domainDir.resolve(uniqueFilename);

            Files.write(filePath, fileData);

            return "/api/" + domain + "/" + entityId + "/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    /**
     * Load a file from {baseDir}/{domain}/{entityId}/{filename}.
     * Returns null if the file does not exist or the path is invalid.
     */
    public Resource loadFile(String domain, UUID entityId, String filename) {
        try {
            Path filePath;
            if (entityId != null) {
                filePath = baseDir.resolve(domain).resolve(entityId.toString()).resolve(filename);
            } else {
                // Fallback: search all entity directories for this filename (for backward compat)
                filePath = baseDir.resolve(domain).resolve(filename);
            }

            filePath = filePath.normalize();
            verifyPathInsideBase(filePath);

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            return null;
        } catch (MalformedURLException | SecurityException e) {
            return null;
        }
    }

    /**
     * Delete a file from {baseDir}/{domain}/{entityId}/{filename} if it exists.
     */
    public void deleteFile(String domain, UUID entityId, String filename) {
        try {
            Path filePath = baseDir.resolve(domain).resolve(entityId.toString()).resolve(filename).normalize();
            verifyPathInsideBase(filePath);
            Files.deleteIfExists(filePath);
        } catch (IOException | SecurityException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    /**
     * Sanitize the original filename to prevent path traversal.
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        // Strip any path components, keep only the file name
        String safe = Paths.get(filename).getFileName().toString();
        // Remove path traversal sequences
        safe = safe.replace("..", "_");
        safe = safe.replace("/", "_");
        safe = safe.replace("\\", "_");
        return safe;
    }

    /**
     * Verify that the resolved path is inside the base directory.
     * This prevents path traversal attacks.
     */
    private void verifyPathInsideBase(Path filePath) {
        if (!filePath.startsWith(baseDir)) {
            throw new SecurityException("Path traversal attempt detected: " + filePath);
        }
    }
}
