package com.sareesfornaaris.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_tracking")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tracking_id")
    private Integer trackingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @JsonIgnore
    private Shipment shipment;

    @Column(nullable = false, length = 100)
    private String stage;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
