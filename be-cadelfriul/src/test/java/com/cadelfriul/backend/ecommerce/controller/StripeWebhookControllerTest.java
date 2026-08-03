package com.cadelfriul.backend.ecommerce.controller;

import com.stripe.model.checkout.Session;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class StripeWebhookControllerTest {

    private static final String VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

    @Test
    void extractReservationId_returnsUuidFromMetadata() {
        Session session = sessionWithMetadata(VALID_UUID);

        assertEquals(UUID.fromString(VALID_UUID), StripeWebhookController.extractReservationId(session));
    }

    @Test
    void extractReservationId_returnsNullWithoutMetadata() {
        Session session = new Session();

        assertNull(StripeWebhookController.extractReservationId(session));
    }

    @Test
    void extractReservationId_returnsNullForMalformedValue() {
        Session session = sessionWithMetadata("not-a-uuid");

        assertNull(StripeWebhookController.extractReservationId(session));
    }

    @Test
    void extractReservationId_returnsNullForNullSession() {
        assertNull(StripeWebhookController.extractReservationId(null));
    }

    // --- helpers ---

    private Session sessionWithMetadata(String reservationId) {
        Session session = new Session();
        session.setMetadata(Map.of("reservationId", reservationId));
        return session;
    }
}
