// Create sample patient vitals and medications for testing
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP_h7PbUsW6e1OGXnrG-L6aMnU8BpKKhs",
  authDomain: "medengine-ai.firebaseapp.com",
  projectId: "medengine-ai",
  storageBucket: "medengine-ai.firebasestorage.app",
  messagingSenderId: "850330897754",
  appId: "1:850330897754:web:5a7b4bbded60e3bb5f8bc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample patient ID - you can change this to test with different patients
const PATIENT_ID = 'sample-patient-1';

async function createSampleVitals() {
  console.log('Creating sample vitals for patient:', PATIENT_ID);

  const vitalsData = [
    {
      patientId: PATIENT_ID,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98,
      weight: 150,
      height: 68,
      createdAt: new Date().toISOString(),
      recordedBy: 'Dr. Smith',
      notes: 'Patient feeling well, routine checkup'
    },
    {
      patientId: PATIENT_ID,
      bloodPressure: '118/78',
      heartRate: 75,
      temperature: 98.4,
      oxygenSaturation: 99,
      weight: 149,
      height: 68,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      recordedBy: 'Nurse Johnson',
      notes: 'Follow-up after medication adjustment'
    },
    {
      patientId: PATIENT_ID,
      bloodPressure: '122/82',
      heartRate: 70,
      temperature: 98.8,
      oxygenSaturation: 97,
      weight: 151,
      height: 68,
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      recordedBy: 'Dr. Wilson',
      notes: 'Pre-surgery vitals check'
    }
  ];

  // Add to both collections to test data retrieval
  for (const vitals of vitalsData) {
    // Add to vitals collection
    await addDoc(collection(db, 'vitals'), vitals);
    console.log('Added vitals to vitals collection');

    // Add to vital_signs collection with structured format
    const structuredVitals = {
      vitalRecordId: `vital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patient: {
        id: vitals.patientId,
        name: 'John Doe',
        email: 'john@example.com'
      },
      recordedBy: {
        id: 'doctor-1',
        name: vitals.recordedBy
      },
      vitals: {
        bloodPressure: {
          systolic: parseFloat(vitals.bloodPressure.split('/')[0]),
          diastolic: parseFloat(vitals.bloodPressure.split('/')[1]),
          combined: vitals.bloodPressure,
          unit: 'mmHg',
          status: 'normal'
        },
        heartRate: {
          value: vitals.heartRate,
          unit: 'bpm',
          status: 'normal'
        },
        temperature: {
          value: vitals.temperature,
          unit: '°F',
          status: 'normal'
        },
        oxygenSaturation: {
          value: vitals.oxygenSaturation,
          unit: '%'
        },
        weight: {
          value: vitals.weight,
          unit: 'lbs'
        },
        height: {
          value: vitals.height,
          unit: 'inches'
        }
      },
      metadata: {
        measurementTime: new Date(vitals.createdAt),
        createdAt: new Date(vitals.createdAt)
      },
      overallStatus: 'normal',
      alerts: []
    };

    await addDoc(collection(db, 'vital_signs'), structuredVitals);
    console.log('Added vitals to vital_signs collection');
  }
}

async function createSampleMedications() {
  console.log('Creating sample medications for patient:', PATIENT_ID);

  const medicationsData = [
    {
      patientId: PATIENT_ID,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      prescribedBy: 'Dr. Smith',
      status: 'active',
      createdAt: new Date().toISOString(),
      notes: 'Take with breakfast'
    },
    {
      patientId: PATIENT_ID,
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      prescribedBy: 'Dr. Wilson',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Take with meals to reduce stomach upset'
    },
    {
      patientId: PATIENT_ID,
      medication: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'As needed',
      duration: '14 days',
      prescribedBy: 'Dr. Johnson',
      status: 'completed',
      createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      notes: 'For post-surgical pain management'
    }
  ];

  // Add to both collections
  for (const medication of medicationsData) {
    // Add to medications collection
    await addDoc(collection(db, 'medications'), medication);
    console.log('Added medication to medications collection');

    // Add to prescriptions collection
    await addDoc(collection(db, 'prescriptions'), medication);
    console.log('Added medication to prescriptions collection');
  }
}

async function createSampleAppointments() {
  console.log('Creating sample appointments for patient:', PATIENT_ID);

  const appointmentsData = [
    {
      patientId: PATIENT_ID,
      doctorName: 'Dr. Sarah Smith',
      doctorId: 'doctor-1',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'scheduled',
      reason: 'Blood pressure monitoring',
      createdAt: new Date().toISOString()
    },
    {
      patientId: PATIENT_ID,
      doctorName: 'Dr. Michael Wilson',
      doctorId: 'doctor-2',
      date: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
      time: '2:30 PM',
      type: 'Routine Checkup',
      status: 'scheduled',
      reason: 'Annual physical examination',
      createdAt: new Date().toISOString()
    },
    {
      patientId: PATIENT_ID,
      doctorName: 'Dr. Emily Johnson',
      doctorId: 'doctor-3',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      time: '9:00 AM',
      type: 'Consultation',
      status: 'completed',
      reason: 'Medication review',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const appointment of appointmentsData) {
    await addDoc(collection(db, 'appointments'), appointment);
    console.log('Added appointment');
  }
}

async function createSampleLabResults() {
  console.log('Creating sample lab results for patient:', PATIENT_ID);

  const labResultsData = [
    {
      patientId: PATIENT_ID,
      test: 'Complete Blood Count (CBC)',
      results: 'All values within normal range',
      status: 'completed',
      orderedBy: 'Dr. Smith',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      patientId: PATIENT_ID,
      test: 'Lipid Panel',
      results: 'Total cholesterol: 180 mg/dL (Normal), HDL: 55 mg/dL (Good), LDL: 110 mg/dL (Normal)',
      status: 'completed',
      orderedBy: 'Dr. Wilson',
      date: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      patientId: PATIENT_ID,
      test: 'HbA1c',
      results: 'Pending lab processing',
      status: 'pending',
      orderedBy: 'Dr. Johnson',
      date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      createdAt: new Date().toISOString()
    }
  ];

  for (const labResult of labResultsData) {
    await addDoc(collection(db, 'labResults'), labResult);
    console.log('Added lab result');
  }
}

async function main() {
  try {
    console.log('Starting sample data creation...');
    
    await createSampleVitals();
    await createSampleMedications();
    await createSampleAppointments();
    await createSampleLabResults();
    
    console.log('\n✅ Sample data created successfully!');
    console.log(`\nTo test the patient dashboard:`);
    console.log(`1. Login as a patient with ID: ${PATIENT_ID}`);
    console.log(`2. Or update the PATIENT_ID in this script to match your test user`);
    console.log(`3. The dashboard should now show real-time data`);
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

main();
