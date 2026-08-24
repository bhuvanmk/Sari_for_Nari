package com.sareesfornaaris.auth.service;

import com.sareesfornaaris.auth.entity.Order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendOrderConfirmationEmail(Order order) {
        if (mailSender == null || order.getUser() == null || order.getUser().getEmail() == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("support@sareesfornaaris.com");
            message.setTo(order.getUser().getEmail());
            message.setSubject("Order Confirmation - " + order.getOrderId());
            message.setText("Dear " + order.getUser().getUsername() + ",\n\n"
                    + "Thank you for shopping with Sarees for Naaris!\n"
                    + "Your order " + order.getOrderId() + " for total amount ₹" + order.getTotalAmount() + " has been successfully placed.\n\n"
                    + "Status: " + order.getStatus() + "\n"
                    + "Payment Method: " + order.getPaymentMethod() + "\n\n"
                    + "Warm regards,\nSarees for Naaris Team");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    @Async
    public void sendOrderStatusUpdateEmail(Order order, String newStatus) {
        if (mailSender == null || order.getUser() == null || order.getUser().getEmail() == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("support@sareesfornaaris.com");
            message.setTo(order.getUser().getEmail());
            message.setSubject("Order Update - " + order.getOrderId() + " (" + newStatus + ")");
            message.setText("Dear " + order.getUser().getUsername() + ",\n\n"
                    + "Your order " + order.getOrderId() + " status has been updated to: " + newStatus + ".\n\n"
                    + "Courier: " + (order.getCourierName() != null ? order.getCourierName() : "Standard Delivery") + "\n"
                    + "Tracking Number: " + (order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A") + "\n\n"
                    + "Thank you for choosing Sarees for Naaris!");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order status update email: " + e.getMessage());
        }
    }
}
