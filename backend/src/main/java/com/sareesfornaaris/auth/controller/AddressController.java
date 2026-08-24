package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.Address;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.AddressRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserAddresses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Address> addresses = addressRepository.findByUser(user);
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<?> addAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Address addressRequest) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        int count = addressRepository.countByUser(user);
        if (count >= 5) {
            return ResponseEntity.badRequest().body(new MessageResponse("Delete an existing address to add a new one. (Maximum 5 saved addresses allowed)"));
        }

        Address address = Address.builder()
                .user(user)
                .fullName(addressRequest.getFullName())
                .phone(addressRequest.getPhone())
                .addressLine1(addressRequest.getAddressLine1())
                .addressLine2(addressRequest.getAddressLine2())
                .city(addressRequest.getCity())
                .state(addressRequest.getState())
                .pincode(addressRequest.getPincode())
                .addressType(addressRequest.getAddressType() != null ? addressRequest.getAddressType() : "Home")
                .isDefault(count == 0) // First address is default
                .build();

        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Integer addressId) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to delete this address."));
        }

        addressRepository.delete(address);
        return ResponseEntity.ok(new MessageResponse("Address deleted successfully."));
    }
}
