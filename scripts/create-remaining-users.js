#!/usr/bin/env node

/**
 * Create Admin and Nurse Users
 * This will create both auth users and role documents for remaining roles
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
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
const auth = getAuth(app);
const db = getFirestore(app);

const remainingUsers = [
  {
    email: 'admin@medengine.ai',
    password: 'medengine123',
    userData: {
      name: 'System Administrator',
      role: 'admin',
      department: 'IT Administration',
      phone: '+1-555-0101',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    }
  },
  {
    email: 'nurse@medengine.ai',
    password: 'medengine123',
    userData: {
      name: 'Emily Rodriguez',
      role: 'nurse',
      department: 'Emergency',
      shift: 'Day Shift',
      licenseNumber: 'RN-67890',
      phone: '+1-555-0103',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
    }
  }
];

async function createRemainingUsers() {
  try {
    console.log('🔥 Creating admin and nurse users...\n');
    
    for (const user of remainingUsers) {
      try {
        console.log(`📧 Creating ${user.userData.role}: ${user.email}`);
        
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        const authUser = userCredential.user;
        
        console.log(`✅ ${user.userData.role.toUpperCase()} auth user created`);
        console.log(`🆔 UID: ${authUser.uid}`);
        
        // Create user role document in Firestore
        const userData = {
          uid: authUser.uid,
          email: user.email,
          ...user.userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'users', authUser.uid), userData);
        
        console.log(`✅ ${user.userData.role.toUpperCase()} role document created`);
        console.log(`👤 Name: ${userData.name}`);
        console.log(`🏥 Department: ${userData.department}\n`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  ${user.userData.role.toUpperCase()} user already exists: ${user.email}`);
        } else {
          console.error(`❌ Error creating ${user.userData.role}:`, error.message);
        }
        console.log(''); // Add spacing
      }
    }
    
    console.log('🎉 Setup completed!');
    console.log('\n📋 Test all logins:');
    console.log('• Admin: http://localhost:3000/login?role=admin');
    console.log('• Doctor: http://localhost:3000/login?role=doctor (already working)');
    console.log('• Nurse: http://localhost:3000/login?role=nurse');
    console.log('• Patient: http://localhost:3000/login?role=patient (already working)');
    
    console.log('\n🔐 All credentials: medengine123');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

createRemainingUsers();
