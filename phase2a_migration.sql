-- Phase 2A Migration: Add Auto-Creation Support
-- Run this AFTER you've run create_recurring_transactions.sql

-- Add columns to track auto-creation
ALTER TABLE recurring_transactions 
ADD COLUMN IF NOT EXISTS last_generated_date DATE,
ADD COLUMN IF NOT EXISTS auto_create_transaction BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN recurring_transactions.last_generated_date IS 'Last date a transaction was auto-generated from this recurring transaction';
COMMENT ON COLUMN recurring_transactions.auto_create_transaction IS 'Whether to automatically create transactions when due';
