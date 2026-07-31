package com.cadelfriul.backend.core.user.dto;

public class AddressRequest {

    private String street;
    private String houseNumber;
    private String city;
    private String zipCode;
    private String province;
    private String country;
    private String additionalInfo;

    public String getStreet() { return street; }

    public void setStreet(String street) { this.street = street; }

    public String getHouseNumber() { return houseNumber; }

    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getCity() { return city; }

    public void setCity(String city) { this.city = city; }

    public String getZipCode() { return zipCode; }

    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getProvince() { return province; }

    public void setProvince(String province) { this.province = province; }

    public String getCountry() { return country; }

    public void setCountry(String country) { this.country = country; }

    public String getAdditionalInfo() { return additionalInfo; }

    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
}
