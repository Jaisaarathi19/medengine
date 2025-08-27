'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  UserIcon, 
  ClipboardDocumentListIcon,
  CalendarIcon,
  SparklesIcon,
  BeakerIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [medications, setMedications] = useState([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      refills: 0
    }
  ]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    doctorId: user?.uid || '',
    doctorName: user?.displayName || 'Current Doctor',
    diagnosis: '',
    notes: '',
    followUpDate: '',
    status: 'active',
    priority: 'normal'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((patient: any) => 
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

  const selectPatient = (patient: any) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.profile?.name || 'Unknown Patient',
      patientEmail: patient.email
    }));
    setPatientResults([]);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        refills: 0
      }
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string | number) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    if (!formData.diagnosis) {
      toast.error('Please enter diagnosis');
      return false;
    }
    if (medications.some(med => !med.name || !med.dosage || !med.frequency)) {
      toast.error('Please fill all medication details');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const prescriptionId = `RX-${Date.now()}`;
      
      // Create prescription document
      const prescriptionData = {
        prescriptionId,
        patient: {
          id: formData.patientId,
          name: formData.patientName,
          email: formData.patientEmail
        },
        doctor: {
          id: formData.doctorId,
          name: formData.doctorName
        },
        medications: medications.filter(med => med.name), // Only include filled medications
        details: {
          diagnosis: formData.diagnosis,
          notes: formData.notes,
          followUpDate: formData.followUpDate,
          priority: formData.priority
        },
        status: formData.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        refillsRemaining: medications.reduce((total, med) => total + (med.refills || 0), 0)
      };

      // Save to prescriptions collection
      await addDoc(collection(db, 'prescriptions'), prescriptionData);

      // Create notification for patient
      await addDoc(collection(db, 'notifications'), {
        userId: formData.patientId,
        type: 'prescription_created',
        title: 'New Prescription Available',
        message: `Dr. ${formData.doctorName} has prescribed new medication for you`,
        prescriptionId,
        read: false,
        createdAt: new Date()
      });

      // Create notification for pharmacy (if needed)
      await addDoc(collection(db, 'notifications'), {
        userId: 'pharmacy', // Special pharmacy user ID
        type: 'prescription_pending',
        title: 'New Prescription to Fill',
        message: `Prescription ${prescriptionId} for ${formData.patientName} is ready for processing`,
        prescriptionId,
        read: false,
        createdAt: new Date()
      });

      toast.success(`Prescription created successfully for ${formData.patientName}`);
      
      // Reset form
      setFormData({
        patientId: '', patientName: '', patientEmail: '',
        doctorId: user?.uid || '', doctorName: user?.displayName || 'Current Doctor',
        diagnosis: '', notes: '', followUpDate: '', status: 'active', priority: 'normal'
      });
      setMedications([{
        name: '', dosage: '', frequency: '', duration: '', instructions: '', refills: 0
      }]);

    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-100/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-conic from-purple-200 via-pink-200 to-indigo-200 rounded-full opacity-10 animate-spin-slow"></div>
        </div>
        
        {/* Floating Prescription Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="floating-element absolute top-60 right-1/3 w-1 h-1 bg-violet-400 rounded-full opacity-70" style={{animationDelay: '0.5s'}}></div>
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
              className="flex items-center text-gray-700 hover:text-purple-600 mb-6 group transition-all duration-300"
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
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                  <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Create Prescription
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Prescribe medications with advanced medical system
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
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl mr-4">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
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
                        className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg pl-12"
                      />
                      <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-purple-400" />
                      {searchingPatients && (
                        <motion.div 
                          className="absolute right-4 top-4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="h-6 w-6 border-3 border-purple-500 border-t-transparent rounded-full"></div>
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
                              backgroundColor: "rgba(147, 51, 234, 0.1)",
                              transition: { duration: 0.2 }
                            }}
                            className="w-full text-left px-6 py-4 border-b border-gray-100/50 last:border-b-0 flex items-center transition-all duration-300 rounded-2xl"
                          >
                            <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-full mr-4">
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
            </div>
                
                {/* Selected Patient Display */}
                {formData.patientId && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <div className="font-medium text-purple-900">Selected Patient: {formData.patientName}</div>
                        <div className="text-sm text-purple-700">{formData.patientEmail}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </form>

            {/* Diagnosis & Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Primary diagnosis or condition"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT (Immediate)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional instructions or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Medications</h2>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-6">
                {medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Medication {index + 1}</h3>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name *
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          placeholder="e.g., Lisinopril"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Refills
                        </label>
                        <input
                          type="number"
                          value={medication.refills}
                          onChange={(e) => updateMedication(index, 'refills', parseInt(e.target.value) || 0)}
                          min="0"
                          max="12"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 10mg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <input
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          placeholder="e.g., Once daily"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          placeholder="e.g., 30 days"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food, avoid alcohol"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.patientId}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Prescription...
                  </>
                ) : (
                  <>
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Create Prescription
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
