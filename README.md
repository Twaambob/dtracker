# SOVEREIGN - Personal Debt Tracker

A premium financial management application built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- 🔐 **Multiple Authentication Methods**: Email/Password, Google OAuth
- 🎯 **Smart Priority System**: Nexus Panel automatically highlights the most urgent transactions
- ⚡ **Real-time Sync**: All transactions sync across devices using Supabase real-time
- 🎨 **Premium UI**: Particle background animations, glassmorphism, and modern design
- 📊 **Comprehensive Tracking**: Manage both credits (money owed to you) and debts (money you owe)
- 🔔 **Smart Notifications**: Get alerted for due and overdue transactions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Setup Instructions

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dtracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Follow the detailed setup guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   
   Quick summary:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from the setup guide
   - Enable Email and Google auth providers
   - Copy your project credentials

4. **Configure environment variables**
   ```bash
   cp .env.template .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Usage Guide

### Adding Transactions

1. Click the **"New Entry"** button in the header
2. Select transaction type:
   - **"They Owe Me"**: Someone owes you money (Credit)
   - **"I Owe Them"**: You owe someone money (Debt)
3. Fill in the details:
   - **Entity Name**: Person or organization
   - **Amount**: Transaction amount
   - **Due Date**: Optional deadline
   - **Contact**: Email or phone number
   - **Notes**: Additional information

### Managing Transactions

- **View Details**: Click on any transaction card to see full details
- **Settle**: Mark a transaction as paid/completed
- **Delete**: Remove a transaction from your ledger
- **Filter**: Use the sidebar menu to filter by type:
  - **Overview**: All transactions
  - **Incoming**: Credits (money owed to you)
  - **Outgoing**: Debts (you owe)
  - **Archive**: Cleared transactions

### Understanding the Nexus Panel

The Nexus Panel uses an intelligent scoring algorithm to highlight your most urgent transaction:

- **Score Factors**:
  - Transaction type (debts are prioritized higher)
  - Time until due date (overdue items get the highest score)
  - Transaction amount (larger amounts score higher)
  - Cleared status

- **Urgency Levels**:
  - **OVERDUE**: Past due date (Highest priority)
  - **CRITICAL**: Due today or tomorrow
  - **URGENT**: Due within a week
  - **MEDIUM**: Due within a month

### Dashboard Stats

- **Net Position**: Your overall financial balance (Credits - Debts)
- **Receivables**: Total money owed to you
- **Payables**: Total money you owe
- **Liquidity Score**: Calculated health indicator (50 + netWorth/100)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or Supabase hosting

## Project Structure

```
src/
├── App.tsx                 # Main application with all components
├── supabase.config.ts      # Supabase configuration
├── index.css              # Global styles and Tailwind
└── main.tsx               # Application entry point
```

## Color Palette

- **Gold**: `#d4af37` (Primary/Accent)
- **Emerald**: `#10b981` (Credits/Positive)
- **Red**: `#ef4444` (Debts/Negative)
- **Dark**: `#0a0a0c` (Background)

## Troubleshooting

### "Missing required environment variables" error
- Make sure `.env.local` exists in your project root
- Check that variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env.local`

### Authentication issues
- Check that Email/Password auth is enabled in Supabase Dashboard
- For Google Sign-In, ensure the OAuth client credentials are correct
- Check browser console for specific error messages

### Transactions not syncing
- Verify the database schema was created successfully
- Check that Row Level Security (RLS) policies are active
- Ensure you're authenticated before adding transactions
- Check browser console and Supabase logs for errors

## License

MIT

## Support

For issues or questions:
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions
- Review the [Supabase documentation](https://supabase.com/docs)
- Open an issue in the repository
