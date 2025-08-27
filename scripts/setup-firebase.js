#!/usr/bin/env node

/**
 * Firebase Setup Script for MedEngine AI
 * This script helps initialize Firebase project with test data
 * 
 * Prerequisites:
 * 1. Firebase project created
 * 2. Firebase Admin SDK key downloaded
 * 3. Environment variables configured
 * 
 * Usage: node scripts/setup-firebase.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupFirebase() {
  console.log('🔥 MedEngine AI - Firebase Setup Script\n');

  try {
    // Check if service account key exists
    let serviceAccount;
    try {
      serviceAccount = require('../serviceAccountKey.json');
      console.log('✅ Service account key found');
    } catch (error) {
      console.log('❌ Service account key not found');
      console.log('\nTo get your service account key:');
      console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save as "serviceAccountKey.json" in project root');
      console.log('4. Re-run this script\n');
      process.exit(1);
    }

    // Get project ID from user or service account
    const projectId = serviceAccount.project_id || await question('Enter your Firebase project ID: ');

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });

    const db = admin.firestore();
    const auth = admin.auth();

    console.log(`\n🔄 Setting up Firebase project: ${projectId}`);

    // Create test users
    const testUsers = [
      {
        uid: 'admin-test',
        email: 'admin@medengine.ai',
        password: 'medengine123',
        displayName: 'System Administrator',
        role: 'admin',
        name: 'System Administrator',
        department: 'IT'
      },
      {
        uid: 'doctor-test',
        email: 'doctor@medengine.ai', 
        password: 'medengine123',
        displayName: 'Dr. Sarah Johnson',
        role: 'doctor',
        name: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        specialization: 'Interventional Cardiology'
      },
      {
        uid: 'nurse-test',
        email: 'nurse@medengine.ai',
        password: 'medengine123',
        displayName: 'Nurse Mary Wilson',
        role: 'nurse', 
        name: 'Nurse Mary Wilson',
        department: 'Emergency',
        specialization: 'Critical Care'
      },
      {
        uid: 'patient-test',
        email: 'patient@medengine.ai',
        password: 'medengine123',
        displayName: 'John Smith',
        role: 'patient',
        name: 'John Smith',
        dateOfBirth: '1985-06-15',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Shellfish']
      }
    ];

    console.log('\n👤 Creating test users...');
    for (const user of testUsers) {
      try {
        // Create user in Firebase Auth
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          emailVerified: true
        });

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          role: user.role,
          name: user.name,
          department: user.department,
          specialization: user.specialization,
          dateOfBirth: user.dateOfBirth,
          bloodType: user.bloodType,
          allergies: user.allergies,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    // Create sample patients data
    console.log('\n🏥 Creating sample patient data...');
    const patients = [
      {
        id: 'patient-001',
        name: 'John Smith',
        age: 38,
        gender: 'Male',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Shellfish'],
        conditions: ['Hypertension', 'Diabetes Type 2'],
        vitals: {
          bloodPressure: '140/90',
          heartRate: 82,
          temperature: 98.6,
          oxygenLevel: 98,
          respiratoryRate: 16,
          weight: 180,
          height: '5\'10"'
        },
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            prescribedBy: 'doctor-test'
          }
        ],
        lastVisit: new Date('2024-08-20'),
        nextAppointment: new Date('2024-09-15'),
        assignedDoctor: 'doctor-test'
      },
      {
        id: 'patient-002',
        name: 'Emma Johnson',
        age: 45,
        gender: 'Female',
        bloodType: 'A+',
        allergies: ['Sulfa drugs'],
        conditions: ['Asthma'],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 75,
          temperature: 98.2,
          oxygenLevel: 99,
          respiratoryRate: 14,
          weight: 140,
          height: '5\'6"'
        },
        medications: [
          {
            name: 'Albuterol',
            dosage: '90mcg',
            frequency: 'As needed',
            prescribedBy: 'doctor-test'
          }
        ],
        lastVisit: new Date('2024-08-22'),
        nextAppointment: new Date('2024-09-10'),
        assignedDoctor: 'doctor-test'
      }
    ];

    for (const patient of patients) {
      await db.collection('patients').doc(patient.id).set({
        ...patient,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Created patient: ${patient.name}`);
    }

    // Create sample appointments
    console.log('\n📅 Creating sample appointments...');
    const appointments = [
      {
        id: 'apt-001',
        patientId: 'patient-001',
        patientName: 'John Smith',
        doctorId: 'doctor-test',
        doctorName: 'Dr. Sarah Johnson',
        date: new Date('2024-09-15'),
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'scheduled',
        notes: 'Routine blood pressure check'
      },
      {
        id: 'apt-002', 
        patientId: 'patient-002',
        patientName: 'Emma Johnson',
        doctorId: 'doctor-test',
        doctorName: 'Dr. Sarah Johnson',
        date: new Date('2024-09-10'),
        time: '2:30 PM',
        type: 'Consultation',
        status: 'scheduled',
        notes: 'Asthma management review'
      }
    ];

    for (const appointment of appointments) {
      await db.collection('appointments').doc(appointment.id).set({
        ...appointment,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Created appointment: ${appointment.patientName} - ${appointment.date.toDateString()}`);
    }

    console.log('\n🎉 Firebase setup completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│  Role    │  Email                │  Password              │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│  Admin   │  admin@medengine.ai   │  medengine123          │');
    console.log('│  Doctor  │  doctor@medengine.ai  │  medengine123          │');
    console.log('│  Nurse   │  nurse@medengine.ai   │  medengine123          │');
    console.log('│  Patient │  patient@medengine.ai │  medengine123          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🔗 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Test login with any of the accounts above');
    console.log('4. Check Firebase Console to verify data creation');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure serviceAccountKey.json exists');
    console.log('2. Verify Firebase project ID is correct');
    console.log('3. Check that you have admin permissions');
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the setup
setupFirebase();
