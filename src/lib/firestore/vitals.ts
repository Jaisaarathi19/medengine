// src/lib/firestore/vitals.ts
import { collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper functions for status calculation
const calculateBPStatus = (systolic: string, diastolic: string) => {
  const sys = parseFloat(systolic);
  const dia = parseFloat(diastolic);
  if (!sys || !dia) return null;
  if (sys >= 140 || dia >= 90) return 'high';
  if (sys < 90 || dia < 60) return 'low';
  return 'normal';
};

const calculateHRStatus = (heartRate: string) => {
  const hr = parseFloat(heartRate);
  if (!hr) return null;
  if (hr > 100) return 'high';
  if (hr < 60) return 'low';
  return 'normal';
};

const calculateTempStatus = (temperature: string) => {
  const temp = parseFloat(temperature);
  if (!temp) return null;
  if (temp > 99.5) return 'high';
  if (temp < 97.0) return 'low';
  return 'normal';
};

const calculateOverallStatus = (vitals: any) => {
  const statuses = Object.values(vitals)
    .filter((vital: any) => vital && vital.status)
    .map((vital: any) => vital.status);
  
  if (statuses.includes('high') || statuses.includes('low')) return 'abnormal';
  return 'normal';
};

const generateVitalAlerts = (vitals: any, patientName: string) => {
  const alerts: any[] = [];
  
  // Blood pressure alerts
  if (vitals.bloodPressure.systolic > 180 || vitals.bloodPressure.diastolic > 120) {
    alerts.push({
      priority: 'high',
      title: 'Hypertensive Crisis',
      message: `${patientName} has critically high blood pressure: ${vitals.bloodPressure.combined}`
    });
  }
  
  // Heart rate alerts
  if (vitals.heartRate.value > 120 || vitals.heartRate.value < 50) {
    alerts.push({
      priority: 'high',
      title: 'Abnormal Heart Rate',
      message: `${patientName} has ${vitals.heartRate.value < 50 ? 'bradycardia' : 'tachycardia'}: ${vitals.heartRate.value} bpm`
    });
  }
  
  return alerts;
};

// Create vital signs record
export const createVitalRecord = async (vitalData: any) => {
  const vitalRecordId = `VIT-${Date.now()}`;
  
  // Prepare vitals with status indicators
  const vitals = {
    bloodPressure: {
      systolic: vitalData.systolic ? parseFloat(vitalData.systolic) : null,
      diastolic: vitalData.diastolic ? parseFloat(vitalData.diastolic) : null,
      status: calculateBPStatus(vitalData.systolic, vitalData.diastolic),
      combined: vitalData.systolic && vitalData.diastolic ? `${vitalData.systolic}/${vitalData.diastolic}` : null
    },
    heartRate: {
      value: vitalData.heartRate ? parseFloat(vitalData.heartRate) : null,
      status: calculateHRStatus(vitalData.heartRate),
      unit: 'bpm'
    },
    temperature: {
      value: vitalData.temperature ? parseFloat(vitalData.temperature) : null,
      status: calculateTempStatus(vitalData.temperature),
      unit: '°F'
    },
    respiratoryRate: {
      value: vitalData.respiratoryRate ? parseFloat(vitalData.respiratoryRate) : null,
      unit: 'breaths/min'
    },
    oxygenSaturation: {
      value: vitalData.oxygenSaturation ? parseFloat(vitalData.oxygenSaturation) : null,
      unit: '%'
    },
    weight: {
      value: vitalData.weight ? parseFloat(vitalData.weight) : null,
      unit: 'lbs'
    },
    height: {
      value: vitalData.height ? parseFloat(vitalData.height) : null,
      unit: 'inches'
    },
    bmi: {
      value: vitalData.bmi ? parseFloat(vitalData.bmi) : null
    }
  };
  
  const docRef = await addDoc(collection(db, 'vital_signs'), {
    vitalRecordId,
    patient: {
      id: vitalData.patientId,
      name: vitalData.patientName,
      email: vitalData.patientEmail
    },
    recordedBy: {
      id: vitalData.recordedById,
      name: vitalData.recordedByName
    },
    vitals,
    assessment: {
      symptoms: vitalData.symptoms,
      painScale: vitalData.painScale ? parseInt(vitalData.painScale) : null,
      conditions: vitalData.conditions,
      notes: vitalData.notes
    },
    metadata: {
      measurementTime: new Date(vitalData.measurementTime),
      location: vitalData.location,
      createdAt: new Date()
    },
    overallStatus: calculateOverallStatus(vitals),
    alerts: generateVitalAlerts(vitals, vitalData.patientName)
  });
  
  // Update patient's latest vitals
  if (vitalData.patientId) {
    const patientRef = doc(db, 'patients', vitalData.patientId);
    await updateDoc(patientRef, {
      latestVitals: vitals,
      lastVitalCheck: new Date(),
      updatedAt: new Date()
    });
  }
  
  return { id: docRef.id, vitalRecordId };
};

// Get patient vital history
export const getPatientVitals = async (patientId: string, limitCount: number = 10) => {
  const q = query(
    collection(db, 'vital_signs'),
    where('patient.id', '==', patientId),
    orderBy('metadata.measurementTime', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
