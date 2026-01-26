-- Create recurring_transactions table
-- Run this in Supabase SQL Editor to add recurring transaction support

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debt')),
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0 AND amount <= 999999999),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'annually')),
  start_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('salary', 'rent', 'utilities', 'subscription', 'insurance', 'loan', 'other')),
  note TEXT CHECK (char_length(note) <= 500),
  contact TEXT CHECK (char_length(contact) <= 100),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Security constraints to prevent XSS
  CONSTRAINT valid_name CHECK (name !~ '<script|javascript:|on\w+\s*='),
  CONSTRAINT valid_note CHECK (note IS NULL OR note !~ '<script|javascript:|on\w+\s*=')
);

-- Create indexes for performance
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date) WHERE active = true;
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(active);

-- Enable Row Level Security
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users can only view their own recurring transactions
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Users can only insert their own recurring transactions
CREATE POLICY "Users can insert own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    AND type IN ('credit', 'debt')
    AND char_length(name) > 0 AND char_length(name) <= 100
    AND amount > 0 AND amount <= 999999999
    AND frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'annually')
    AND category IN ('salary', 'rent', 'utilities', 'subscription', 'insurance', 'loan', 'other')
  );

-- Users can only update their own recurring transactions
CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can only delete their own recurring transactions
CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Create function to automatically update next_due_date
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  base_date DATE,
  freq TEXT
)
RETURNS DATE AS $$
BEGIN
  CASE freq
    WHEN 'daily' THEN
      RETURN base_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN base_date + INTERVAL '1 week';
    WHEN 'biweekly' THEN
      RETURN base_date + INTERVAL '2 weeks';
    WHEN 'monthly' THEN
      RETURN base_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN base_date + INTERVAL '3 months';
    WHEN 'semiannually' THEN
      RETURN base_date + INTERVAL '6 months';
    WHEN 'annually' THEN
      RETURN base_date + INTERVAL '1 year';
    ELSE
      RETURN base_date;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
