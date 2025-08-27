const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

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

const userRoles = [
  {
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

async function checkAndFixUserRoles() {
  console.log('🔍 Checking and fixing user roles...\n');
  
  for (const userData of userRoles) {
    try {
      // Sign in to get the user UID
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, 'medengine123');
      const user = userCredential.user;
      
      console.log(`Checking: ${userData.email}`);
      console.log(`  UID: ${user.uid}`);
      
      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const docData = userDoc.data();
        console.log(`  ✅ Document exists with role: ${docData.role}`);
        
        if (docData.role !== userData.role) {
          console.log(`  ⚠️  Role mismatch! Updating from '${docData.role}' to '${userData.role}'`);
          await setDoc(userDocRef, {
            ...docData,
            role: userData.role,
            profile: userData.profile
          }, { merge: true });
          console.log(`  ✅ Role updated successfully`);
        }
      } else {
        console.log(`  ❌ No document found! Creating...`);
        await setDoc(userDocRef, {
          email: userData.email,
          role: userData.role,
          profile: userData.profile,
          createdAt: new Date(),
          lastLogin: null,
          isActive: true
        });
        console.log(`  ✅ Document created with role: ${userData.role}`);
      }
      
      await signOut(auth);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
      console.log('');
    }
  }
  
  console.log('🎉 User role check/fix completed!');
  console.log('\n📋 Ready to test:');
  userRoles.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / medengine123`);
  });
  
  process.exit(0);
}

checkAndFixUserRoles().catch(console.error);
