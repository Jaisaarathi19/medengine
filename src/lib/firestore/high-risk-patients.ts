// src/lib/firestore/high-risk-patients.ts
// High-risk patients management for database storage and retrieval

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// High-risk patient interface
export interface HighRiskPatient {
  id?: string;
  patientId: string;
  name: string;
  age?: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  readmissionProbability: number;
  riskFactors: string[];
  confidence: string;
  mlPrediction: string;
  diagnosisInfo?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  medicalInfo?: {
    timeInHospital?: number;
    medications?: number;
    labProcedures?: number;
    specialty?: string;
  };
  uploadedAt: Timestamp;
  uploadedBy: string; // Admin user ID
  lastUpdated: Timestamp;
  isActive: boolean; // For soft deletion
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  notes?: string;
  doctorAssigned?: string;
  followUpRequired: boolean;
  alertStatus: 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
}

const HIGH_RISK_COLLECTION = 'highRiskPatients';

/**
 * Add multiple high-risk patients to database (from CSV upload)
 */
export async function saveHighRiskPatients(
  patients: Array<{
    id: string;
    name: string;
    riskLevel: string;
    riskFactors: string[];
    confidence: string;
    mlProbability: number;
    prediction: string;
    originalData?: any;
  }>,
  uploadedBy: string
): Promise<string[]> {
  try {
    const batch: string[] = [];
    const currentTime = Timestamp.now();

    for (const patient of patients) {
      // Only save High and Medium risk patients
      if (patient.riskLevel === 'High' || patient.riskLevel === 'Medium') {
        // Clean diagnosis info - remove undefined values
        const diagnosisInfo = patient.originalData ? {
          ...(patient.originalData.diag_1 !== undefined && { primary: patient.originalData.diag_1 }),
          ...(patient.originalData.diag_2 !== undefined && { secondary: patient.originalData.diag_2 }),
          ...(patient.originalData.diag_3 !== undefined && { tertiary: patient.originalData.diag_3 })
        } : null;

        // Clean medical info - remove undefined values
        const medicalInfo = patient.originalData ? {
          ...(patient.originalData.time_in_hospital !== undefined && { timeInHospital: patient.originalData.time_in_hospital }),
          ...(patient.originalData.num_medications !== undefined && { medications: patient.originalData.num_medications }),
          ...(patient.originalData.num_lab_procedures !== undefined && { labProcedures: patient.originalData.num_lab_procedures }),
          ...(patient.originalData.medical_specialty !== undefined && { specialty: patient.originalData.medical_specialty })
        } : null;

        const highRiskPatient: Omit<HighRiskPatient, 'id'> = {
          patientId: patient.id,
          name: patient.name,
          riskLevel: patient.riskLevel as 'High' | 'Medium',
          readmissionProbability: patient.mlProbability,
          riskFactors: patient.riskFactors,
          confidence: patient.confidence,
          mlPrediction: patient.prediction,
          ...(diagnosisInfo && Object.keys(diagnosisInfo).length > 0 && { diagnosisInfo }),
          ...(medicalInfo && Object.keys(medicalInfo).length > 0 && { medicalInfo }),
          uploadedAt: currentTime,
          uploadedBy,
          lastUpdated: currentTime,
          isActive: true,
          priority: patient.riskLevel === 'High' ? 'Critical' : 'High',
          followUpRequired: true,
          alertStatus: 'New'
        };

        const docRef = await addDoc(collection(db, HIGH_RISK_COLLECTION), highRiskPatient);
        batch.push(docRef.id);
      }
    }

    console.log(`✅ Saved ${batch.length} high-risk patients to database`);
    return batch;
  } catch (error) {
    console.error('❌ Error saving high-risk patients:', error);
    throw new Error(`Failed to save high-risk patients: ${error}`);
  }
}

/**
 * Get all active high-risk patients (for doctors dashboard)
 * Updated to avoid composite index requirements by sorting client-side
 */
export async function getHighRiskPatients(
  filterByRisk?: 'High' | 'Medium',
  orderByPriority = true
): Promise<HighRiskPatient[]> {
  try {
    // Simple query - only filter by isActive to avoid composite index
    let q = query(
      collection(db, HIGH_RISK_COLLECTION),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    let patients: HighRiskPatient[] = [];

    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as HighRiskPatient);
    });

    // Client-side filtering and sorting to avoid composite index
    if (filterByRisk) {
      patients = patients.filter(p => p.riskLevel === filterByRisk);
    }

    // Client-side sorting
    if (orderByPriority) {
      patients.sort((a, b) => b.readmissionProbability - a.readmissionProbability);
    } else {
      patients.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis());
    }

    console.log(`📊 Retrieved ${patients.length} high-risk patients from database`);
    return patients;
  } catch (error) {
    console.error('❌ Error fetching high-risk patients:', error);
    throw new Error(`Failed to fetch high-risk patients: ${error}`);
  }
}

/**
 * Get high-risk patients with real-time updates (for live dashboard)
 * Updated to avoid composite index requirements by sorting client-side
 */
export function subscribeToHighRiskPatients(
  callback: (patients: HighRiskPatient[]) => void,
  filterByRisk?: 'High' | 'Medium'
) {
  // Simple query - only filter by isActive to avoid composite index
  let q = query(
    collection(db, HIGH_RISK_COLLECTION),
    where('isActive', '==', true)
  );

  return onSnapshot(q, (querySnapshot) => {
    let patients: HighRiskPatient[] = [];
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as HighRiskPatient);
    });

    // Client-side filtering and sorting to avoid composite index
    if (filterByRisk) {
      patients = patients.filter(p => p.riskLevel === filterByRisk);
    }

    // Sort by readmission probability (descending) - client side
    patients.sort((a, b) => b.readmissionProbability - a.readmissionProbability);

    callback(patients);
  }, (error) => {
    console.error('Error in high-risk patients subscription:', error);
    callback([]);
  });
}

/**
 * Update patient alert status (when doctor acknowledges)
 */
export async function updatePatientAlertStatus(
  patientId: string,
  status: 'Acknowledged' | 'InProgress' | 'Resolved',
  doctorId?: string,
  notes?: string
): Promise<void> {
  try {
    const updateData: Partial<HighRiskPatient> = {
      alertStatus: status,
      lastUpdated: Timestamp.now()
    };

    if (doctorId) updateData.doctorAssigned = doctorId;
    if (notes) updateData.notes = notes;

    await updateDoc(doc(db, HIGH_RISK_COLLECTION, patientId), updateData);
    console.log(`✅ Updated patient ${patientId} status to ${status}`);
  } catch (error) {
    console.error('❌ Error updating patient status:', error);
    throw new Error(`Failed to update patient status: ${error}`);
  }
}

/**
 * Get statistics for high-risk patients
 */
export async function getHighRiskPatientStats(): Promise<{
  total: number;
  critical: number;
  high: number;
  newAlerts: number;
  acknowledged: number;
  resolved: number;
}> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, HIGH_RISK_COLLECTION), where('isActive', '==', true))
    );

    const stats = {
      total: 0,
      critical: 0,
      high: 0,
      newAlerts: 0,
      acknowledged: 0,
      resolved: 0
    };

    querySnapshot.forEach((doc) => {
      const patient = doc.data() as HighRiskPatient;
      stats.total++;

      if (patient.priority === 'Critical') stats.critical++;
      else if (patient.priority === 'High') stats.high++;

      if (patient.alertStatus === 'New') stats.newAlerts++;
      else if (patient.alertStatus === 'Acknowledged') stats.acknowledged++;
      else if (patient.alertStatus === 'Resolved') stats.resolved++;
    });

    return stats;
  } catch (error) {
    console.error('❌ Error fetching high-risk patient stats:', error);
    throw new Error(`Failed to fetch stats: ${error}`);
  }
}

/**
 * Soft delete (deactivate) a high-risk patient
 */
export async function deactivateHighRiskPatient(patientId: string): Promise<void> {
  try {
    await updateDoc(doc(db, HIGH_RISK_COLLECTION, patientId), {
      isActive: false,
      lastUpdated: Timestamp.now()
    });
    console.log(`✅ Deactivated high-risk patient ${patientId}`);
  } catch (error) {
    console.error('❌ Error deactivating patient:', error);
    throw new Error(`Failed to deactivate patient: ${error}`);
  }
}
