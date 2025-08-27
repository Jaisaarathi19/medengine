const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAP_hmHCz5MvtljNvXFTlBd7j5Cpt2MhCk",
  authDomain: "medengineai-7755c.firebaseapp.com",
  projectId: "medengineai-7755c",
  storageBucket: "medengineai-7755c.firebasestorage.app",
  messagingSenderId: "665693476108",
  appId: "1:665693476108:web:3f3e2dbde7c1b24a0e0c63",
  measurementId: "G-M5CNQV1N77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testCredentials = [
  { email: 'admin@medengine.com', password: 'MedEngine2024!' },
  { email: 'doctor@medengine.com', password: 'Doctor2024!' },
  { email: 'nurse@medengine.com', password: 'Nurse2024!' },
  { email: 'patient@medengine.com', password: 'Patient2024!' }
];

async function verifyCredentials() {
  console.log('🔍 Verifying Firebase Authentication credentials...\n');
  
  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.email}`);
      
      // Try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, cred.email, cred.password);
      const user = userCredential.user;
      
      console.log(`✅ Login successful!`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      
      // Check user document in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`   Role: ${userData.role}`);
        console.log(`   Name: ${userData.profile?.name || 'N/A'}`);
      } else {
        console.log(`   ⚠️  No user document found in Firestore`);
      }
      
      // Sign out
      await signOut(auth);
      console.log(`   Signed out successfully\n`);
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.code}`);
      console.log(`   Message: ${error.message}\n`);
    }
  }
  
  console.log('🏁 Verification completed!');
  process.exit(0);
}

verifyCredentials().catch(console.error);
