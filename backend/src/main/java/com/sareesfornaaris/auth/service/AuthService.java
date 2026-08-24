package com.sareesfornaaris.auth.service;

import com.sareesfornaaris.auth.entity.*;
import com.sareesfornaaris.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.otp.expirationMinutes:10}")
    private int otpExpirationMinutes;

    private final SecureRandom random = new SecureRandom();

    public String generateOtpCode() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    @Transactional
    public void generateAndSendOtp(String email, String purpose) {
        String code = generateOtpCode();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        // Mark previous un-used OTPs for this email & purpose as used/revoked
        Optional<OtpVerification> existing = otpVerificationRepository
                .findFirstByEmailAndPurposeAndIsUsedFalseOrderByExpiryTimeDesc(email, purpose);
        existing.ifPresent(otp -> {
            otp.setIsUsed(true);
            otpVerificationRepository.save(otp);
        });

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .otpCode(code)
                .purpose(purpose)
                .expiryTime(expiry)
                .isUsed(false)
                .build();

        otpVerificationRepository.save(otp);

        // Print OTP to console for testing/development (email may be best-effort)
        logger.info("==================================================");
        logger.info("OTP CODE GENERATED FOR: {}", email);
        logger.info("PURPOSE: {}", purpose);
        logger.info("CODE: {}", code);
        logger.info("==================================================");

        // Send HTML email via EmailService
        emailService.sendOtpEmail(email, code, purpose);
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode, String purpose) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository
                .findFirstByEmailAndPurposeAndIsUsedFalseOrderByExpiryTimeDesc(email, purpose);

        if (otpOpt.isEmpty()) {
            return false;
        }

        OtpVerification otp = otpOpt.get();
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            return false;
        }

        otp.setIsUsed(true);
        otpVerificationRepository.save(otp);

        if ("REGISTRATION".equalsIgnoreCase(purpose)) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setIsVerified(true);
                userRepository.save(user);
            }
        }

        return true;
    }

    @Transactional
    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .resetToken(token)
                .expiryTime(LocalDateTime.now().plusMinutes(15)) // 15 mins validity
                .isUsed(false)
                .build();

        passwordResetTokenRepository.save(resetToken);
        return token;
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByResetToken(token);

        if (tokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getIsUsed() || resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordChangedEmail(user.getEmail());

        return true;
    }
}
