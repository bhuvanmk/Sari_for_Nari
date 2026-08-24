package com.sareesfornaaris.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 45)
    private String username;

    @NotBlank
    @Size(max = 45)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 45)
    private String password;

    @NotBlank
    private String role; // "ADMIN", "USER", "SELLER"
}
