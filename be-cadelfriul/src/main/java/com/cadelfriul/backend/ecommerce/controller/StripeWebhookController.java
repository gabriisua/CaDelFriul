package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import com.cadelfriul.backend.hospitality.service.RoomReservationService;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final OrderRepository orderRepository;
    private final RoomReservationService roomReservationService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public StripeWebhookController(OrderRepository orderRepository, RoomReservationService roomReservationService) {
        this.orderRepository = orderRepository;
        this.roomReservationService = roomReservationService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
                                                    @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Received Stripe event: type={}, id={}", event.getType(), event.getId());

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = deserializeEventObject(event, Session.class);

                if (session != null) {
                    UUID reservationId = extractReservationId(session);
                    if (reservationId != null) {
                        boolean ok = roomReservationService.confirmReservationIfAvailable(reservationId);
                        if (!ok) {
                            log.warn("Reservation not found for webhook: {}", reservationId);
                        }
                    } else {
                        String sessionId = session.getId();
                        log.info("Processing checkout.session.completed for session: {}", sessionId);

                        orderRepository.findByStripeSessionId(sessionId)
                                .ifPresentOrElse(order -> {
                                    order.setPaymentStatus(PaymentStatus.COMPLETED);
                                    order.setStatus(OrderStatus.PAID);
                                    orderRepository.save(order);
                                    log.info("Order {} marked as PAID", order.getId());
                                }, () -> log.warn("No order found for Stripe session: {}", sessionId));
                    }
                } else {
                    log.error("Impossibile deserializzare l'oggetto Session nemmeno forzando l'operazione.");
                }
            } else if ("checkout.session.expired".equals(event.getType())) {
                Session session = deserializeEventObject(event, Session.class);

                if (session != null) {
                    UUID reservationId = extractReservationId(session);
                    if (reservationId != null) {
                        boolean ok = roomReservationService.cancelReservation(reservationId);
                        if (!ok) {
                            log.warn("Reservation not found for webhook: {}", reservationId);
                        }
                    }
                } else {
                    log.error("Impossibile deserializzare l'oggetto Session nemmeno forzando l'operazione.");
                }
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                PaymentIntent paymentIntent = deserializeEventObject(event, PaymentIntent.class);

                if (paymentIntent != null && paymentIntent.getMetadata() != null
                        && paymentIntent.getMetadata().containsKey("reservationId")) {
                    UUID reservationId = parseUuid(paymentIntent.getMetadata().get("reservationId"));
                    if (reservationId != null) {
                        boolean ok = roomReservationService.cancelReservation(reservationId);
                        if (!ok) {
                            log.warn("Reservation not found for webhook: {}", reservationId);
                        }
                    } else {
                        log.warn("Malformed reservationId in payment_intent metadata for intent: {}", paymentIntent.getId());
                    }
                }
            } else {
                log.info("Ignoring Stripe event type: {}", event.getType());
            }
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to process Stripe webhook", e);
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    private <T> T deserializeEventObject(Event event, Class<T> type) throws EventDataObjectDeserializationException {
        if (event.getDataObjectDeserializer().getObject().isPresent()) {
            return type.cast(event.getDataObjectDeserializer().getObject().get());
        }
        return type.cast(event.getDataObjectDeserializer().deserializeUnsafe());
    }

    static UUID extractReservationId(Session session) {
        if (session == null || session.getMetadata() == null) {
            return null;
        }
        return parseUuid(session.getMetadata().get("reservationId"));
    }

    private static UUID parseUuid(String value) {
        if (value == null) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
