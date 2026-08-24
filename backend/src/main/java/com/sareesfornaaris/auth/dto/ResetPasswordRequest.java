package com.sareesfornaaris.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otpCode; // can also accept reset token here

    @NotBlank
    @Size(min = 6, max = 45)
    private String newPassword;
}
