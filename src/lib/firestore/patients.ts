// src/lib/firestore/patients.ts
import { collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create patient record
export const createPatient = async (patientData: any) => {
  const docRef = await addDoc(collection(db, 'patients'), {
    email: patientData.email,
    uid: patientData.uid,
    profile: {
      name: patientData.profile.name,
      age: patientData.profile.age,
      gender: patientData.profile.gender,
      phone: patientData.profile.phone,
      address: patientData.profile.address,
      emergencyContact: patientData.profile.emergencyContact,
      bloodType: patientData.profile.bloodType,
      allergies: patientData.profile.allergies,
      medicalHistory: patientData.profile.medicalHistory
    },
    latestVitals: null,
    lastVitalCheck: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Search patients by name or email
export const searchPatients = async (searchTerm: string) => {
  const patientsRef = collection(db, 'patients');
  const snapshot = await getDocs(patientsRef);
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((patient: any) => 
      patient.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Get patient by ID
export const getPatient = async (patientId: string) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Update patient's latest vitals
export const updatePatientVitals = async (patientId: string, vitals: any) => {
  const patientRef = doc(db, 'patients', patientId);
  await updateDoc(patientRef, {
    latestVitals: vitals,
    lastVitalCheck: new Date(),
    updatedAt: new Date()
  });
};
