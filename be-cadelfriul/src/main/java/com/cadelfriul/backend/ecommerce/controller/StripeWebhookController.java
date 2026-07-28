package com.cadelfriul.backend.ecommerce.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final OrderRepository orderRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public StripeWebhookController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/stripe")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
                                                    @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            com.stripe.model.Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Received Stripe event: type={}, id={}", event.getType(), event.getId());

            if ("checkout.session.completed".equals(event.getType())) {

                // FIX: Gestione della discrepanza di versione API Stripe
                Session session = null;
                if (event.getDataObjectDeserializer().getObject().isPresent()) {
                    session = (Session) event.getDataObjectDeserializer().getObject().get();
                } else {
                    // Forza la deserializzazione se la versione della CLI è diversa da quella dell'SDK Java
                    session = (Session) event.getDataObjectDeserializer().deserializeUnsafe();
                }

                if (session != null) {
                    String sessionId = session.getId();
                    log.info("Processing checkout.session.completed for session: {}", sessionId);

                    orderRepository.findByStripeSessionId(sessionId)
                            .ifPresentOrElse(order -> {
                                order.setPaymentStatus(PaymentStatus.COMPLETED);
                                order.setStatus(OrderStatus.PAID);
                                orderRepository.save(order);
                                log.info("Order {} marked as PAID", order.getId());
                            }, () -> log.warn("No order found for Stripe session: {}", sessionId));
                } else {
                    log.error("Impossibile deserializzare l'oggetto Session nemmeno forzando l'operazione.");
                }
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
}
