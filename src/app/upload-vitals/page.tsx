'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  HeartIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import EnhancedVitalsUpload from '@/components/EnhancedVitalsUpload';

interface PatientResult {
  id: string;
  email: string;
  profile?: {
    name: string;
  };
}

export default function UploadVitalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    recordedBy: user?.uid || '',
    recordedByName: user?.displayName || 'Current User',
    
    // Vital Signs
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bmi: '',
    
    // Additional Measurements
    bloodGlucose: '',
    cholesterol: '',
    
    // Symptoms & Notes
    symptoms: '',
    painScale: '',
    notes: '',
    
    // Context
    measurementTime: new Date().toISOString().slice(0, 16), // Current datetime-local format
    location: 'clinic',
    conditions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate BMI when weight and height are provided
    if (name === 'weight' || name === 'height') {
      const weight = name === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      const height = name === 'height' ? parseFloat(value) : parseFloat(formData.height);
      
      if (weight && height) {
        const heightInMeters = height * 0.0254; // Convert inches to meters
        const bmi = (weight * 0.453592) / (heightInMeters * heightInMeters); // Convert lbs to kg and calculate BMI
        setFormData(prev => ({
          ...prev,
          [name]: value,
          bmi: bmi.toFixed(1)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const searchPatients = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPatientResults([]);
      return;
    }

    if (!db) {
      toast.error('Database connection not available');
      return;
    }

    setSearchingPatients(true);
    try {
      const patientsRef = collection(db, 'patients');
      const snapshot = await getDocs(patientsRef);
      
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PatientResult))
        .filter((patient: PatientResult) => 
          patient.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      setPatientResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Error searching patients');
    } finally {
      setSearchingPatients(false);
    }
  };

  const selectPatient = (patient: PatientResult) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.profile?.name || 'Unknown Patient',
      patientEmail: patient.email
    }));
    setPatientResults([]);
  };

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    if (!formData.systolic && !formData.heartRate && !formData.temperature && !formData.weight) {
      toast.error('Please enter at least one vital sign measurement');
      return false;
    }
    return true;
  };

  const getVitalStatus = (vital: string, value: string) => {
    const num = parseFloat(value);
    if (!num) return 'normal';

    switch (vital) {
      case 'systolic':
        if (num < 90) return 'low';
        if (num > 140) return 'high';
        return 'normal';
      case 'diastolic':
        if (num < 60) return 'low';
        if (num > 90) return 'high';
        return 'normal';
      case 'heartRate':
        if (num < 60) return 'low';
        if (num > 100) return 'high';
        return 'normal';
      case 'temperature':
        if (num < 97.0) return 'low';
        if (num > 99.5) return 'high';
        return 'normal';
      case 'oxygenSaturation':
        if (num < 95) return 'low';
        return 'normal';
      case 'bmi':
        if (num < 18.5) return 'low';
        if (num > 30) return 'high';
        if (num > 25) return 'elevated';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!db) {
      toast.error('Database connection not available');
      return;
    }
    
    setLoading(true);

    try {
      const vitalRecordId = `VIT-${Date.now()}`;
      
      // Prepare vital signs data with status indicators
      const vitals = {
        bloodPressure: {
          systolic: formData.systolic ? parseFloat(formData.systolic) : null,
          diastolic: formData.diastolic ? parseFloat(formData.diastolic) : null,
          status: formData.systolic ? getVitalStatus('systolic', formData.systolic) : null,
          combined: formData.systolic && formData.diastolic ? `${formData.systolic}/${formData.diastolic}` : null
        },
        heartRate: {
          value: formData.heartRate ? parseFloat(formData.heartRate) : null,
          status: formData.heartRate ? getVitalStatus('heartRate', formData.heartRate) : null,
          unit: 'bpm'
        },
        temperature: {
          value: formData.temperature ? parseFloat(formData.temperature) : null,
          status: formData.temperature ? getVitalStatus('temperature', formData.temperature) : null,
          unit: '°F'
        },
        respiratoryRate: {
          value: formData.respiratoryRate ? parseFloat(formData.respiratoryRate) : null,
          unit: 'breaths/min'
        },
        oxygenSaturation: {
          value: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
          status: formData.oxygenSaturation ? getVitalStatus('oxygenSaturation', formData.oxygenSaturation) : null,
          unit: '%'
        },
        weight: {
          value: formData.weight ? parseFloat(formData.weight) : null,
          unit: 'lbs'
        },
        height: {
          value: formData.height ? parseFloat(formData.height) : null,
          unit: 'inches'
        },
        bmi: {
          value: formData.bmi ? parseFloat(formData.bmi) : null,
          status: formData.bmi ? getVitalStatus('bmi', formData.bmi) : null
        },
        bloodGlucose: {
          value: formData.bloodGlucose ? parseFloat(formData.bloodGlucose) : null,
          unit: 'mg/dL'
        },
        cholesterol: {
          value: formData.cholesterol ? parseFloat(formData.cholesterol) : null,
          unit: 'mg/dL'
        }
      };

      // Create vital signs record
      const vitalRecord = {
        vitalRecordId,
        patient: {
          id: formData.patientId,
          name: formData.patientName,
          email: formData.patientEmail
        },
        recordedBy: {
          id: formData.recordedBy,
          name: formData.recordedByName
        },
        vitals,
        assessment: {
          symptoms: formData.symptoms,
          painScale: formData.painScale ? parseInt(formData.painScale) : null,
          conditions: formData.conditions,
          notes: formData.notes
        },
        metadata: {
          measurementTime: new Date(formData.measurementTime),
          location: formData.location,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Calculate overall status
        overallStatus: calculateOverallStatus(vitals),
        // Create alerts for abnormal values
        alerts: generateVitalAlerts(vitals, formData.patientName)
      };

      // Save to vital_signs collection
      await addDoc(collection(db, 'vital_signs'), vitalRecord);

      // Update patient's latest vitals in patients collection
      if (formData.patientId) {
        const patientRef = doc(db, 'patients', formData.patientId);
        await updateDoc(patientRef, {
          latestVitals: vitals,
          lastVitalCheck: new Date(),
          updatedAt: new Date()
        });
      }

      // Create notifications for abnormal vitals
      const alerts = generateVitalAlerts(vitals, formData.patientName);
      for (const alert of alerts) {
        await addDoc(collection(db, 'notifications'), {
          userId: formData.patientId,
          type: 'vital_alert',
          priority: alert.priority,
          title: alert.title,
          message: alert.message,
          vitalRecordId,
          read: false,
          createdAt: new Date()
        });

        // Also notify assigned doctor if high priority
        if (alert.priority === 'high') {
          await addDoc(collection(db, 'notifications'), {
            userId: 'doctors', // Can be refined to specific doctor
            type: 'patient_vital_alert',
            priority: 'high',
            title: `Critical Vitals: ${formData.patientName}`,
            message: alert.message,
            patientId: formData.patientId,
            vitalRecordId,
            read: false,
            createdAt: new Date()
          });
        }
      }

      toast.success(`Vital signs recorded successfully for ${formData.patientName}`);
      
      // Reset form
      setFormData({
        patientId: '', patientName: '', patientEmail: '',
        recordedBy: user?.uid || '', recordedByName: user?.displayName || 'Current User',
        systolic: '', diastolic: '', heartRate: '', temperature: '', respiratoryRate: '',
        oxygenSaturation: '', weight: '', height: '', bmi: '', bloodGlucose: '', cholesterol: '',
        symptoms: '', painScale: '', notes: '', conditions: '',
        measurementTime: new Date().toISOString().slice(0, 16), location: 'clinic'
      });

    } catch (error: unknown) {
      console.error('Error recording vital signs:', error);
      toast.error('Failed to record vital signs');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStatus = (vitals: Record<string, unknown>) => {
    const statuses = Object.values(vitals)
      .filter((vital: unknown) => vital && typeof vital === 'object' && vital !== null && 'status' in vital)
      .map((vital: unknown) => (vital as { status: string }).status);
    
    if (statuses.includes('high') || statuses.includes('low')) return 'abnormal';
    if (statuses.includes('elevated')) return 'elevated';
    return 'normal';
  };

  const generateVitalAlerts = (vitals: Record<string, unknown>, patientName: string) => {
    const alerts: Array<{ priority: string; title: string; message: string }> = [];
    
    // Type guards for vital values
    const getBPValues = (bp: unknown) => {
      if (bp && typeof bp === 'object' && bp !== null) {
        const bpObj = bp as { systolic?: number; diastolic?: number; combined?: string; status?: string };
        return bpObj;
      }
      return null;
    };

    const getVitalValue = (vital: unknown) => {
      if (vital && typeof vital === 'object' && vital !== null) {
        const vitalObj = vital as { value?: number };
        return vitalObj.value;
      }
      return null;
    };

    const bp = getBPValues((vitals as { bloodPressure?: unknown }).bloodPressure);
    const hr = getVitalValue((vitals as { heartRate?: unknown }).heartRate);
    const oxygenSat = getVitalValue((vitals as { oxygenSaturation?: unknown }).oxygenSaturation);
    const temp = getVitalValue((vitals as { temperature?: unknown }).temperature);
    
    // Blood pressure alerts
    if (bp && bp.systolic && bp.diastolic && (bp.systolic > 180 || bp.diastolic > 120)) {
      alerts.push({
        priority: 'high',
        title: 'Hypertensive Crisis',
        message: `${patientName} has critically high blood pressure: ${bp.combined || `${bp.systolic}/${bp.diastolic}`}`
      });
    } else if (bp && bp.status === 'high') {
      alerts.push({
        priority: 'medium',
        title: 'High Blood Pressure',
        message: `${patientName} has elevated blood pressure: ${bp.combined || `${bp.systolic}/${bp.diastolic}`}`
      });
    }
    
    // Heart rate alerts
    if (hr && (hr > 120 || hr < 50)) {
      alerts.push({
        priority: 'high',
        title: 'Abnormal Heart Rate',
        message: `${patientName} has ${hr < 50 ? 'bradycardia' : 'tachycardia'}: ${hr} bpm`
      });
    }
    
    // Oxygen saturation alerts
    if (oxygenSat && oxygenSat < 90) {
      alerts.push({
        priority: 'high',
        title: 'Low Oxygen Saturation',
        message: `${patientName} has critically low oxygen saturation: ${oxygenSat}%`
      });
    }
    
    // Temperature alerts
    if (temp && temp > 103) {
      alerts.push({
        priority: 'high',
        title: 'High Fever',
        message: `${patientName} has high fever: ${temp}°F`
      });
    }
    
    return alerts;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/30 to-pink-100/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-conic from-red-200 via-pink-200 to-rose-200 rounded-full opacity-10 animate-spin-slow"></div>
        </div>
        
        {/* Floating Medical Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-2 h-2 bg-red-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-rose-400 rounded-full opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="floating-element absolute top-60 right-1/3 w-1 h-1 bg-crimson-400 rounded-full opacity-70" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Animated Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-700 hover:text-red-600 mb-6 group transition-all duration-300"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </motion.button>
            
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="relative mr-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <HeartIcon className="h-8 w-8 text-white" />
                  <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Upload Vital Signs
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Record patient vital signs with advanced monitoring system
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Glassmorphism Form Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-10">
              
              {/* Patient Selection Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-xl mr-4">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
                    Patient Information
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Search Patient *
                    </label>
                    <motion.div 
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <input
                        type="text"
                        placeholder="Type patient name or email to search..."
                        onChange={(e) => searchPatients(e.target.value)}
                        className="w-full px-4 py-4 bg-white/60 border border-red-200/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg pl-12"
                      />
                      <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-red-400" />
                      {searchingPatients && (
                        <motion.div 
                          className="absolute right-4 top-4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="h-6 w-6 border-3 border-red-500 border-t-transparent rounded-full"></div>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    {/* Animated Search Results */}
                    {patientResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-3 backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                      >
                        {patientResults.map((patient, index) => (
                          <motion.button
                            key={patient.id}
                            type="button"
                            onClick={() => selectPatient(patient)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              transition: { duration: 0.2 }
                            }}
                            className="w-full text-left px-6 py-4 border-b border-gray-100/50 last:border-b-0 flex items-center transition-all duration-300 rounded-2xl"
                          >
                            <div className="bg-gradient-to-r from-red-400 to-pink-500 p-2 rounded-full mr-4">
                              <UserIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{patient.profile?.name}</div>
                              <div className="text-sm text-gray-600">{patient.email}</div>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Selected Patient Display */}
                  {formData.patientId && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm p-6 rounded-2xl border border-red-200/50 shadow-lg"
                    >
                      <div className="flex items-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-full mr-4"
                        >
                          <UserIcon className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                          <div className="font-bold text-red-900 text-lg">Selected: {formData.patientName}</div>
                          <div className="text-red-700 font-medium">{formData.patientEmail}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Measurement Details Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl mr-4">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                    Measurement Context
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Measurement Time
                    </label>
                    <input
                      type="datetime-local"
                      name="measurementTime"
                      value={formData.measurementTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-red-200/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-red-200/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    >
                      <option value="clinic">🏥 Clinic</option>
                      <option value="hospital">🏥 Hospital</option>
                      <option value="emergency">🚨 Emergency Room</option>
                      <option value="home">🏠 Home Visit</option>
                      <option value="lab">🔬 Laboratory</option>
                    </select>
                  </motion.div>
                </div>
              </motion.div>

              {/* Vital Signs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-xl mr-4">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
                    Vital Signs
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Blood Pressure */}
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center">
                      🩸 Blood Pressure
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Systolic (mmHg)</label>
                        <input
                          type="number"
                          name="systolic"
                          value={formData.systolic}
                          onChange={handleInputChange}
                          placeholder="120"
                          min="60"
                          max="250"
                          className="w-full px-4 py-3 bg-white/70 border border-blue-200/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Diastolic (mmHg)</label>
                        <input
                          type="number"
                          name="diastolic"
                          value={formData.diastolic}
                          onChange={handleInputChange}
                          placeholder="80"
                          min="40"
                          max="150"
                          className="w-full px-4 py-3 bg-white/70 border border-blue-200/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Heart Rate */}
                  <motion.div 
                    className="bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-sm p-6 rounded-2xl border border-red-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-red-900 mb-4 text-lg flex items-center">
                      💓 Heart Rate
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-red-800 mb-2">BPM</label>
                      <input
                        type="number"
                        name="heartRate"
                        value={formData.heartRate}
                        onChange={handleInputChange}
                        placeholder="72"
                        min="30"
                        max="200"
                        className="w-full px-4 py-3 bg-white/70 border border-red-200/50 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                      />
                    </div>
                  </motion.div>

                  {/* Temperature */}
                  <motion.div 
                    className="bg-gradient-to-br from-yellow-50 to-orange-100/50 backdrop-blur-sm p-6 rounded-2xl border border-yellow-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-yellow-900 mb-4 text-lg flex items-center">
                      🌡️ Temperature
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-yellow-800 mb-2">°F</label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        placeholder="98.6"
                        min="90"
                        max="110"
                        className="w-full px-4 py-3 bg-white/70 border border-yellow-200/50 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                      />
                    </div>
                  </motion.div>

                  {/* Respiratory Rate */}
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-100/50 backdrop-blur-sm p-6 rounded-2xl border border-green-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-green-900 mb-4 text-lg flex items-center">
                      🫁 Respiratory Rate
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-green-800 mb-2">Breaths/min</label>
                      <input
                        type="number"
                        name="respiratoryRate"
                        value={formData.respiratoryRate}
                        onChange={handleInputChange}
                        placeholder="16"
                        min="8"
                        max="50"
                        className="w-full px-4 py-3 bg-white/70 border border-green-200/50 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                      />
                    </div>
                  </motion.div>

                  {/* Oxygen Saturation */}
                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-violet-100/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-purple-900 mb-4 text-lg flex items-center">
                      🩺 Oxygen Saturation
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-purple-800 mb-2">SpO2 (%)</label>
                      <input
                        type="number"
                        name="oxygenSaturation"
                        value={formData.oxygenSaturation}
                        onChange={handleInputChange}
                        placeholder="98"
                        min="70"
                        max="100"
                        className="w-full px-4 py-3 bg-white/70 border border-purple-200/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                      />
                    </div>
                  </motion.div>

                  {/* Pain Scale */}
                  <motion.div 
                    className="bg-gradient-to-br from-orange-50 to-red-100/50 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-orange-900 mb-4 text-lg flex items-center">
                      😣 Pain Scale
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-orange-800 mb-2">0-10 Scale</label>
                      <select
                        name="painScale"
                        value={formData.painScale}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/70 border border-orange-200/50 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium"
                      >
                        <option value="">Select pain level</option>
                        {[...Array(11)].map((_, i) => (
                          <option key={i} value={i}>
                            {i} - {i === 0 ? 'No pain' : i <= 3 ? 'Mild' : i <= 6 ? 'Moderate' : 'Severe'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Physical Measurements Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl mr-4">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-cyan-600 bg-clip-text text-transparent">
                    Physical Measurements
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      ⚖️ Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="150"
                      className="w-full px-4 py-4 bg-white/60 border border-cyan-200/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📏 Height (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="68"
                      className="w-full px-4 py-4 bg-white/60 border border-cyan-200/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📊 BMI (calculated)
                    </label>
                    <input
                      type="text"
                      name="bmi"
                      value={formData.bmi}
                      readOnly
                      placeholder="Auto-calculated"
                      className="w-full px-4 py-4 bg-gradient-to-r from-gray-100 to-gray-200/50 border border-gray-300/50 rounded-2xl text-gray-700 font-medium shadow-lg cursor-not-allowed"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Lab Values Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl mr-4">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
                    Lab Values (Optional)
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🩸 Blood Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      name="bloodGlucose"
                      value={formData.bloodGlucose}
                      onChange={handleInputChange}
                      placeholder="90"
                      className="w-full px-4 py-4 bg-white/60 border border-emerald-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🫀 Total Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      name="cholesterol"
                      value={formData.cholesterol}
                      onChange={handleInputChange}
                      placeholder="180"
                      className="w-full px-4 py-4 bg-white/60 border border-emerald-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Assessment & Notes Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-2 rounded-xl mr-4">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-violet-600 bg-clip-text text-transparent">
                    Assessment & Notes
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🩺 Current Symptoms
                    </label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe any symptoms the patient is experiencing..."
                      className="w-full px-4 py-4 bg-white/60 border border-violet-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🔍 Conditions/Circumstances
                    </label>
                    <input
                      type="text"
                      name="conditions"
                      value={formData.conditions}
                      onChange={handleInputChange}
                      placeholder="e.g., After exercise, fasting, post-medication"
                      className="w-full px-4 py-4 bg-white/60 border border-violet-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📝 Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Any additional observations or notes..."
                      className="w-full px-4 py-4 bg-white/60 border border-violet-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Animated Submit Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="flex justify-end space-x-6 pt-6"
              >
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/70 border border-gray-300/50 rounded-2xl text-gray-700 font-semibold hover:bg-white/90 transition-all duration-300 backdrop-blur-sm shadow-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || !formData.patientId}
                  whileHover={{ scale: loading ? 1 : 1.05, y: loading ? 0 : -2 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-2xl backdrop-blur-sm"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Recording Vitals...
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-6 w-6 mr-3" />
                      Record Vital Signs
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
