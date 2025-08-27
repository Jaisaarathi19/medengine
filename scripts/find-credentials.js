const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');

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

// Try common passwords that might have been used
const commonPasswords = [
  'password123',
  'admin123',
  'test123',
  'medengine123',
  'MedEngine123',
  'password',
  '123456',
  'admin',
  'test'
];

const emails = [
  'admin@medengine.com',
  'doctor@medengine.com',
  'nurse@medengine.com',
  'patient@medengine.com'
];

async function findWorkingCredentials() {
  console.log('🔍 Trying to find working credentials...\n');
  
  for (const email of emails) {
    console.log(`Testing email: ${email}`);
    let found = false;
    
    for (const password of commonPasswords) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log(`✅ FOUND WORKING CREDENTIALS!`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}\n`);
        await signOut(auth);
        found = true;
        break;
      } catch (error) {
        // Silent fail, continue trying
      }
    }
    
    if (!found) {
      console.log(`   ❌ No working password found\n`);
    }
  }
  
  console.log('🏁 Search completed!');
  process.exit(0);
}

findWorkingCredentials().catch(console.error);
