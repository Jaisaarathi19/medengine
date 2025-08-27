import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserRole {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  createdAt: Date;
  updatedAt: Date;
  department?: string;
  specialization?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

/**
 * Sign up new user with role-based information
 */
export async function signUpWithRole(
  email: string, 
  password: string, 
  userData: Omit<UserRole, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(userCredential.user, {
      displayName: userData.name
    });
    
    // Save user role and additional data to Firestore
    const userDocData: UserRole = {
      uid: userCredential.user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
      email: userCredential.user.email!
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

    console.log(`✅ User created successfully: ${userData.name} (${userData.role})`);
    return userCredential;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✅ User signed in: ${userCredential.user.email}`);
    return userCredential;
  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
}

/**
 * Get user role and profile from Firestore
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserRole;
    }
    console.warn(`⚠️ No user role found for UID: ${uid}`);
    return null;
  } catch (error) {
    console.error('❌ Error fetching user role:', error);
    return null;
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<Omit<UserRole, 'uid' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date()
    });
    console.log(`✅ User profile updated for UID: ${uid}`);
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`✅ Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Check if user has specific role(s)
 */
export function hasRole(userRole: UserRole, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole.role);
}

/**
 * Check if user is medical staff (doctor, nurse, or admin)
 */
export function isMedicalStaff(userRole: UserRole): boolean {
  return hasRole(userRole, ['doctor', 'nurse', 'admin']);
}

/**
 * Get role-based dashboard URL
 */
export function getRoleDashboardUrl(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'doctor':
      return '/dashboard/doctor';
    case 'nurse':
      return '/dashboard/nurse';
    case 'patient':
      return '/dashboard/patient';
    default:
      return '/';
  }
}

/**
 * Validate role permissions for specific actions
 */
export const rolePermissions = {
  // Who can view patient data
  viewPatientData: ['admin', 'doctor', 'nurse'],
  
  // Who can modify patient data
  modifyPatientData: ['admin', 'doctor', 'nurse'],
  
  // Who can prescribe medication
  prescribeMedication: ['admin', 'doctor'],
  
  // Who can administer medication
  administerMedication: ['admin', 'doctor', 'nurse'],
  
  // Who can access system analytics
  viewAnalytics: ['admin'],
  
  // Who can manage user accounts
  manageUsers: ['admin'],
  
  // Who can book appointments
  bookAppointments: ['admin', 'doctor', 'nurse', 'patient'],
  
  // Who can modify appointments
  modifyAppointments: ['admin', 'doctor', 'nurse']
};

/**
 * Check if user has permission for specific action
 */
export function hasPermission(userRole: UserRole, action: keyof typeof rolePermissions): boolean {
  return rolePermissions[action].includes(userRole.role);
}

/**
 * Get user's full name or email fallback
 */
export function getUserDisplayName(user: User, userRole?: UserRole | null): string {
  if (userRole?.name) return userRole.name;
  if (user.displayName) return user.displayName;
  return user.email?.split('@')[0] || 'Unknown User';
}

/**
 * Format user role for display
 */
export function formatRole(role: string): string {
  switch (role) {
    case 'admin':
      return 'System Administrator';
    case 'doctor':
      return 'Doctor';
    case 'nurse':
      return 'Nurse';
    case 'patient':
      return 'Patient';
    default:
      return role;
  }
}
