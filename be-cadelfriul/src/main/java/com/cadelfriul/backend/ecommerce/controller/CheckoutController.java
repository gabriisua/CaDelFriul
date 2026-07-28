package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.ecommerce.dto.CheckoutResponse;
import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import com.cadelfriul.backend.ecommerce.service.StripePaymentService;
import com.stripe.model.checkout.Session;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Checkout", description = "Stripe Checkout integration")
public class CheckoutController {

    private final OrderRepository orderRepository;
    private final StripePaymentService stripePaymentService;

    public CheckoutController(OrderRepository orderRepository,
                              StripePaymentService stripePaymentService) {
        this.orderRepository = orderRepository;
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping("/{orderId}/checkout")
    @Operation(summary = "Checkout with Stripe", description = "Redirect an existing order to Stripe Checkout")
    public ResponseEntity<CheckoutResponse> checkout(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Order payment is not pending (current status: " + order.getPaymentStatus() + ")");
        }

        try {
            Session session = stripePaymentService.createCheckoutSession(order);
            order.setStripeSessionId(session.getId());
            orderRepository.save(order);

            return ResponseEntity.ok(new CheckoutResponse(order.getId(), session.getUrl()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Stripe checkout session: " + e.getMessage());
        }
    }
}
