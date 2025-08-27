#!/usr/bin/env node

/**
 * Firebase Setup Script for MedEngine AI
 * This script helps set up initial data and configurations
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration - using the same config as your project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample user role data
const sampleUsers = [
  {
    uid: 'admin-sample-uid', // Replace with actual UID from Firebase Auth
    email: 'admin@medengine.ai',
    name: 'System Administrator',
    role: 'admin',
    department: 'IT Administration',
    phone: '+1-555-0101',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'doctor-sample-uid', // Replace with actual UID from Firebase Auth
    email: 'doctor@medengine.ai',
    name: 'Dr. Sarah Chen',
    role: 'doctor',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    licenseNumber: 'MD-12345',
    phone: '+1-555-0102',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'nurse-sample-uid', // Replace with actual UID from Firebase Auth  
    email: 'nurse@medengine.ai',
    name: 'Emily Rodriguez',
    role: 'nurse',
    department: 'Emergency',
    shift: 'Day Shift',
    licenseNumber: 'RN-67890',
    phone: '+1-555-0103',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'patient-sample-uid', // Replace with actual UID from Firebase Auth
    email: 'patient@medengine.ai',
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
  }
];

// Sample patient data
const samplePatients = [
  {
    id: 'patient-001',
    name: 'John Smith',
    age: 38,
    gender: 'Male',
    room: '101A',
    condition: 'Stable',
    admissionDate: '2024-01-15',
    doctor: 'Dr. Sarah Chen',
    department: 'Cardiology',
    vitals: {
      heartRate: 72,
      bloodPressure: '120/80',
      temperature: 98.6,
      oxygenSaturation: 98,
      respiratoryRate: 16
    },
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily' }
    ],
    allergies: ['Penicillin'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'patient-002',
    name: 'Maria Rodriguez',
    age: 45,
    gender: 'Female',
    room: '102B',
    condition: 'Stable',
    admissionDate: '2024-01-18',
    doctor: 'Dr. Sarah Chen',
    department: 'Cardiology',
    vitals: {
      heartRate: 68,
      bloodPressure: '118/75',
      temperature: 98.4,
      oxygenSaturation: 99,
      respiratoryRate: 15
    },
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' }
    ],
    allergies: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample appointment data
const sampleAppointments = [
  {
    id: 'apt-001',
    patientId: 'patient-sample-uid',
    patientName: 'John Smith',
    doctorId: 'doctor-sample-uid',
    doctorName: 'Dr. Sarah Chen',
    department: 'Cardiology',
    date: '2024-01-25',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'Scheduled',
    notes: 'Post-procedure follow-up',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'apt-002',
    patientId: 'patient-sample-uid',
    patientName: 'John Smith',
    doctorId: 'doctor-sample-uid',
    doctorName: 'Dr. Sarah Chen',
    department: 'Cardiology',
    date: '2024-02-01',
    time: '2:30 PM',
    type: 'Consultation',
    status: 'Scheduled',
    notes: 'Routine check-up',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function setupFirestoreData() {
  try {
    console.log('🔥 Setting up Firestore data for MedEngine AI...\n');

    // Create user role documents
    console.log('👥 Creating user role documents...');
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }

    // Create sample patient data
    console.log('\n🏥 Creating sample patient data...');
    for (const patient of samplePatients) {
      await setDoc(doc(db, 'patients', patient.id), patient);
      console.log(`✅ Created patient: ${patient.name}`);
    }

    // Create sample appointments
    console.log('\n📅 Creating sample appointments...');
    for (const appointment of sampleAppointments) {
      await setDoc(doc(db, 'appointments', appointment.id), appointment);
      console.log(`✅ Created appointment: ${appointment.patientName} - ${appointment.date}`);
    }

    console.log('\n🎉 Firestore setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update the UIDs in this script with actual Firebase Auth UIDs');
    console.log('2. Run this script again to create user documents with correct UIDs');
    console.log('3. Test authentication with your test accounts');
    console.log('4. Visit http://localhost:3001 to start using MedEngine AI');

  } catch (error) {
    console.error('❌ Error setting up Firestore data:', error);
  }
}

// Export for use as module
export { setupFirestoreData };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupFirestoreData();
}
