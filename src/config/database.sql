-- Create database
CREATE DATABASE IF NOT EXISTS ipt_auth_db;
USE ipt_auth_db;

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(10) DEFAULT 'Mr',
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin') DEFAULT 'User',
    isVerified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(255),
    resetToken VARCHAR(255),
    resetTokenExpires DATETIME,
    refreshToken VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verificationToken (verificationToken),
    INDEX idx_resetToken (resetToken)
);

-- Optional: Sessions table for additional security
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    accountId INT NOT NULL,
    refreshToken VARCHAR(500),
    userAgent TEXT,
    ipAddress VARCHAR(45),
    expiresAt DATETIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_accountId (accountId),
    INDEX idx_expiresAt (expiresAt)
);

-- Insert default admin (optional - will be created on first registration)