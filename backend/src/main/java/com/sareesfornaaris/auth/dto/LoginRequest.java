package com.sareesfornaaris.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username; // can be username or email

    @NotBlank
    private String password;
}
