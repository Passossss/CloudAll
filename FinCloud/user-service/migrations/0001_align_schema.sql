-- Migration: 0001_align_schema.sql
-- Safe schema alignment for fin_users_db.users and user_profiles
-- Adds missing columns only if they do not already exist. Intended for development
-- and quick alignment when TYPEORM_SYNC is not used. Review before running in
-- production.

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.users')
)
BEGIN
  ALTER TABLE dbo.users ADD created_at datetime2 DEFAULT GETDATE();
END;

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'updated_at' AND Object_ID = Object_ID(N'dbo.users')
)
BEGIN
  ALTER TABLE dbo.users ADD updated_at datetime2 DEFAULT GETDATE();
END;

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'is_active' AND Object_ID = Object_ID(N'dbo.users')
)
BEGIN
  ALTER TABLE dbo.users ADD is_active bit DEFAULT 1;
END;

-- user_profiles columns (usually exist, but keep safe checks)
IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'user_id' AND Object_ID = Object_ID(N'dbo.user_profiles')
)
BEGIN
  ALTER TABLE dbo.user_profiles ADD user_id uniqueidentifier;
END;

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'monthly_income' AND Object_ID = Object_ID(N'dbo.user_profiles')
)
BEGIN
  ALTER TABLE dbo.user_profiles ADD monthly_income decimal(10,2) DEFAULT 0;
END;

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'financial_goals' AND Object_ID = Object_ID(N'dbo.user_profiles')
)
BEGIN
  ALTER TABLE dbo.user_profiles ADD financial_goals nvarchar(MAX) NULL;
END;

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'spending_limit' AND Object_ID = Object_ID(N'dbo.user_profiles')
)
BEGIN
  ALTER TABLE dbo.user_profiles ADD spending_limit decimal(10,2) DEFAULT 0;
END;

PRINT '0001_align_schema.sql completed (no-op for already aligned columns)';
