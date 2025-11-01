-- Migration: 0002_add_role.sql
-- Add role column to users table
-- Safe check - only adds if column doesn't exist

IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE Name = N'role' AND Object_ID = Object_ID(N'dbo.users')
)
BEGIN
  ALTER TABLE dbo.users ADD role nvarchar(20) DEFAULT 'normal' NOT NULL;
  PRINT 'Column role added to users table';
END
ELSE
BEGIN
  PRINT 'Column role already exists in users table';
END;

PRINT '0002_add_role.sql completed';

