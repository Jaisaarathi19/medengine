/**
 * Firebase Data Initialization Script
 * Run this script once to set up initial sample data in your Firestore database
 * Usage: node scripts/init-firestore-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-project-id' // Replace with your actual project ID
});

const db = admin.firestore();

async function initializeData() {
  console.log('🔄 Initializing Firestore data...');

  try {
    // Sample users
    const users = [
      {
        id: 'admin-1',
        email: 'admin@medengine.ai',
        role: 'admin',
        name: 'System Administrator',
        createdAt: new Date()
      },
      {
        id: 'doctor-1',
        email: 'doctor@medengine.ai',
        role: 'doctor',
        name: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        createdAt: new Date()
      },
      {
        id: 'nurse-1',
        email: 'nurse@medengine.ai',
        role: 'nurse',
        name: 'Nurse Mary Wilson',
        department: 'Emergency',
        createdAt: new Date()
      },
      {
        id: 'patient-1',
        email: 'patient@medengine.ai',
        role: 'patient',
        name: 'John Smith',
        dateOfBirth: '1985-06-15',
        createdAt: new Date()
      }
    ];

    // Add users to Firestore
    for (const user of users) {
      await db.collection('users').doc(user.id).set(user);
      console.log(`✅ Added user: ${user.name} (${user.role})`);
    }

    // Sample patients data
    const patients = [
      {
        id: 'patient-1',
        name: 'John Smith',
        age: 38,
        gender: 'Male',
        bloodType: 'O+',
        allergies: ['Penicillin'],
        conditions: ['Hypertension'],
        vitals: {
          bloodPressure: '140/90',
          heartRate: 82,
          temperature: 98.6,
          oxygenLevel: 98,
          respiratoryRate: 16
        },
        lastVisit: new Date('2024-08-20'),
        createdAt: new Date()
      }
    ];

    for (const patient of patients) {
      await db.collection('patients').doc(patient.id).set(patient);
      console.log(`✅ Added patient: ${patient.name}`);
    }

    console.log('🎉 Firestore data initialization complete!');
    console.log('\n📋 Test Accounts Created:');
    console.log('Admin: admin@medengine.ai');
    console.log('Doctor: doctor@medengine.ai');
    console.log('Nurse: nurse@medengine.ai');
    console.log('Patient: patient@medengine.ai');
    console.log('\n🔑 Default password: medengine123');
    console.log('\n⚠️  Remember to create these users in Firebase Auth with the same emails!');

  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
}

initializeData().then(() => {
  process.exit(0);
});
