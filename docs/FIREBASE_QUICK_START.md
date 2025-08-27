# 🔥 Firebase Authentication - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Firebase Project Setup
1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) → "Add project"
2. **Project Name**: `medengine-ai` (or your preference)
3. **Enable Analytics**: Optional
4. **Create Project**: Wait for setup completion

### Step 2: Enable Authentication
```bash
# In Firebase Console:
1. Go to "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Enable "Email/Password"
4. Save
```

### Step 3: Create Firestore Database
```bash
# In Firebase Console:
1. Go to "Firestore Database" → "Create database"
2. Select "Start in test mode" (for development)
3. Choose location (closest to users)
4. Done
```

### Step 4: Get Configuration
```bash
# In Firebase Console:
1. Go to Project Settings (⚙️)
2. Scroll to "Your apps" → "Add app" → Web (</>) 
3. App nickname: "MedEngine AI"
4. Copy the firebaseConfig object
```

### Step 5: Configure Environment
1. **Update `.env.local`** with your Firebase config:

```bash
# Replace with your actual Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYour_Actual_API_Key_Here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medengine-ai-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medengine-ai-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medengine-ai-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345

# Get from https://makersuite.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyYour_Gemini_API_Key_Here
```

### Step 6: Test Setup
```bash
# 1. Restart development server
npm run dev

# 2. Visit test page
http://localhost:3001/firebase-test

# 3. Check all variables show "✅ Set"
```

## 🧪 Create Test Users

### Option A: Manual (Firebase Console)
```bash
# In Firebase Console → Authentication → Users → Add user:

Email: admin@medengine.ai
Password: medengine123
✅ Email verified: true

Email: doctor@medengine.ai  
Password: medengine123
✅ Email verified: true

Email: nurse@medengine.ai
Password: medengine123
✅ Email verified: true

Email: patient@medengine.ai
Password: medengine123
✅ Email verified: true
```

### Option B: Automated Script
```bash
# 1. Download service account key:
#    Firebase Console → Project Settings → Service Accounts
#    → "Generate new private key" → Save as "serviceAccountKey.json"

# 2. Install Firebase Admin SDK
npm install firebase-admin

# 3. Run setup script
node scripts/setup-firebase.js
```

## 🔐 Security Rules Setup

Copy this to Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Role-based patient access
    match /patients/{patientId} {
      allow read: if request.auth != null && (
        request.auth.uid == patientId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin']
      );
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin'];
    }
    
    // Medical staff only
    match /medical-records/{recordId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin'];
    }
    
    // Appointments - patients see own, staff see all
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin']
      );
    }
  }
}
```

## ✅ Verification Checklist

### Environment Setup
- [ ] `.env.local` file created with Firebase config
- [ ] All environment variables show "✅ Set" on test page
- [ ] Development server restarted after config changes

### Firebase Console
- [ ] Project created and active
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created (test mode)
- [ ] Security rules updated
- [ ] Test users created

### Application Testing
- [ ] Visit http://localhost:3001/firebase-test
- [ ] Firebase Auth shows "✅ Connected"  
- [ ] Firestore shows "✅ Connected"
- [ ] Login page loads without errors
- [ ] Can create new account
- [ ] Can sign in with test accounts
- [ ] Role-based dashboard access works

## 🚨 Common Issues & Solutions

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Check `.env.local` API key is correct and restart dev server

### Issue: "Permission denied" in Firestore
**Solution**: Update security rules and ensure user roles are saved

### Issue: "Network request failed"  
**Solution**: Check Firebase project is active and billing enabled (if needed)

### Issue: Environment variables not loading
**Solution**: Ensure `.env.local` is in root directory, restart dev server

## 🔗 Test Account URLs

Once setup is complete, test these login flows:

```bash
# Admin Dashboard
http://localhost:3001/login?role=admin
→ admin@medengine.ai / medengine123

# Doctor Dashboard  
http://localhost:3001/login?role=doctor
→ doctor@medengine.ai / medengine123

# Nurse Dashboard
http://localhost:3001/login?role=nurse
→ nurse@medengine.ai / medengine123

# Patient Dashboard
http://localhost:3001/login?role=patient
→ patient@medengine.ai / medengine123
```

## 📞 Need Help?

1. **Check Firebase Console** for error messages
2. **Browser Console** for JavaScript errors  
3. **Network Tab** to see failed requests
4. **Firebase Test Page** at `/firebase-test` for status

---

**🎉 After setup, your MedEngine AI will have:**
- ✅ Secure role-based authentication
- ✅ Real-time database with Firestore
- ✅ Protected routes and dashboards
- ✅ AI-powered features ready to go
- ✅ Production-ready security rules
