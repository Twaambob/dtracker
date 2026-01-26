# SUPABASE SQL MIGRATION INSTRUCTIONS

## What You Need to Do:

### Step 1: Open Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click on your project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Phase 2A Migration
1. Click **"New query"** button
2. Open the file `phase2a_migration.sql` in VS Code
3. **Copy ALL the text** (Ctrl+A, then Ctrl+C)
4. **Paste** into Supabase SQL Editor (Ctrl+V)
5. Click **"Run"** (or press Ctrl+Enter)

### Expected Result:
You should see: **"Success. No rows returned"** ✅

## What This Migration Does:
- Adds `last_generated_date` column to track when transactions were auto-created
- Adds `auto_create_transaction` column (default: true) to enable/disable auto-creation per recurring transaction

---

## That's It!

Once you run this migration, the Phase 2A features will work:
1. **Edit recurring transactions** by clicking on them
2. **Auto-creation** - recurring transactions will automatically create regular transactions when due
   - Runs when app loads
   - Runs every hour
   - Shows notification when transactions are created
