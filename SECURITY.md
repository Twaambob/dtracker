# SOVEREIGN Security Documentation

## 🔒 Security Overview

This application implements **enterprise-grade, multi-layer security** to protect against cyber attacks including XSS, injection attacks, unauthorized data access, brute force attacks, and DDoS.

---

## Security Layers Implemented

### ✅ Layer 1: Firebase Security Rules (`firestore.rules`)

**Protection Against**: Unauthorized data access, data breaches, malicious data injection

**Implementation**:
- User isolation: Users can only access their own transactions
- Schema validation: Enforces data types and required fields
- XSS prevention: Blocks `<script>`, `javascript:`, and event handlers
- Size limits: 10KB max document size (DoS protection)
- Timestamp protection: Prevents `createdAt` manipulation

**Deployment**:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

### ✅ Layer 2: Input Validation & Sanitization (`src/lib/security.ts`)

**Protection Against**: XSS, SQL Injection, buffer overflow, malformed data

**Features**:
- HTML tag stripping
- Script protocol blocking
- Event handler removal
- Email RFC 5322 validation
- Password strength enforcement (8+ chars, uppercase, lowercase, number)
- Transaction schema validation
- SQL injection pattern detection
- XSS pattern detection

**Usage**:
```typescript
import { validateTransaction, isValidEmail, isValidPassword } from '@/lib/security';

// Validate transaction
const result = validateTransaction({ type, name, amount, note, contact, dueDate });
if (!result.valid) {
  showError(result.errors.join(' '));
} else {
  saveTransaction(result.sanitized); // Use sanitized data
}

// Validate email
if (!isValidEmail(email)) {
  showError('Invalid email');
}

// Validate password
const passwordCheck = isValidPassword(password);
if (!passwordCheck.valid) {
  showError(passwordCheck.message);
}
```

---

### ✅ Layer 3: Environment Variable Validation (`src/lib/env-validator.ts`)

**Protection Against**: App initialization with missing/invalid credentials, silent failures

**Features**:
- Fail-fast validation of all Firebase env vars
- Format validation for API keys, domains, URLs
- Clear error messages (no credential leakage)

**Automatic**: Runs on app initialization before Firebase setup.

---

### ✅ Layer 4: Content Security Policy (CSP) - `index.html`

**Protection Against**: XSS, clickjacking, MIME-sniffing, data injection

**Policies**:
- `default-src 'self'` - Only load resources from same origin
- `script-src` - Allows Firebase/Google scripts only
- `frame-ancestors 'none'` - Prevents clickjacking via iframes
- `object-src 'none'` - Blocks Flash/Java applets
- `upgrade-insecure-requests` - Forces HTTPS

---

### ✅ Layer 5: Authentication Hardening

**Protection Against**: Brute force attacks, credential stuffing, weak passwords

**Features**:
- Email validation (RFC 5322 compliant)
- Password strength requirements (min 8 chars, complexity)
- Rate limiting: Max 5 login attempts per minute
- Password reset flow with email verification

**Rate Limiting**:
```typescript
if (!checkRateLimit('login', 5, 60000)) {
  showError('Too many attempts. Wait 1 minute.');
}
```

---

## Firebase Console Configuration (Manual Steps)

### Step 1: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

**Verify**: 
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database → Rules
3. Confirm rules are deployed

---

### Step 2: Enable Authentication Methods

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Anonymous

---

### Step 3 (Optional): Enable Email Verification

1. Firebase Console → Authentication → Templates
2. Configure "Email address verification" template
3. Update `AuthScreen` component to send verification email:

```typescript
// After signup
if (isSignUp) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  showMessage('Verification email sent! Please check your inbox.');
}
```

---

## Security Best Practices for Users

### 🔑 Environment Variables

**CRITICAL**: Never commit `.env.local` to version control!

```bash
# ✅ GOOD: .env.local is in .gitignore
git status  # Should NOT show .env.local

# ❌ BAD: .env.local is tracked
git add .env.local  # NEVER DO THIS!
```

### 🔥 Firebase API Keys

**Note**: Firebase API keys in `VITE_FIREBASE_API_KEY` are *public* by design. Security is enforced by:
- Firestore Security Rules (user isolation)
- Firebase App Check (prevents API abuse)
- Domain restrictions (Firebase Console → Settings → Authorized domains)

### 🌐 Deployment Security

Before deploying to production:

1. **Enable HTTPS**: Most hosting providers (Vercel, Netlify, Firebase Hosting) do this automatically
2. **Domain Restrictions**: 
   - Go to Firebase Console → Project Settings
   - Add your production domain to "Authorized domains"
   - Remove unauthorized domains
3. **Review Security Rules**: Test rules in Firebase Console before deployment

---

## Testing Security

### Manual XSS Testing

Try entering these in transaction fields:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
```

**Expected**: All should be sanitized/blocked.

### Manual SQL Injection Testing

Try entering:
```
'; DROP TABLE transactions--
' OR '1'='1
```

**Expected**: Detected and rejected.

### Rate Limiting Testing

1. Enter wrong password 5 times rapidly
2. **Expected**: "Too many login attempts"

### Firebase Rules Testing

1. Open Firebase Console → Firestore → Rules Playground
2. Try accessing another user's data
3. **Expected**: Permission denied

---

## Security Monitoring

### Firebase Analytics

All authentication events are automatically logged:
- Failed login attempts
- Successful logins
- Password resets

**View logs**: Firebase Console → Analytics → Events

### Browser Console

Check for CSP violations:
1. Open DevTools → Console
2. Look for CSP violation warnings
3. **Expected**: No violations in normal operation

---

## Incident Response

### If API Keys Are Exposed

1. **Regenerate Firebase API Key**:
   - Cannot be done directly
   - Create new Firebase app in same project
   - Update `.env.local` with new credentials

2. **Rotate Credentials**:
   ```bash
   # Update .env.local with new values
   # Redeploy application
   npm run build
   ```

### If Unauthorized Access Detected

1. **Check Firestore Audit Logs**: Firebase Console → Firestore → Usage
2. **Review Security Rules**: Ensure proper user isolation
3. **Force Logout All Users**: Revoke refresh tokens via Firebase Admin SDK

---

## Dependencies Security

### Automated Audits

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

**Current Status**: ✅ 0 vulnerabilities

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

---

## Compliance

This application implements security controls aligned with:
- **OWASP Top 10** (2021)
- **NIST Cybersecurity Framework**
- **GDPR** data protection principles (user data isolation)

---

## Support

For security issues or questions:
1. Review this documentation
2. Check [Firebase Security Documentation](https://firebase.google.com/docs/rules)
3. Review [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)

**Reporting Security Vulnerabilities**: Open a GitHub issue or contact the development team directly.
