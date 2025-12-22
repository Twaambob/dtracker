# Quick Deployment Guide - Firebase Security Rules

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`

## Step 1: Initialize Firebase (if not already done)

```bash
firebase init firestore
```

**Select**:
- Use existing project: `debt-tracker-app-7b0bb`
- Firestore rules file: `firestore.rules` (default)
- Firestore indexes file: `firestore.indexes.json` (default)

## Step 2: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

**Expected Output**:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/debt-tracker-app-7b0bb/overview
```

## Step 3: Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/project/debt-tracker-app-7b0bb/firestore/rules)
2. Verify rules match `firestore.rules` file
3. Test rules in the Rules Playground

## Step 4: Test Rules

In Firebase Console → Firestore → Rules Playground:

**Test 1: User can read own data**
- Type: `get`  
- Location: `/artifacts/sovereign-debt-tracker/users/{your-user-id}/transactions/{doc-id}`
- Authenticated: `yes`, user ID: `{your-user-id}`
- **Expected**: ✅ Allow

**Test 2: User cannot read other user's data**
- Type: `get`
- Location: `/artifacts/sovereign-debt-tracker/users/different-user-id/transactions/{doc-id}`
- Authenticated: `yes`, user ID: `{your-user-id}`
- **Expected**: ❌ Deny

## Done! 🎉

Your Firestore security rules are now protecting your data.
