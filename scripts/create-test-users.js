// Create test users via the client SDK
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
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

const testUsers = [
  {
    email: 'admin@medengine.com',
    password: 'MedEngine2024!',
    role: 'admin',
    profile: {
      name: 'Dr. Sarah Johnson',
      department: 'Administration',
      phone: '+1-555-0101',
      specialization: 'Hospital Administration'
    }
  },
  {
    email: 'doctor@medengine.com',
    password: 'Doctor2024!',
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
    email: 'nurse@medengine.com',
    password: 'Nurse2024!',
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
    email: 'patient@medengine.com',
    password: 'Patient2024!',
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

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const userData of testUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;
      console.log(`✅ Created auth user: ${user.uid}`);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: userData.email,
        role: userData.role,
        profile: userData.profile,
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      });
      
      console.log(`✅ Created user document for: ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Test users creation completed!');
  console.log('\n📋 Login Credentials:');
  console.log('='.repeat(50));
  testUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Name: ${user.profile.name}`);
    console.log('');
  });
  
  process.exit(0);
}

createTestUsers().catch(console.error);
