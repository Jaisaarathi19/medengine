#!/usr/bin/env node

/**
 * Check All Existing Users
 * This will show all users in Firestore to help debug login issues
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all existing users in Firestore...\n');
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    if (querySnapshot.empty) {
      console.log('⚠️  No users found in Firestore');
      console.log('💡 You need to create user role documents first');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.size} user(s) in Firestore:\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 ${data.role?.toUpperCase() || 'UNKNOWN'}: ${data.name || 'No name'}`);
      console.log(`   📧 Email: ${data.email || 'No email'}`);
      console.log(`   🆔 UID: ${doc.id}`);
      console.log(`   🏥 Department: ${data.department || 'Not specified'}`);
      console.log('');
    });
    
    console.log('🧪 Test login URLs:');
    console.log('• Admin: http://localhost:3000/login?role=admin');
    console.log('• Doctor: http://localhost:3000/login?role=doctor');
    console.log('• Nurse: http://localhost:3000/login?role=nurse');
    console.log('• Patient: http://localhost:3000/login?role=patient');
    
    console.log('\n🔐 Common password for all test accounts: medengine123');
    
    console.log('\n💡 If getting auth/invalid-credential:');
    console.log('1. Make sure the user exists in Firebase Authentication');
    console.log('2. Use the correct email from the list above');
    console.log('3. Use password: medengine123');
    console.log('4. Check Firebase Auth console for the actual users');
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkAllUsers();
