const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
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

async function forceCreateUsers() {
  console.log('🔥 Force creating test users...\n');
  
  for (const userData of testUsers) {
    try {
      console.log(`Creating: ${userData.email}`);
      
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
      
      console.log(`✅ Created Firestore document`);
      
      // Sign out after creation
      await signOut(auth);
      console.log(`✅ User created successfully: ${userData.email}\n`);
      
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Message: ${error.message}\n`);
    }
  }
  
  console.log('🎉 User creation process completed!');
  console.log('\n📋 Test these credentials:');
  console.log('='.repeat(40));
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
  
  process.exit(0);
}

forceCreateUsers().catch(console.error);
