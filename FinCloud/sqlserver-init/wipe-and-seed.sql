USE fin_users_db;
GO

-- Remove existing data
PRINT 'Deleting all user profiles and users...';
DELETE FROM user_profiles;
DELETE FROM users;
GO

-- Insert two deterministic test users (fixed GUIDs for reproducibility)
PRINT 'Inserting two test users (admin and user)...';

INSERT INTO users (id, email, password, name, role, created_at, updated_at, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@finapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin', GETDATE(), GETDATE(), 1),
    ('22222222-2222-2222-2222-222222222222', 'user@finapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuário', 'normal', GETDATE(), GETDATE(), 1);
GO

-- Create profiles for those users
INSERT INTO user_profiles (id, user_id, monthly_income, spending_limit, created_at, updated_at)
VALUES
    (NEWID(), '11111111-1111-1111-1111-111111111111', 10000.00, 5000.00, GETDATE(), GETDATE()),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 5000.00, 3000.00, GETDATE(), GETDATE());
GO

PRINT 'Wipe and reseed completed.';
