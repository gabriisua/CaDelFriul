# Quick Task 260708-lwc: Implement Address management system

## Tasks

1. Create AddressRepository (JpaRepository for Address entity)
2. Create AddressService with methods: addAddress, getAddressesByCustomerId, updateAddress, deleteAddress, setDefaultShipping, setDefaultBilling
3. Create AddressController at /api/customers/{customerId}/addresses with POST, GET, PUT, DELETE, PATCH endpoints protected by @PreAuthorize
