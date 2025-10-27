-- SQL Server initialization script
USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'fin_users_db')
BEGIN
    CREATE DATABASE fin_users_db;
END
GO

USE fin_users_db;
GO

-- Create users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        age INT,
        role NVARCHAR(50) DEFAULT 'normal',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        is_active BIT DEFAULT 1
    );
END
GO

-- Create user_profiles table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_profiles' AND xtype='U')
BEGIN
    CREATE TABLE user_profiles (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        monthly_income DECIMAL(10,2) DEFAULT 0,
        financial_goals NVARCHAR(MAX),
        spending_limit DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- Insert default admin user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@finapp.com')
BEGIN
    INSERT INTO users (email, password, name, role) 
    VALUES ('admin@finapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin');
    
    -- Get the admin user ID and create profile
    DECLARE @adminId UNIQUEIDENTIFIER;
    SELECT @adminId = id FROM users WHERE email = 'admin@finapp.com';
    
    INSERT INTO user_profiles (user_id, monthly_income, spending_limit)
    VALUES (@adminId, 10000.00, 5000.00);
END
GO

-- Insert default regular user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'user@finapp.com')
BEGIN
    INSERT INTO users (email, password, name, role) 
    VALUES ('user@finapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuário', 'normal');
    
    -- Get the user ID and create profile
    DECLARE @userId UNIQUEIDENTIFIER;
    SELECT @userId = id FROM users WHERE email = 'user@finapp.com';
    
    INSERT INTO user_profiles (user_id, monthly_income, spending_limit)
    VALUES (@userId, 5000.00, 3000.00);
END
GO

PRINT 'SQL Server database initialized successfully!';
