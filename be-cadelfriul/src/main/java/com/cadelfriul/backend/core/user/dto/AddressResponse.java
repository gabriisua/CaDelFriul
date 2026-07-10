package com.cadelfriul.backend.core.auth.dto;

import com.cadelfriul.backend.core.auth.entity.Address;
import java.util.UUID;

public class AddressResponse {

    private final UUID id;
    private final String street;
    private final String houseNumber;
    private final String city;
    private final String zipCode;
    private final String province;
    private final String country;
    private final String additionalInfo;
    private final boolean defaultShipping;
    private final boolean defaultBilling;

    public AddressResponse(Address address) {
        this.id = address.getId();
        this.street = address.getStreet();
        this.houseNumber = address.getHouseNumber();
        this.city = address.getCity();
        this.zipCode = address.getZipCode();
        this.province = address.getProvince();
        this.country = address.getCountry();
        this.additionalInfo = address.getAdditionalInfo();
        this.defaultShipping = address.isDefaultShipping();
        this.defaultBilling = address.isDefaultBilling();
    }

    public UUID getId() { return id; }
    public String getStreet() { return street; }
    public String getHouseNumber() { return houseNumber; }
    public String getCity() { return city; }
    public String getZipCode() { return zipCode; }
    public String getProvince() { return province; }
    public String getCountry() { return country; }
    public String getAdditionalInfo() { return additionalInfo; }
    public boolean isDefaultShipping() { return defaultShipping; }
    public boolean isDefaultBilling() { return defaultBilling; }
}