// scripts/add-sample-appointments.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAP_hAeEe8y0IKoTgCRBAi2CblU5t5pWNs",
  authDomain: "medengine-ai.firebaseapp.com",
  projectId: "medengine-ai",
  storageBucket: "medengine-ai.firebasestorage.app",
  messagingSenderId: "502854600885",
  appId: "1:502854600885:web:b4f0d5a8b7c9a9e8e9f0a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addSampleAppointments = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    
    const sampleAppointments = [
      {
        appointmentId: `APT-${Date.now()}-1`,
        patient: {
          id: 'patient_001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1-555-0123'
        },
        appointment: {
          date: today,
          time: '09:00 AM',
          department: 'General Medicine',
          doctor: 'Dr. Smith',
          reason: 'Follow-up consultation',
          type: 'Follow-up',
          priority: 'normal'
        },
        status: 'scheduled',
        notes: 'Post-surgery check-up',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appointmentId: `APT-${Date.now()}-2`,
        patient: {
          id: 'patient_002',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+1-555-0234'
        },
        appointment: {
          date: today,
          time: '10:30 AM',
          department: 'Cardiology',
          doctor: 'Dr. Smith',
          reason: 'Routine cardiac check-up',
          type: 'Check-up',
          priority: 'normal'
        },
        status: 'confirmed',
        notes: 'Annual cardiac screening',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appointmentId: `APT-${Date.now()}-3`,
        patient: {
          id: 'patient_003',
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '+1-555-0345'
        },
        appointment: {
          date: today,
          time: '02:00 PM',
          department: 'Internal Medicine',
          doctor: 'Dr. Smith',
          reason: 'New patient consultation',
          type: 'Consultation',
          priority: 'high'
        },
        status: 'scheduled',
        notes: 'Initial assessment for chronic symptoms',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appointmentId: `APT-${Date.now()}-4`,
        patient: {
          id: 'patient_004',
          name: 'Robert Wilson',
          email: 'robert.wilson@email.com',
          phone: '+1-555-0456'
        },
        appointment: {
          date: today,
          time: '03:30 PM',
          department: 'Physical Therapy',
          doctor: 'Dr. Smith',
          reason: 'Physical therapy evaluation',
          type: 'Treatment',
          priority: 'normal'
        },
        status: 'scheduled',
        notes: 'Post-injury rehabilitation assessment',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log(`Adding ${sampleAppointments.length} sample appointments for ${today}...`);
    
    for (const appointmentData of sampleAppointments) {
      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      console.log(`✅ Added appointment: ${appointmentData.patient.name} at ${appointmentData.appointment.time} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully added all sample appointments!');
    console.log('🌐 Visit http://localhost:3000/dashboard/doctor to see them in action');
    
  } catch (error) {
    console.error('❌ Error adding sample appointments:', error);
  }
};

addSampleAppointments();
