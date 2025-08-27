#!/usr/bin/env node

/**
 * Create All User Role Documents for MedEngine AI
 * This will set up Admin, Doctor, Nurse, and Patient test accounts
 * Run: node scripts/setup-all-users.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAP_hmHCz5MvtljNvXFTlBd7j5Cpt2MhCk',
  authDomain: 'medengine-ai.firebaseapp.com',
  projectId: 'medengine-ai',
  storageBucket: 'medengine-ai.firebasestorage.app',
  messagingSenderId: '529137634998',
  appId: '1:529137634998:web:65f828e916ae2d30c82017',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample user data for all roles
const testUsers = [
  {
    // Replace with actual UID when you create this user in Firebase Auth
    uid: 'admin-uid-placeholder',
    email: 'admin@medengine.ai',
    name: 'System Administrator',
    role: 'admin',
    department: 'IT Administration',
    phone: '+1-555-0101',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    // Your existing doctor account
    uid: 'V50XVhuHnreL1OK4dDDvTVevm842',
    email: 'doctor@medengine.com',
    name: 'Dr. Sarah Chen',
    role: 'doctor',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    licenseNumber: 'MD-12345',
    phone: '+1-555-0102',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  },
  {
    // Replace with actual UID when you create this user in Firebase Auth
    uid: 'nurse-uid-placeholder',
    email: 'nurse@medengine.ai',
    name: 'Emily Rodriguez',
    role: 'nurse',
    department: 'Emergency',
    shift: 'Day Shift',
    licenseNumber: 'RN-67890',
    phone: '+1-555-0103',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
  },
  {
    // Replace with actual UID when you create this user in Firebase Auth
    uid: 'patient-uid-placeholder',
    email: 'patient@medengine.ai',
    name: 'John Smith',
    role: 'patient',
    dateOfBirth: '1985-03-15',
    phone: '+1-555-0104',
    address: '123 Main St, Anytown, ST 12345',
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1-555-0105'
    },
    insurance: {
      provider: 'HealthCare Plus',
      policyNumber: 'HCP-789012',
      groupNumber: 'GRP-345'
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  }
];

async function setupAllUsers() {
  try {
    console.log('🔥 Setting up all user role documents...\n');
    
    for (const user of testUsers) {
      if (user.uid.includes('placeholder')) {
        console.log(`⚠️  ${user.role.toUpperCase()}: Skipping ${user.email} - need actual UID`);
        console.log(`   First create this user in Firebase Auth, then update the UID`);
        continue;
      }
      
      const userData = {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log(`✅ ${user.role.toUpperCase()}: Created ${user.name} (${user.email})`);
    }
    
    console.log('\n🎉 User setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Create the missing users in Firebase Authentication');
    console.log('2. Update their UIDs in this script');
    console.log('3. Run this script again');
    console.log('\n🔗 Firebase Auth: https://console.firebase.google.com/project/medengine-ai/authentication/users');
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
  }
}

setupAllUsers();
