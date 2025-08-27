export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: string[];
  assignedDoctorId: string;
  assignedNurseId?: string;
  vitals: Vitals[];
  medications: Medication[];
  appointments: Appointment[];
  riskLevel?: 'High' | 'Medium' | 'Low';
  riskFactors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vitals {
  id: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenLevel: number;
  respiratoryRate: number;
  recordedBy: string; // nurse ID
  recordedAt: Date;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  prescribedBy: string; // doctor ID
  status: 'active' | 'completed' | 'discontinued';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface Shift {
  id: string;
  nurseId: string;
  date: Date;
  startTime: string;
  endTime: string;
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  assignedPatients: string[]; // patient IDs
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'medication' | 'vitals' | 'appointment' | 'emergency';
  title: string;
  message: string;
  patientId?: string;
  targetRole: UserRole[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: Date;
}

export interface Analytics {
  totalPatients: number;
  highRiskPatients: number;
  mediumRiskPatients: number;
  lowRiskPatients: number;
  appointmentsToday: number;
  emergencyAlerts: number;
  departmentStats: {
    [department: string]: {
      patientCount: number;
      averageRisk: number;
    };
  };
}
