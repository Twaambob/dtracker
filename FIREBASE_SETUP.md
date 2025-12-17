# Firebase Authentication Setup Guide

## Current Status
✅ Firebase configuration connected successfully
❌ Authentication methods need to be enabled

## Error Encountered
`Error (auth/admin-restricted-operation)` - This means the authentication methods are not enabled in Firebase Console.

## Step-by-Step Setup

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/authentication/providers

### 2. Enable Email/Password Authentication
1. Click on **"Email/Password"** in the Sign-in providers list
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### 3. Enable Anonymous Authentication
1. Click on **"Anonymous"** in the Sign-in providers list
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### 4. Enable Google Authentication (Optional)
1. Click on **"Google"** in the Sign-in providers list
2. Toggle **"Enable"** to ON
3. Enter a **Project public-facing name** (e.g., "SOVEREIGN Debt Tracker")
4. Enter a **Project support email** (your email)
5. Click **"Save"**

### 5. Set Up Firestore Security Rules
1. Go to: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/firestore/rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

### 6. Test the Application

After enabling authentication methods:

1. Refresh the SOVEREIGN app (http://localhost:5173)
2. Click **"Access Anonymously"** - should work now ✅
3. Or create an account with **Email/Password**
4. Or sign in with **Google**

## Quick Links

- **Authentication**: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/authentication/providers
- **Firestore Rules**: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/firestore/rules
- **Firestore Database**: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/firestore/data

## Verification Checklist

- [ ] Email/Password authentication enabled
- [ ] Anonymous authentication enabled
- [ ] Google authentication enabled (optional)
- [ ] Firestore security rules published
- [ ] Successfully logged in using any method
- [ ] Created a test transaction
- [ ] Verified transaction appears in Firestore
