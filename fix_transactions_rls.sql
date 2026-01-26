-- Fix RLS policies for public.transactions table
-- Addressing performance issues where auth.uid() is re-evaluated for each row.

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Re-create policies with performance optimization: (select auth.uid())

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    AND type IN ('credit', 'debt')
    AND char_length(name) > 0 AND char_length(name) <= 100
    AND amount > 0 AND amount <= 999999999
  );

-- Users can only update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING ((select auth.uid()) = user_id);
