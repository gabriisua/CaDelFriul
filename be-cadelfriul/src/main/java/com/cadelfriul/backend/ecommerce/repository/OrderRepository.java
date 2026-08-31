package com.cadelfriul.backend.ecommerce.repository;

import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(UUID customerId);

    long countByCustomerIdAndStatusNotIn(UUID customerId, List<OrderStatus> statuses);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    Optional<Order> findByStripeSessionId(String stripeSessionId);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.shippingAddress " +
           "LEFT JOIN FETCH o.billingAddress " +
           "WHERE o.customer.id = :customerId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdWithDetails(@Param("customerId") UUID customerId);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.shippingAddress " +
           "LEFT JOIN FETCH o.billingAddress " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetails();

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.shippingAddress " +
           "LEFT JOIN FETCH o.billingAddress " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") UUID orderId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status != :status")
    long countValidOrders(@Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :status")
    BigDecimal sumCompletedOrdersRevenue(@Param("status") PaymentStatus status);
}
