const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (assuming you have credentials)
if (!admin.apps.length) {
  // You'll need to provide your Firebase Admin credentials
  admin.initializeApp({
    credential: admin.credential.cert({
      // Add your Firebase Admin SDK credentials here
    }),
    databaseURL: "https://medengine-temp-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function createSamplePatientData() {
  try {
    const patientId = 'test-patient-123'; // Replace with actual patient ID

    // Create sample patient document
    await db.collection('patients').doc(patientId).set({
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 35,
      bloodType: 'A+',
      allergies: ['Penicillin', 'Nuts'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1 (555) 123-4567',
        relationship: 'Spouse'
      },
      createdAt: new Date().toISOString()
    });

    // Create sample appointments
    const appointments = [
      {
        id: 'apt1',
        patientId: patientId,
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
        id: 'apt2',
        patientId: patientId,
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

    for (const appointment of appointments) {
      await db.collection('appointments').add(appointment);
    }

    // Create sample vitals
    const vitals = [
      {
        patientId: patientId,
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        createdAt: new Date('2024-12-25').toISOString()
      },
      {
        patientId: patientId,
        bloodPressure: '118/78',
        heartRate: 68,
        temperature: 98.4,
        createdAt: new Date('2024-12-20').toISOString()
      },
      {
        patientId: patientId,
        bloodPressure: '122/82',
        heartRate: 75,
        temperature: 98.8,
        createdAt: new Date('2024-12-15').toISOString()
      }
    ];

    for (const vital of vitals) {
      await db.collection('vitals').add(vital);
    }

    // Create sample prescriptions
    const prescriptions = [
      {
        patientId: patientId,
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
        patientId: patientId,
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

    for (const prescription of prescriptions) {
      await db.collection('prescriptions').add(prescription);
    }

    // Create sample lab results
    const labResults = [
      {
        patientId: patientId,
        test: 'Complete Blood Count',
        results: 'All values within normal range',
        status: 'completed',
        orderedBy: 'Dr. Sarah Smith',
        date: new Date('2024-12-20').toISOString(),
        createdAt: new Date('2024-12-20').toISOString()
      },
      {
        patientId: patientId,
        test: 'Lipid Panel',
        results: 'Cholesterol slightly elevated (205 mg/dL)',
        status: 'completed',
        orderedBy: 'Dr. Michael Johnson',
        date: new Date('2024-12-10').toISOString(),
        createdAt: new Date('2024-12-10').toISOString()
      }
    ];

    for (const labResult of labResults) {
      await db.collection('labResults').add(labResult);
    }

    console.log('Sample patient data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSamplePatientData();
