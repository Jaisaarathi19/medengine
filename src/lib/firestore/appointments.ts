// src/lib/firestore/appointments.ts
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create appointment
export const createAppointment = async (appointmentData: any) => {
  const appointmentId = `APT-${Date.now()}`;
  
  const docRef = await addDoc(collection(db, 'appointments'), {
    appointmentId,
    patient: {
      id: appointmentData.patientId,
      name: appointmentData.patientName,
      email: appointmentData.patientEmail,
      phone: appointmentData.patientPhone
    },
    appointment: {
      date: appointmentData.date,
      time: appointmentData.time,
      department: appointmentData.department,
      doctor: appointmentData.doctor,
      reason: appointmentData.reason,
      type: appointmentData.type,
      priority: appointmentData.priority
    },
    status: 'scheduled',
    notes: appointmentData.notes || '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return { id: docRef.id, appointmentId };
};

// Get appointments for a patient
export const getPatientAppointments = async (patientId: string) => {
  const q = query(
    collection(db, 'appointments'),
    where('patient.id', '==', patientId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get appointments by date range
export const getAppointmentsByDateRange = async (startDate: string, endDate: string) => {
  const q = query(
    collection(db, 'appointments'),
    where('appointment.date', '>=', startDate),
    where('appointment.date', '<=', endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
