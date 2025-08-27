#!/usr/bin/env node

/**
 * Create Patient User in Firebase Authentication and Firestore
 * This will create both the auth user and role document
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

async function createPatientUser() {
  try {
    console.log('🔥 Creating patient user account...');
    
    const email = 'patient@medengine.ai';
    const password = 'medengine123';
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Patient user created in Firebase Auth');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 UID: ${user.uid}`);
    
    // Create user role document in Firestore
    const userData = {
      uid: user.uid,
      email: email,
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

    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log('✅ Patient role document created in Firestore');
    console.log(`👤 Name: ${userData.name}`);
    console.log(`🏥 Role: ${userData.role}`);
    console.log('\n🎉 Patient account fully set up!');
    console.log('\n🧪 Test login:');
    console.log(`URL: http://localhost:3000/login?role=patient`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  User already exists in Firebase Auth');
      console.log('💡 Try logging in, or check if role document exists in Firestore');
    } else {
      console.error('❌ Error creating patient user:', error.message);
    }
  }
}

createPatientUser();
