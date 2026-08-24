-- Database schema migration for Sarees For Naaris

USE E_Commerce;

-- 1. Alter users table (already applied if exists)
-- ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Create otp_verification table
CREATE TABLE IF NOT EXISTS otp_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'REGISTRATION' or 'RESET'
    expiry_time DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    INDEX idx_email_purpose (email, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME NOT NULL,
    changed_by_user_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_order_history (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Enhance orders table with OMS fields
ALTER TABLE orders DROP COLUMN IF EXISTS total_ammount;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN shipping_charge DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN estimated_delivery_date DATETIME NULL;
ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN cancelled_at DATETIME NULL;
ALTER TABLE orders ADD COLUMN billing_address_snapshot TEXT NULL;
ALTER TABLE orders ADD COLUMN courier_name VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL;

-- 7. Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    courier_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    current_location VARCHAR(255) DEFAULT 'Warehouse',
    estimated_delivery DATETIME NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'LABEL_CREATED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_shipment_order (order_id),
    INDEX idx_shipment_tracking (tracking_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Create shipment_tracking table
CREATE TABLE IF NOT EXISTS shipment_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    stage VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    INDEX idx_tracking_shipment (shipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Create returns table
CREATE TABLE IF NOT EXISTS returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'RETURN', -- 'RETURN' or 'REPLACEMENT'
    reason VARCHAR(255) NOT NULL,
    comments TEXT NULL,
    image_url VARCHAR(500) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_return_user (user_id),
    INDEX idx_return_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(500) NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_invoice_number (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Create payments table (Payment History)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_payment_user (user_id),
    INDEX idx_payment_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

