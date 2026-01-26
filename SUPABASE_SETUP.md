# Supabase Setup Guide for

 SOVEREIGN Debt Tracker

This guide will walk you through setting up Supabase for your debt tracker application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `sovereign-debt-tracker` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to your users
4. Click **"Create new project"**
5. Wait for the project to be created (this takes about 2 minutes)

## Step 2: Create the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste the following SQL script:

```sql
-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debt')),
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0 AND amount <= 999999999),
  cleared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT CHECK (char_length(note) <= 500),
  contact TEXT CHECK (char_length(contact) <= 100),
  due_date DATE,
  returns_percentage DECIMAL(5, 2) CHECK (returns_percentage >= 0 AND returns_percentage <= 100),
  payments JSONB DEFAULT '[]'::jsonb,
  
  -- Security constraints to prevent XSS
  CONSTRAINT valid_name CHECK (name !~ '<script|javascript:|on\w+\s*='),
  CONSTRAINT valid_note CHECK (note IS NULL OR note !~ '<script|javascript:|on\w+\s*=')
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_cleared ON transactions(cleared);
CREATE INDEX idx_transactions_due_date ON transactions(due_date) WHERE due_date IS NOT NULL;

--Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Row Level Security Policies
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
```

4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. You should see a success message: "Success. No rows returned"

## Step 3: Enable Authentication Providers

### Email/Password Authentication

1. Go to **Authentication** > **Providers** in the left sidebar
2. **Email** should be enabled by default
3. Scroll down to **"Email Auth"** settings:
   - ✅ Enable email confirmations (recommended for production)
   - ✅ Enable email change confirmations
   - For development, you can disable confirmations temporarily

### Google OAuth (Optional)

1. In **Authentication** > **Providers**, find **Google**
2. Toggle it **ON**
3. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Paste them into Supabase and click **Save**

## Step 4: Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar) > **API**
2. You'll need two values:
   - **Project URL**: Something like `https://abcdefghijk.supabase.co`
   - **anon public** key: A long JWT token starting with `eyJ...`

## Step 5: Configure Environment Variables

1. In your project root, copy the template file:
   ```bash
   cp .env.template .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your_long_anon_key_here
   ```

3. **⚠️ Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

## Step 6: Test the Connection

1. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser (usually `http://localhost:5173`)

4. Try creating an account:
   - Click **"Sign Up"**
   - Enter an email and password
   - You should receive a confirmation email (if enabled)
   - Log in and test creating a transaction

## Troubleshooting

### "Missing required environment variables"
- Make sure `.env.local` exists in your project root
- Check that variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env.local`

### "Failed to fetch" or network errors
- Verify your **Project URL** is correct
- Check that your Supabase project is running (not paused)
- Make sure you're using the **anon public** key, not the service role key

### Transactions not saving
- Check that the SQL schema was created successfully
- Verify Row Level Security policies are active
- Check browser console for specific error messages

### Email confirmations not working
- Go to **Authentication** > **Email Templates** to customize
- For development, you can disable confirmations in **Authentication** > **Providers** > **Email**

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmations
- [ ] Set up a custom SMTP server (optional, for branded emails)
- [ ] Configure allowed redirect URLs in **Authentication** > **URL Configuration**
- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Enable 2FA for your Supabase account

## Next Steps

- Read the [Supabase Documentation](https://supabase.com/docs)
- Explore the **Table Editor** to view your data
- Check the **Logs** section for debugging
- Set up **Database Webhooks** for notifications (optional)

## Support

If you encounter issues:
1. Check the Supabase [Discord community](https://discord.supabase.com)
2. Review the [troubleshooting guide](https://supabase.com/docs/guides/platform/troubleshooting)
3. Check the browser console for error messages
