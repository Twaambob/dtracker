-- Add recurring_id to transactions and create RPC for atomic auto-creation

-- NOTE: Review and run in Supabase SQL editor. Test on a staging DB first.

-- 1) Add recurring_id column to transactions (nullable)
ALTER TABLE IF EXISTS transactions
  ADD COLUMN IF NOT EXISTS recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- 2) Create function to atomically create a transaction from a recurring entry
CREATE OR REPLACE FUNCTION create_transaction_from_recurring(rec_id UUID)
RETURNS INTEGER AS $$
DECLARE
  rec RECORD;
  inserted_id UUID;
BEGIN
  -- Lock the recurring row to serialize concurrent processors
  SELECT * INTO rec FROM recurring_transactions WHERE id = rec_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 0; -- no such recurring row
  END IF;

  -- Only proceed if active and auto-create enabled
  IF rec.active IS NOT TRUE OR rec.auto_create_transaction IS NOT TRUE THEN
    RETURN 0;
  END IF;

  -- Only create if next_due_date is today or in the past
  IF rec.next_due_date > CURRENT_DATE THEN
    RETURN 0;
  END IF;

  -- Avoid duplicate generation for same due date
  IF rec.last_generated_date IS NOT NULL AND rec.last_generated_date = rec.next_due_date THEN
    RETURN 0;
  END IF;

  -- Prevent duplicate transactions (defensive)
  IF EXISTS (SELECT 1 FROM transactions t WHERE t.user_id = rec.user_id AND t.recurring_id = rec.id AND t.due_date = rec.next_due_date) THEN
    RETURN 0;
  END IF;

  -- Insert transaction
  INSERT INTO transactions(user_id, type, name, amount, note, contact, due_date, returns_percentage, cleared, created_at, recurring_id)
  VALUES (
    rec.user_id,
    rec.type,
    rec.name || ' (Auto)',
    rec.amount,
    COALESCE(rec.note, 'Auto-created from recurring transaction'),
    rec.contact,
    rec.next_due_date,
    NULL,
    FALSE,
    now(),
    rec.id
  )
  RETURNING id INTO inserted_id;

  -- Calculate new next due date using existing DB function if present
  UPDATE recurring_transactions
  SET next_due_date = calculate_next_due_date(rec.next_due_date, rec.frequency)::date,
      last_generated_date = rec.next_due_date
  WHERE id = rec.id;

  RETURN 1; -- created
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon role if you want client-side RPC access (use with caution)
-- GRANT EXECUTE ON FUNCTION create_transaction_from_recurring(UUID) TO anon;
