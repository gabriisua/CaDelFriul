package com.cadelfriul.backend.ecommerce.service;

import com.cadelfriul.backend.core.user.entity.Address;
import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.repository.AddressRepository;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.ecommerce.dto.OrderItemRequest;
import com.cadelfriul.backend.ecommerce.dto.OrderItemResponse;
import com.cadelfriul.backend.ecommerce.dto.OrderRequest;
import com.cadelfriul.backend.ecommerce.dto.OrderResponse;
import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderItem;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.Product;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        AddressRepository addressRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
    }

    public OrderResponse createOrder(UUID customerId, OrderRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        Address shippingAddress = addressRepository.findByIdAndCustomerId(request.getShippingAddressId(), customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + request.getShippingAddressId() + " for customer: " + customerId));

        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(shippingAddress);

        Address billingAddress;
        if (request.getBillingAddressId() != null) {
            billingAddress = addressRepository.findByIdAndCustomerId(request.getBillingAddressId(), customerId)
                    .orElseThrow(() -> new RuntimeException("Address not found with id: " + request.getBillingAddressId() + " for customer: " + customerId));
        } else {
            billingAddress = shippingAddress;
        }
        order.setBillingAddress(billingAddress);

        // Inizializziamo il Subtotale (solo costo prodotti)
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemRequest.getProductId()));

            if (!product.isAvailable()) {
                throw new RuntimeException("Product '" + product.getName() + "' is not available");
            }

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product '" + product.getName()
                        + "': requested " + itemRequest.getQuantity()
                        + ", available " + product.getStockQuantity());
            }

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());

            // FOTOGRAFIA DEL PREZZO E DELL'IVA AL MOMENTO DELL'ACQUISTO
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItem.setVatRate(product.getVatRate());

            order.addItem(orderItem);

            // Calcolo parziale del subtotale
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        // CALCOLO DINAMICO DELLA SPEDIZIONE E DEL TOTALE FINALE
        BigDecimal shippingCost = calculateShippingCost(shippingAddress, subtotal);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(subtotal.add(shippingCost));

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    // --- NUOVO METODO HELPER PER LE REGOLE DI SPEDIZIONE ---
    private BigDecimal calculateShippingCost(Address address, BigDecimal subtotal) {
        // Se la nazione non è Italia (controlliamo sia la sigla che il nome per sicurezza)
        if (!"IT".equalsIgnoreCase(address.getCountry()) && !"Italia".equalsIgnoreCase(address.getCountry())) {
            return new BigDecimal("15.00"); // Forfait per l'estero
        }

        // Se siamo in Italia, controlliamo la soglia per la spedizione gratuita
        BigDecimal freeShippingThreshold = new BigDecimal("50.00");

        if (subtotal.compareTo(freeShippingThreshold) >= 0) {
            return BigDecimal.ZERO; // Spedizione Gratuita
        }

        // Spedizione Standard Italia
        return new BigDecimal("5.90");
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(UUID customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return toResponse(order);
    }

    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::new)
                .toList();
        return new OrderResponse(order, itemResponses);
    }
}
