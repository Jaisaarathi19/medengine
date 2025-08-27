# Firebase Authentication Guide for MedEngine AI

## 🔥 Firebase Authentication Setup

### Overview
MedEngine AI uses Firebase Authentication for secure, role-based user management across four user types:
- **Admin**: System administrators
- **Doctor**: Medical practitioners  
- **Nurse**: Healthcare professionals
- **Patient**: Healthcare consumers

## 📋 Prerequisites

1. **Firebase Project**: Create at [Firebase Console](https://console.firebase.google.com/)
2. **Node.js**: Version 18+ installed
3. **Environment Variables**: Configured in `.env.local`

## 🛠️ Firebase Console Setup

### Step 1: Create Firebase Project
```bash
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Enter project name: "medengine-ai"
4. Enable/disable Google Analytics (optional)
5. Click "Create project"
```

### Step 2: Enable Authentication
```bash
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Optional: Enable "Google" provider
6. Click "Save"
```

### Step 3: Configure Authentication Settings
```bash
1. Go to Authentication → Settings → User actions
2. Enable "Email enumeration protection" (recommended)
3. Set password policy (optional)
4. Configure authorized domains for production
```

## 🔧 Code Implementation

### Authentication Service (`src/lib/auth.ts`)

```typescript
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserRole {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  createdAt: Date;
  department?: string;
  specialization?: string;
}

// Sign up new user with role
export async function signUpWithRole(
  email: string, 
  password: string, 
  userData: Omit<UserRole, 'uid' | 'createdAt'>
): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Save user role and additional data to Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    createdAt: new Date(),
    ...userData
  });

  return userCredential;
}

// Sign in existing user
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() as UserRole : null;
}

// Sign out current user
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Check if user has specific role
export function hasRole(userRole: UserRole, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole.role);
}
```

### Authentication Context (`src/contexts/AuthContext.tsx`)

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRole, UserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth');
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Protected Route Component (`src/components/ProtectedRoute.tsx`)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (userRole && !allowedRoles.includes(userRole.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, userRole, loading, router, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userRole || !allowedRoles.includes(userRole.role)) {
    return null;
  }

  return <>{children}</>;
}
```

## 🔐 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Role-based access for patients
    match /patients/{patientId} {
      allow read: if request.auth != null && (
        // Patient can read their own data
        request.auth.uid == patientId ||
        // Medical staff can read patient data
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin']
      );
      
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin'];
    }
    
    // Medical records - only medical staff can access
    match /medical-records/{recordId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin'];
    }
    
    // Appointments - patients can see their own, medical staff can see all
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin']
      );
    }
    
    // Prescriptions - patients can read their own, doctors can write
    match /prescriptions/{prescriptionId} {
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'nurse', 'admin']
      );
      
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'admin'];
    }
  }
}
```

## 🧪 Testing Authentication

### Test Users Setup
Create these test users in Firebase Auth console:

```typescript
// Test users for development
const testUsers = [
  {
    email: 'admin@medengine.ai',
    password: 'medengine123',
    role: 'admin',
    name: 'System Administrator'
  },
  {
    email: 'doctor@medengine.ai', 
    password: 'medengine123',
    role: 'doctor',
    name: 'Dr. Sarah Johnson',
    department: 'Cardiology'
  },
  {
    email: 'nurse@medengine.ai',
    password: 'medengine123', 
    role: 'nurse',
    name: 'Nurse Mary Wilson',
    department: 'Emergency'
  },
  {
    email: 'patient@medengine.ai',
    password: 'medengine123',
    role: 'patient', 
    name: 'John Smith'
  }
];
```

### Authentication Flow Testing
1. **Registration**: Test new user creation with roles
2. **Login**: Test email/password authentication  
3. **Role Check**: Verify role-based access control
4. **Route Protection**: Test protected routes
5. **Logout**: Test session termination

## 🚀 Deployment Considerations

### Production Security
1. **Enable Email Enumeration Protection**
2. **Set Strong Password Policies**  
3. **Configure Authorized Domains**
4. **Enable Multi-Factor Authentication** (optional)
5. **Monitor Authentication Events**

### Environment Variables
```bash
# Production .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medengine-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medengine-ai
# ... other config
```

## 📊 Monitoring & Analytics

### Firebase Authentication Events
- User sign-ups by role
- Login frequency
- Failed authentication attempts  
- Session duration by user type

### Custom Analytics
```typescript
import { logEvent } from 'firebase/analytics';

// Log user role-based actions
logEvent(analytics, 'user_login', {
  user_role: userRole.role,
  department: userRole.department
});
```

## 🔧 Troubleshooting

### Common Issues
1. **Invalid API Key**: Check `.env.local` configuration
2. **CORS Errors**: Add domain to Firebase authorized domains
3. **Permission Denied**: Verify Firestore security rules
4. **Network Errors**: Check Firebase project status

### Debug Tools
- Firebase Auth Emulator for local testing
- Browser Network tab for API calls
- Firebase Console Authentication logs
- Firestore Rules Playground

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)  
- [Next.js Firebase Integration](https://nextjs.org/docs/app/building-your-application/authentication)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

**Next Steps**: 
1. Set up Firebase project and get configuration
2. Update `.env.local` with real credentials
3. Create test users in Firebase Console
4. Test authentication flow in development
5. Deploy with production security settings
