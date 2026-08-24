package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.*;
import com.sareesfornaaris.auth.entity.*;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.*;
import com.sareesfornaaris.auth.service.AuthService;
import com.sareesfornaaris.auth.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        Role userRole = Role.USER;
        try {
            userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
            if (userRole == Role.ADMIN) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Administrator accounts cannot be registered publicly. Allowed values: USER, SELLER"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role specified. Allowed values: USER, SELLER"));
        }

        boolean autoVerify = userRole == Role.ADMIN || userRole == Role.SELLER;
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .isVerified(autoVerify)
                .build();

        userRepository.save(user);

        // Generate and log OTP
        authService.generateAndSendOtp(user.getEmail(), "REGISTRATION");

        return ResponseEntity.ok(new MessageResponse("User registered successfully. Please verify your email with the OTP sent."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyRequest) {
        boolean isValid = authService.verifyOtp(verifyRequest.getEmail(), verifyRequest.getOtpCode(), verifyRequest.getPurpose());

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Invalid or expired OTP."));
        }

        if ("RESET".equalsIgnoreCase(verifyRequest.getPurpose())) {
            // Generate a reset token for resetting password
            String resetToken = authService.createPasswordResetToken(verifyRequest.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP verified successfully.");
            response.put("resetToken", resetToken);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(new MessageResponse("OTP verified successfully. Your account is now active."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest resendRequest) {
        Optional<User> userOpt = userRepository.findByEmail(resendRequest.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found."));
        }

        authService.generateAndSendOtp(resendRequest.getEmail(), resendRequest.getPurpose().toUpperCase());
        return ResponseEntity.ok(new MessageResponse("OTP resent successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Find user first to check if verified
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(loginRequest.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Invalid username or password."));
        }

        User user = userOpt.get();
        if (!user.getIsVerified()) {
            // Send new OTP for registration verification
            authService.generateAndSendOtp(user.getEmail(), "REGISTRATION");
            Map<String, Object> unverifiedResponse = new HashMap<>();
            unverifiedResponse.put("message", "Error: Account is not verified. A new OTP has been sent.");
            unverifiedResponse.put("email", user.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(unverifiedResponse);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(userDetails);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return ResponseEntity.ok(new JwtResponse(jwt,
                refreshToken.getRefreshToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getAuthorities().iterator().next().getAuthority().substring(5))); // strip ROLE_ prefix
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        try {
            Optional<RefreshToken> tokenOpt = refreshTokenService.findByToken(requestRefreshToken);
            if (tokenOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token is not in database!"));
            }

            RefreshToken verifiedToken = refreshTokenService.verifyExpiration(tokenOpt.get());
            User user = verifiedToken.getUser();
            String token = jwtUtils.generateTokenFromUsername(user.getUsername());

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("refreshToken", requestRefreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token has expired or is invalid."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Silently return ok for security to prevent user enumeration
            return ResponseEntity.ok(new MessageResponse("If your email is registered, we have sent a reset OTP."));
        }

        authService.generateAndSendOtp(request.getEmail(), "RESET");
        return ResponseEntity.ok(new MessageResponse("If your email is registered, we have sent a reset OTP."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // Can accept resetToken in place of otpCode, check which format it is
        boolean success;
        if (request.getOtpCode().length() > 10) {
            // Likely UUID reset token
            success = authService.resetPassword(request.getOtpCode(), request.getNewPassword());
        } else {
            // Directly check OTP
            boolean validOtp = authService.verifyOtp(request.getEmail(), request.getOtpCode(), "RESET");
            if (validOtp) {
                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setPassword(encoder.encode(request.getNewPassword()));
                userRepository.save(user);
                success = true;
            } else {
                success = false;
            }
        }

        if (!success) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Invalid or expired reset credentials."));
        }

        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Old password does not match."));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails != null) {
            refreshTokenService.deleteByUserId(userDetails.getId());
        }
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Unauthenticated."));
        }

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", userDetails.getId());
        userMap.put("username", userDetails.getUsername());
        userMap.put("email", userDetails.getEmail());
        userMap.put("role", userDetails.getAuthorities().iterator().next().getAuthority().substring(5));

        return ResponseEntity.ok(userMap);
    }
}
