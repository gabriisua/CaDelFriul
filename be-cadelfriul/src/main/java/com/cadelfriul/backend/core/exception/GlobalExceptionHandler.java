package com.cadelfriul.backend.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Intercetta tutte le RuntimeException lanciate dai tuoi Service
     * (es. "Utente già esistente", "ID non trovato").
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessExceptions(RuntimeException ex, WebRequest request) {

        // Un piccolo trucco per differenziare 404 da 400 basandoci sul testo dell'errore
        HttpStatus status = ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(), // Il tuo messaggio chiaro (es. "Email già in uso")
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(response, status);
    }

    /**
     * Intercetta le prenotazioni non disponibili (overlap CONFIRMED o stanza archiviata).
     * Restituisce 409 CONFLICT con il messaggio dell'eccezione.
     */
    @ExceptionHandler(RoomNotAvailableException.class)
    public ResponseEntity<ApiErrorResponse> handleRoomNotAvailable(RoomNotAvailableException ex, WebRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(response, status);
    }

    /**
     * Intercetta TUTTO il resto. I veri errori 500 (NullPointerException, DB irraggiungibile).
     * Nasconde l'errore reale al cliente per sicurezza e restituisce un messaggio generico.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAllOtherExceptions(Exception ex, WebRequest request) {

        // Qui potresti in futuro aggiungere un logger (es. log.error("Errore critico", ex); )
        ex.printStackTrace();

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Si è verificato un errore imprevisto. Contatta l'assistenza.",
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}