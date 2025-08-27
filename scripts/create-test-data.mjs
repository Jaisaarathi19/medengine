// Simple script to add test patient data
import { db } from '../src/lib/firebase.js';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Test patient ID - replace with actual user ID when testing
const TEST_PATIENT_ID = 'test-patient-123';

async function createTestData() {
  try {
    console.log('Creating test data for patient:', TEST_PATIENT_ID);

    // Create patient document
    await setDoc(doc(db, 'patients', TEST_PATIENT_ID), {
      name: 'John Doe',
      email: 'john.doe@test.com',
      age: 35,
      bloodType: 'A+',
      allergies: ['Penicillin'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-0123',
        relationship: 'Spouse'
      },
      createdAt: new Date().toISOString()
    });

    // Create test vitals
    const vitalsData = [
      {
        patientId: TEST_PATIENT_ID,
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        createdAt: new Date('2024-12-27').toISOString()
      },
      {
        patientId: TEST_PATIENT_ID,
        heartRate: 68,
        bloodPressure: '118/78',
        temperature: 98.4,
        respiratoryRate: 15,
        oxygenSaturation: 99,
        createdAt: new Date('2024-12-26').toISOString()
      },
      {
        patientId: TEST_PATIENT_ID,
        heartRate: 75,
        bloodPressure: '122/82',
        temperature: 98.8,
        respiratoryRate: 17,
        oxygenSaturation: 97,
        createdAt: new Date('2024-12-25').toISOString()
      }
    ];

    for (const vital of vitalsData) {
      await addDoc(collection(db, 'vitals'), vital);
    }

    // Create test appointments
    const appointmentData = [
      {
        patientId: TEST_PATIENT_ID,
        doctorId: 'dr1',
        doctorName: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        date: new Date('2024-12-30T10:00:00').toISOString(),
        type: 'Follow-up',
        status: 'scheduled',
        location: 'Building A, Room 205',
        createdAt: new Date().toISOString()
      },
      {
        patientId: TEST_PATIENT_ID,
        doctorId: 'dr2',
        doctorName: 'Dr. Michael Johnson',
        specialty: 'Internal Medicine',
        date: new Date('2025-01-15T14:30:00').toISOString(),
        type: 'Check-up',
        status: 'scheduled',
        location: 'Building B, Room 110',
        createdAt: new Date().toISOString()
      }
    ];

    for (const appointment of appointmentData) {
      await addDoc(collection(db, 'appointments'), appointment);
    }

    // Create test prescriptions
    const prescriptionData = [
      {
        patientId: TEST_PATIENT_ID,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        prescribedBy: 'Dr. Sarah Smith',
        status: 'active',
        notes: 'Take with food',
        createdAt: new Date('2024-12-01').toISOString()
      },
      {
        patientId: TEST_PATIENT_ID,
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '90 days',
        prescribedBy: 'Dr. Michael Johnson',
        status: 'active',
        notes: 'Take with meals',
        createdAt: new Date('2024-11-15').toISOString()
      }
    ];

    for (const prescription of prescriptionData) {
      await addDoc(collection(db, 'prescriptions'), prescription);
    }

    // Create test lab results
    const labResultsData = [
      {
        patientId: TEST_PATIENT_ID,
        test: 'Complete Blood Count',
        results: 'All values within normal range',
        status: 'completed',
        orderedBy: 'Dr. Sarah Smith',
        date: new Date('2024-12-20').toISOString(),
        createdAt: new Date('2024-12-20').toISOString()
      },
      {
        patientId: TEST_PATIENT_ID,
        test: 'Lipid Panel',
        results: 'Cholesterol slightly elevated (205 mg/dL)',
        status: 'completed',
        orderedBy: 'Dr. Michael Johnson',
        date: new Date('2024-12-10').toISOString(),
        createdAt: new Date('2024-12-10').toISOString()
      }
    ];

    for (const labResult of labResultsData) {
      await addDoc(collection(db, 'labResults'), labResult);
    }

    console.log('✅ Test data created successfully!');
    console.log('Patient ID:', TEST_PATIENT_ID);
    console.log('Use this ID when logging in to see the test data.');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Run the script
createTestData();
