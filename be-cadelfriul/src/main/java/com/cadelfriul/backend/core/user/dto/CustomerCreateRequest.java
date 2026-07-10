package com.cadelfriul.backend.core.auth.dto;

public class CustomerCreateRequest {

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private AddressRequest shippingAddress;
    private AddressRequest billingAddress;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public AddressRequest getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(AddressRequest shippingAddress) { this.shippingAddress = shippingAddress; }

    public AddressRequest getBillingAddress() { return billingAddress; }
    public void setBillingAddress(AddressRequest billingAddress) { this.billingAddress = billingAddress; }
}
