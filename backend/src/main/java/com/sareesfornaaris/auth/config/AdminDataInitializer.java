package com.sareesfornaaris.auth.config;

import com.sareesfornaaris.auth.entity.Role;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataInitializer.class);

    private static final String ADMIN_USERNAME = "bhuvan";
    private static final String ADMIN_EMAIL = "bhuvanmb713@gmail.com";
    private static final String ADMIN_PASSWORD = "Bhuvan@123";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing Single Admin User enforcement...");

        Optional<User> byUsername = userRepository.findByUsername(ADMIN_USERNAME);
        Optional<User> byEmail = userRepository.findByEmail(ADMIN_EMAIL);

        User adminUser = null;

        if (byUsername.isPresent()) {
            adminUser = byUsername.get();
        } else if (byEmail.isPresent()) {
            adminUser = byEmail.get();
        } else {
            adminUser = new User();
        }

        adminUser.setUsername(ADMIN_USERNAME);
        adminUser.setEmail(ADMIN_EMAIL);
        adminUser.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        adminUser.setRole(Role.ADMIN);
        adminUser.setIsVerified(true);
        adminUser.setIsActive(true);

        userRepository.save(adminUser);
        logger.info("Admin user successfully configured: username='{}', email='{}'", ADMIN_USERNAME, ADMIN_EMAIL);

        // Enforce SINGLE ADMIN constraint: Remove any other admin accounts that are not this single admin user
        List<User> allAdmins = userRepository.findByRole(Role.ADMIN);
        for (User u : allAdmins) {
            if (!u.getUserId().equals(adminUser.getUserId())) {
                logger.info("Removing redundant admin user ID: {}", u.getUserId());
                userRepository.delete(u);
            }
        }
    }
}
