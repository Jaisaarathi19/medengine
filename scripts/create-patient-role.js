#!/usr/bin/env node

/**
 * Create Patient Role Document Only
 * Use this when the user exists in Firebase Auth but needs a role document
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp, collection, getDocs, query, where } = require('firebase/firestore');

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

async function findAndCreatePatientRole() {
  try {
    console.log('🔍 Looking for existing patient user...');
    
    // Look for existing user with patient email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'patient@medengine.ai'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('✅ Found existing patient role document');
      querySnapshot.forEach((doc) => {
        console.log(`📝 User: ${doc.data().name} (${doc.data().role})`);
        console.log(`🆔 UID: ${doc.id}`);
      });
      console.log('\n🎉 Patient should be able to log in now!');
      console.log('🧪 Test: http://localhost:3000/login?role=patient');
      return;
    }
    
    console.log('⚠️  No patient role document found');
    console.log('💡 Creating role document with placeholder UID...');
    
    // Create with a placeholder UID - will need to be updated with actual UID
    const placeholderUid = 'patient-placeholder-' + Date.now();
    
    const userData = {
      uid: placeholderUid,
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', placeholderUid), userData);
    
    console.log('✅ Patient role document created');
    console.log(`📝 Name: ${userData.name}`);
    console.log(`🏥 Role: ${userData.role}`);
    console.log(`🆔 Placeholder UID: ${placeholderUid}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Go to Firebase Auth and find the actual patient UID');
    console.log('2. Update the document ID in Firestore to use the actual UID');
    console.log('3. Or manually create the document with the correct UID');
    
    console.log('\n🔗 Firebase Auth: https://console.firebase.google.com/project/medengine-ai/authentication/users');
    console.log('🔗 Firestore: https://console.firebase.google.com/project/medengine-ai/firestore/data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findAndCreatePatientRole();
