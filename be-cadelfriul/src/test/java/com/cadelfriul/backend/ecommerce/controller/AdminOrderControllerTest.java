package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.ecommerce.dto.OrderItemResponse;
import com.cadelfriul.backend.ecommerce.dto.OrderResponse;
import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderItem;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.Product;
import com.cadelfriul.backend.core.user.entity.Address;
import com.cadelfriul.backend.core.user.entity.Customer;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests verifying that OrderResponse and OrderItemResponse correctly
 * map and return order items. These tests do not require a Spring context
 * or database — they validate the DTO contract in isolation.
 */
class AdminOrderControllerTest {

    @Test
    void orderItemResponse_shouldMapAllFieldsFromOrderItem() {
        UUID productId = UUID.randomUUID();
        Product product = new Product();
        product.setName("Prosecco DOC");
        product.setPrice(new BigDecimal("12.50"));
        setField(product, "id", productId);

        UUID itemId = UUID.randomUUID();
        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setQuantity(3);
        orderItem.setPriceAtPurchase(new BigDecimal("12.50"));
        setField(orderItem, "id", itemId);

        OrderItemResponse response = new OrderItemResponse(orderItem);

        assertNotNull(response.getId(), "item ID should be set");
        assertEquals(productId, response.getProductId());
        assertEquals("Prosecco DOC", response.getProductName());
        assertEquals(3, response.getQuantity());
        assertEquals(new BigDecimal("12.50"), response.getPriceAtPurchase());
        assertEquals(new BigDecimal("37.50"), response.getLineTotal(), "lineTotal = price * quantity");
    }

    @Test
    void orderResponse_shouldContainItemsList() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID addressId = UUID.randomUUID();

        Order order = createOrder(orderId, customerId, addressId);

        // Build two items
        OrderItemResponse item1 = buildItemResponse("Prosecco DOC", 2, new BigDecimal("12.50"));
        OrderItemResponse item2 = buildItemResponse("Montepulciano", 1, new BigDecimal("18.00"));

        OrderResponse response = new OrderResponse(order, List.of(item1, item2));

        assertNotNull(response.getItems(), "items list should not be null");
        assertEquals(2, response.getItems().size(), "should contain 2 items");
        assertEquals("Prosecco DOC", response.getItems().get(0).getProductName());
        assertEquals("Montepulciano", response.getItems().get(1).getProductName());
        assertEquals(orderId, response.getId());
        assertEquals(customerId, response.getCustomerId());
        assertEquals(addressId, response.getShippingAddressId());
    }

    @Test
    void orderResponse_shouldHandleEmptyItemsList() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID addressId = UUID.randomUUID();

        Order order = createOrder(orderId, customerId, addressId);

        OrderResponse response = new OrderResponse(order, List.of());

        assertNotNull(response.getItems(), "items list should not be null");
        assertTrue(response.getItems().isEmpty(), "items list should be empty");
    }

    @Test
    void eagerFetchType_onOrderItems_shouldBeSet() {
        // Verify that Order.items uses FetchType.EAGER so items are always loaded
        try {
            var field = Order.class.getDeclaredField("items");
            var annotation = field.getAnnotation(jakarta.persistence.OneToMany.class);
            assertNotNull(annotation, "@OneToMany annotation should exist on items field");
            assertEquals(jakarta.persistence.FetchType.EAGER, annotation.fetch(),
                    "items should use FetchType.EAGER to guarantee loading in admin endpoints");
        } catch (NoSuchFieldException e) {
            fail("Order entity should have an 'items' field");
        }
    }

    // --- helpers ---

    private OrderItemResponse buildItemResponse(String productName, int qty, BigDecimal price) {
        UUID productId = UUID.randomUUID();
        Product product = new Product();
        product.setName(productName);
        product.setPrice(price);
        setField(product, "id", productId);

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(qty);
        item.setPriceAtPurchase(price);
        setField(item, "id", UUID.randomUUID());

        return new OrderItemResponse(item);
    }

    private Order createOrder(UUID orderId, UUID customerId, UUID addressId) {
        Customer customer = new Customer();
        customer.setEmail("test@example.com");
        setField(customer, "id", customerId);

        Address address = new Address();
        setField(address, "id", addressId);

        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(address);
        order.setTotalAmount(new BigDecimal("43.00"));
        order.setStatus(OrderStatus.PENDING);
        setField(order, "id", orderId);

        return order;
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            var field = findField(target.getClass(), fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field '" + fieldName + "' on " + target.getClass().getSimpleName(), e);
        }
    }

    private java.lang.reflect.Field findField(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }
}
