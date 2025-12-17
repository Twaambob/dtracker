# SOVEREIGN - Personal Debt Tracker

A premium financial management application built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

- 🔐 **Multiple Authentication Methods**: Email/Password, Google, Anonymous
- 🎯 **Smart Priority System**: Nexus Panel automatically highlights the most urgent transactions
- ⚡ **Real-time Sync**: All transactions sync across devices using Firebase
- 🎨 **Premium UI**: Particle background animations, glassmorphism, and modern design
- 📊 **Comprehensive Tracking**: Manage both credits (money owed to you) and debts (money you owe)
- 🔔 **Smart Notifications**: Get alerted for due and overdue transactions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable the following in your Firebase project:
   - **Authentication**: Email/Password, Google, Anonymous
   - **Firestore Database**: Create a database in production mode

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to create a web app
   - Copy the `firebaseConfig` object

5. Update `src/firebase.config.ts` with your credentials:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const appId = "sovereign-debt-tracker";
```

### 2. Firestore Security Rules

Add these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Build for Production

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
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or Firebase Hosting

## Project Structure

```
src/
├── App.tsx                 # Main application with all components
├── firebase.config.ts      # Firebase configuration (UPDATE THIS!)
├── index.css              # Global styles and Tailwind
└── main.tsx               # Application entry point
```

## Color Palette

- **Gold**: `#d4af37` (Primary/Accent)
- **Emerald**: `#10b981` (Credits/Positive)
- **Red**: `#ef4444` (Debts/Negative)
- **Dark**: `#0a0a0c` (Background)

## Troubleshooting

### "Firebase not initialized" error
- Make sure you've updated `src/firebase.config.ts` with your actual credentials
- Verify your Firebase project has Authentication and Firestore enabled

### Authentication issues
- Check that Email/Password auth is enabled in Firebase Console
- For Google Sign-In, ensure the OAuth client is properly configured
- For Anonymous auth, make sure it's enabled in Firebase Console

### Transactions not syncing
- Verify Firestore rules are correctly configured
- Check browser console for any permission errors
- Ensure you're authenticated before adding transactions

## License

MIT

## Support

For issues or questions, please check the Firebase documentation or open an issue in the repository.
