// src/lib/firestore/prescriptions.ts
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create prescription
export const createPrescription = async (prescriptionData: any) => {
  const prescriptionId = `RX-${Date.now()}`;
  
  const docRef = await addDoc(collection(db, 'prescriptions'), {
    prescriptionId,
    patient: {
      id: prescriptionData.patientId,
      name: prescriptionData.patientName,
      email: prescriptionData.patientEmail
    },
    prescribedBy: {
      id: prescriptionData.doctorId,
      name: prescriptionData.doctorName,
      specialization: prescriptionData.doctorSpecialization
    },
    medications: prescriptionData.medications.map((med: any) => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
      quantity: med.quantity
    })),
    diagnosis: prescriptionData.diagnosis,
    notes: prescriptionData.notes,
    status: 'active',
    createdAt: new Date(),
    validUntil: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
  });
  
  return { id: docRef.id, prescriptionId };
};

// Get patient prescriptions
export const getPatientPrescriptions = async (patientId: string) => {
  const q = query(
    collection(db, 'prescriptions'),
    where('patient.id', '==', patientId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get active prescriptions
export const getActivePrescriptions = async () => {
  const q = query(
    collection(db, 'prescriptions'),
    where('status', '==', 'active'),
    where('validUntil', '>', new Date())
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
