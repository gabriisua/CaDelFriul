package com.cadelfriul.backend.ecommerce.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.cadelfriul.backend.ecommerce.entity.Order;
import org.springframework.stereotype.Service;

@Service
public class StripePaymentService {

    public Session createCheckoutSession(Order order) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/shop/success")
                .setCancelUrl("http://localhost:3000/shop/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount(order.getTotalAmount().movePointRight(2).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Ca' Del Friul - Order")
                                        .build())
                                .build())
                        .setQuantity(1L)
                        .build())
                .build();

        return Session.create(params);
    }
}
