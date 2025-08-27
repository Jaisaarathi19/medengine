#!/usr/bin/env node

/**
 * Create User Role Document for Authenticated User
 * Run: node scripts/create-user-role-simple.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - replace with your values if needed
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

async function createUserRoleDocument() {
  try {
    console.log('🔥 Creating user role document...');
    
    // The UID from your console warning
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
    console.log('🔄 Refresh your browser to see the changes.');
    
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    console.log('\n💡 Alternative: Create the document manually in Firebase Console');
    console.log('   https://console.firebase.google.com/project/medengine-ai/firestore/data');
  }
}

createUserRoleDocument();
