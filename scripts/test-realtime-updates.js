// Test real-time updates by adding new vitals and medications
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

const PATIENT_ID = 'sample-patient-1';

async function addNewVitals() {
  console.log('Adding new vitals reading...');
  
  const newVitals = {
    patientId: PATIENT_ID,
    bloodPressure: '125/85',
    heartRate: 78,
    temperature: 99.1,
    oxygenSaturation: 96,
    weight: 152,
    height: 68,
    createdAt: new Date().toISOString(),
    recordedBy: 'Nurse Wilson',
    notes: 'Patient reports feeling slightly tired'
  };

  // Add to vitals collection
  await addDoc(collection(db, 'vitals'), newVitals);
  
  // Add to vital_signs collection with structured format
  const structuredVitals = {
    vitalRecordId: `vital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patient: {
      id: newVitals.patientId,
      name: 'John Doe',
      email: 'john@example.com'
    },
    recordedBy: {
      id: 'nurse-1',
      name: newVitals.recordedBy
    },
    vitals: {
      bloodPressure: {
        systolic: parseFloat(newVitals.bloodPressure.split('/')[0]),
        diastolic: parseFloat(newVitals.bloodPressure.split('/')[1]),
        combined: newVitals.bloodPressure,
        unit: 'mmHg',
        status: 'slightly elevated'
      },
      heartRate: {
        value: newVitals.heartRate,
        unit: 'bpm',
        status: 'normal'
      },
      temperature: {
        value: newVitals.temperature,
        unit: '°F',
        status: 'slightly elevated'
      },
      oxygenSaturation: {
        value: newVitals.oxygenSaturation,
        unit: '%'
      },
      weight: {
        value: newVitals.weight,
        unit: 'lbs'
      },
      height: {
        value: newVitals.height,
        unit: 'inches'
      }
    },
    metadata: {
      measurementTime: new Date(),
      createdAt: new Date()
    },
    overallStatus: 'attention',
    alerts: [{
      priority: 'medium',
      message: 'Blood pressure slightly elevated, monitor closely'
    }]
  };

  await addDoc(collection(db, 'vital_signs'), structuredVitals);
  console.log('✅ New vitals added successfully!');
}

async function addNewMedication() {
  console.log('Adding new medication...');
  
  const newMedication = {
    patientId: PATIENT_ID,
    medication: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    duration: '60 days',
    prescribedBy: 'Dr. Martinez',
    status: 'active',
    createdAt: new Date().toISOString(),
    notes: 'Take with food for better absorption'
  };

  // Add to both collections
  await addDoc(collection(db, 'medications'), newMedication);
  await addDoc(collection(db, 'prescriptions'), newMedication);
  console.log('✅ New medication added successfully!');
}

async function main() {
  try {
    console.log('Testing real-time updates...\n');
    
    await addNewVitals();
    console.log('');
    await addNewMedication();
    
    console.log('\n🎉 Real-time test data added!');
    console.log('\nIf you have the patient dashboard open, you should see:');
    console.log('1. New vitals reading appear immediately');
    console.log('2. New medication appear in the prescriptions list');
    console.log('3. The "Live • Updated" status should refresh with current time');
    console.log('\nThe real-time listeners will pick up these changes automatically!');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

main();
