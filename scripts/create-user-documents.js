const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function createUserDocuments() {
  console.log('🔧 Creating user role documents...\n');
  
  // I got these UIDs from the previous script output
  const users = [
    {
      uid: 'MTm8xyxS7WMKYqEXZkQiP5jRnXo2',
      email: 'admin@medengine.com',
      role: 'admin',
      profile: {
        name: 'Dr. Sarah Johnson',
        department: 'Administration',
        phone: '+1-555-0101',
        specialization: 'Hospital Administration'
      }
    },
    {
      uid: 'V50XVhuHnreL1OK4dDDvTVevm842',
      email: 'doctor@medengine.com',
      role: 'doctor',
      profile: {
        name: 'Dr. Michael Chen',
        department: 'Cardiology',
        phone: '+1-555-0102',
        specialization: 'Cardiologist',
        licenseNumber: 'MD-12345'
      }
    },
    {
      uid: 'aP8kG4LAIKSgFV6XXxkPCWZjI0D3',
      email: 'nurse@medengine.com',
      role: 'nurse',
      profile: {
        name: 'Emily Rodriguez',
        department: 'Emergency',
        phone: '+1-555-0103',
        shift: 'Day Shift',
        licenseNumber: 'RN-67890'
      }
    },
    {
      uid: 'xVoquW43OtNlpDjymASqHoht5Hj1',
      email: 'patient@medengine.com',
      role: 'patient',
      profile: {
        name: 'John Smith',
        dateOfBirth: '1985-06-15',
        phone: '+1-555-0104',
        address: '123 Main St, City, State 12345',
        emergencyContact: 'Jane Smith - +1-555-0105'
      }
    }
  ];
  
  for (const userData of users) {
    try {
      // First, sign in as the user to have proper permissions
      await signInWithEmailAndPassword(auth, userData.email, 'medengine123');
      console.log(`Signed in as: ${userData.email}`);
      
      // Create the user document
      await setDoc(doc(db, 'users', userData.uid), {
        email: userData.email,
        role: userData.role,
        profile: userData.profile,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      });
      
      console.log(`✅ Created document for ${userData.role}: ${userData.email}\n`);
      
    } catch (error) {
      console.error(`❌ Error creating document for ${userData.email}:`, error.message);
      console.log('');
    }
  }
  
  console.log('🎉 User documents created!');
  console.log('\n📋 Try logging in now:');
  console.log('- patient@medengine.com / medengine123');
  console.log('- admin@medengine.com / medengine123');
  console.log('- doctor@medengine.com / medengine123');
  console.log('- nurse@medengine.com / medengine123');
  
  process.exit(0);
}

createUserDocuments().catch(console.error);
