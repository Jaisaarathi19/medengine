import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface PatientPrescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'discontinued';
  createdAt: string;
  notes?: string;
}

export interface PatientLabResult {
  id: string;
  patientId: string;
  test: string;
  results: string;
  status: 'pending' | 'completed';
  orderedBy: string;
  date: string;
  createdAt: string;
}

export const getPatientPrescriptions = async (patientId: string): Promise<PatientPrescription[]> => {
  try {
    // Try both collection names to ensure we get data
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId)
    );
    
    const medicationsQuery = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId)
    );
    
    const [prescriptionsSnapshot, medicationsSnapshot] = await Promise.all([
      getDocs(prescriptionsQuery),
      getDocs(medicationsQuery)
    ]);
    
    // Combine results from both collections
    const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PatientPrescription));
    
    const medicationsData = medicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      patientId: doc.data().patientId,
      medication: doc.data().medication || doc.data().name,
      dosage: doc.data().dosage || doc.data().dose,
      frequency: doc.data().frequency || doc.data().instructions,
      duration: doc.data().duration || '30 days',
      prescribedBy: doc.data().prescribedBy || doc.data().doctor,
      status: doc.data().status || 'active',
      createdAt: doc.data().createdAt,
      notes: doc.data().notes
    } as PatientPrescription));
    
    const allPrescriptions = [...prescriptionsData, ...medicationsData];
    
    // Sort on client side to avoid index requirements
    return allPrescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    return [];
  }
};

export const getPatientLabResults = async (patientId: string): Promise<PatientLabResult[]> => {
  try {
    const labResultsRef = collection(db, 'labResults');
    const q = query(
      labResultsRef,
      where('patientId', '==', patientId)
    );
    
    const snapshot = await getDocs(q);
    const labResults = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PatientLabResult));
    
    // Sort on client side to avoid index requirements
    return labResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching patient lab results:', error);
    return [];
  }
};
