package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Invoice;
import com.sareesfornaaris.auth.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByOrder(Order order);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
