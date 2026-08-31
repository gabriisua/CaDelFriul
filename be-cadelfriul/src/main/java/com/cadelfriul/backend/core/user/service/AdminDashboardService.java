package com.cadelfriul.backend.core.user.service;

import com.cadelfriul.backend.ecommerce.dto.AdminDashboardResponse;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.repository.RoomReservationRepository;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.core.user.repository.AdminRepository; // Usa il nome corretto del tuo repo staff
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    // Costruttore per injection...
    public AdminDashboardService(OrderRepository orderRepository, RoomReservationRepository roomReservationRepository, CustomerRepository customerRepository, AdminRepository adminRepository) {
        this.orderRepository = orderRepository;
        this.roomReservationRepository = roomReservationRepository;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
    }

    public AdminDashboardResponse getDashboardStats() {
        long totalOrders = orderRepository.countValidOrders(OrderStatus.CANCELLED);

        BigDecimal orderRevenue = orderRepository.sumCompletedOrdersRevenue(PaymentStatus.COMPLETED);

        // Passiamo l'Enum della prenotazione
        BigDecimal reservationRevenue = roomReservationRepository.sumConfirmedReservationsRevenue(ReservationStatus.CONFIRMED);

        BigDecimal totalRevenue = orderRevenue.add(reservationRevenue);

        long customers = customerRepository.count();
        long activeStaff = adminRepository.count();

        return new AdminDashboardResponse(totalOrders, totalRevenue, activeStaff, customers);
    }
}