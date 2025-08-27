#!/usr/bin/env node

/**
 * Create User Role Document for Authenticated User
 * Run this script to create the missing user role document
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAP_hmHCz5MvtljNvXFTlBd7j5Cpt2MhCk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'medengine-ai.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'medengine-ai',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'medengine-ai.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '529137634998',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:529137634998:web:65f828e916ae2d30c82017',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createUserRoleDocument() {
  try {
    console.log('🔥 Creating user role document...');
    
    // Replace with your actual UID
    const userId = 'V50XVhuHnreL1OK4dDDvTVevm842';
    
    const userData = {
      uid: userId,
      email: 'doctor@medengine.com',
      name: 'Dr. Sarah Chen',
      role: 'doctor',
      department: 'Cardiology',
      specialization: 'Interventional Cardiology',
      licenseNumber: 'MD-12345',
      phone: '+1-555-0102',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', userId), userData);
    
    console.log('✅ User role document created successfully!');
    console.log(`📝 User: ${userData.name} (${userData.role})`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`🏥 Department: ${userData.department}`);
    console.log('\n🎉 You can now access the Doctor Dashboard!');
    
  } catch (error) {
    console.error('❌ Error creating user document:', error);
  }
}

createUserRoleDocument();
