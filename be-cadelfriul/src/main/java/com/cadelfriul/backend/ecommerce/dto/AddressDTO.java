package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.core.user.entity.Address;
import java.util.UUID;

public class AddressDTO {
    private UUID id;
    private String street;
    private String houseNumber;
    private String city;
    private String zipCode;
    private String province;
    private String country;
    private String additionalInfo;

    public AddressDTO(Address address) {
        this.id = address.getId();
        this.street = address.getStreet();
        this.houseNumber = address.getHouseNumber();
        this.city = address.getCity();
        this.zipCode = address.getZipCode();
        this.province = address.getProvince();
        this.country = address.getCountry();
        this.additionalInfo = address.getAdditionalInfo();
    }

    public UUID getId() { return id; }
    public String getStreet() { return street; }
    public String getHouseNumber() { return houseNumber; }
    public String getCity() { return city; }
    public String getZipCode() { return zipCode; }
    public String getProvince() { return province; }
    public String getCountry() { return country; }
    public String getAdditionalInfo() { return additionalInfo; }
}
