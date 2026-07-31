package com.cadelfriul.backend.core.user.service;

import com.cadelfriul.backend.core.user.dto.AddressRequest;
import com.cadelfriul.backend.core.user.dto.AddressResponse;
import com.cadelfriul.backend.core.user.entity.Address;
import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.repository.AddressRepository;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    public AddressService(AddressRepository addressRepository,
                          CustomerRepository customerRepository) {
        this.addressRepository = addressRepository;
        this.customerRepository = customerRepository;
    }

    public AddressResponse addAddress(UUID customerId, AddressRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        Address address = toAddress(request);
        address.setCustomer(customer);

        long addressCount = addressRepository.countByCustomerId(customerId);
        if (addressCount == 0) {
            address.setDefaultShipping(true);
            address.setDefaultBilling(true);
        }

        address = addressRepository.save(address);
        return new AddressResponse(address);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByCustomerId(UUID customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException("Customer not found with id: " + customerId);
        }
        return addressRepository.findByCustomerId(customerId)
                .stream()
                .map(AddressResponse::new)
                .toList();
    }

    public AddressResponse updateAddress(UUID customerId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        applyAddressRequest(address, request);
        address = addressRepository.save(address);
        return new AddressResponse(address);
    }

    public void deleteAddress(UUID customerId, UUID addressId) {
        Address address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        long addressCount = addressRepository.countByCustomerId(customerId);
        if (addressCount <= 1) {
            throw new RuntimeException("Cannot delete the only address of the customer");
        }

        boolean wasDefaultShipping = address.isDefaultShipping();
        boolean wasDefaultBilling = address.isDefaultBilling();

        addressRepository.delete(address);

        if (wasDefaultShipping || wasDefaultBilling) {
            List<Address> remaining = addressRepository.findByCustomerId(customerId);
            if (!remaining.isEmpty()) {
                if (wasDefaultShipping) {
                    remaining.getFirst().setDefaultShipping(true);
                }
                if (wasDefaultBilling) {
                    remaining.getFirst().setDefaultBilling(true);
                }
                addressRepository.saveAll(remaining);
            }
        }
    }

    public AddressResponse setDefaultShipping(UUID customerId, UUID addressId) {
        Address target = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        List<Address> customerAddresses = addressRepository.findByCustomerId(customerId);
        for (Address addr : customerAddresses) {
            addr.setDefaultShipping(addr.getId().equals(addressId));
        }
        addressRepository.saveAll(customerAddresses);

        return new AddressResponse(target);
    }

    public AddressResponse setDefaultBilling(UUID customerId, UUID addressId) {
        Address target = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        List<Address> customerAddresses = addressRepository.findByCustomerId(customerId);
        for (Address addr : customerAddresses) {
            addr.setDefaultBilling(addr.getId().equals(addressId));
        }
        addressRepository.saveAll(customerAddresses);

        return new AddressResponse(target);
    }

    private Address toAddress(AddressRequest request) {
        Address address = new Address();
        address.setStreet(request.getStreet());
        address.setHouseNumber(request.getHouseNumber());
        address.setCity(request.getCity());
        address.setZipCode(request.getZipCode());
        address.setProvince(request.getProvince());
        address.setCountry(request.getCountry());
        address.setAdditionalInfo(request.getAdditionalInfo());
        return address;
    }

    private void applyAddressRequest(Address address, AddressRequest request) {
        if (request.getStreet() != null) address.setStreet(request.getStreet());
        if (request.getHouseNumber() != null) address.setHouseNumber(request.getHouseNumber());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getZipCode() != null) address.setZipCode(request.getZipCode());
        if (request.getProvince() != null) address.setProvince(request.getProvince());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getAdditionalInfo() != null) address.setAdditionalInfo(request.getAdditionalInfo());
    }
}
