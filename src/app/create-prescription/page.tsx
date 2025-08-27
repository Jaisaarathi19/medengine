'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
    if (!searchTerm.trim()) {
      setPatientResults([]);
      return;
    }

    setSearchingPatients(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'patient')
      );

      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fullName = `${data.profile?.firstName} ${data.profile?.lastName}`.toLowerCase();
        const email = data.email?.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        if (fullName.includes(search) || email?.includes(search)) {
          results.push({
            id: doc.id,
            ...data,
            profile: {
              ...data.profile,
              name: `${data.profile?.firstName} ${data.profile?.lastName}`
            }
          });
        }
      });

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
      patientName: patient.profile?.name || `${patient.profile?.firstName} ${patient.profile?.lastName}`,
      patientEmail: patient.email
    }));
    setPatientResults([]);
  };

  const addMedication = () => {
    setMedications(prev => [...prev, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      refills: 0
    }]);
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string | number) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    
    if (!formData.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return false;
    }
    
    const validMedications = medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );
    
    if (validMedications.length === 0) {
      toast.error('At least one medication with name, dosage, and frequency is required');
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

      toast.success('Prescription created successfully!');
      router.back();

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
                  </div>

                  {/* Patient Search Results */}
                  {patientResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl max-h-60 overflow-y-auto"
                    >
                      {patientResults.map((patient, index) => (
                        <motion.button
                          key={patient.id || index}
                          type="button"
                          onClick={() => selectPatient(patient)}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                          className="w-full text-left p-4 hover:bg-purple-50 transition-all duration-200 border-b border-purple-100/50 last:border-b-0 rounded-2xl"
                        >
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-purple-500 mr-3" />
                            <div>
                              <div className="font-semibold text-gray-900">{patient.profile?.name}</div>
                              <div className="text-sm text-gray-600">{patient.email}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Selected Patient Display */}
                  {formData.patientId && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 shadow-lg"
                    >
                      <div className="flex items-center">
                        <UserIcon className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                          <div className="font-semibold text-purple-900 text-lg">Selected Patient: {formData.patientName}</div>
                          <div className="text-purple-700">{formData.patientEmail}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Medical Details Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl mr-4">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    Medical Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    className="md:col-span-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Diagnosis *
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      placeholder="Primary diagnosis or condition"
                      className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Follow-up Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg pl-12"
                      />
                      <CalendarIcon className="absolute left-4 top-4 h-6 w-6 text-purple-400" />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT (Immediate)</option>
                    </select>
                  </motion.div>
                  
                  <motion.div 
                    className="md:col-span-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Additional instructions or notes..."
                      className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Medications Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl mr-4">
                      <BeakerIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                      Medications
                    </h2>
                  </div>
                  <motion.button
                    type="button"
                    onClick={addMedication}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Medication
                  </motion.button>
                </div>

                <div className="space-y-8">
                  {medications.map((medication, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <BeakerIcon className="h-6 w-6 text-purple-500 mr-2" />
                          Medication {index + 1}
                        </h3>
                        {medications.length > 1 && (
                          <motion.button
                            type="button"
                            onClick={() => removeMedication(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-300"
                          >
                            Remove
                          </motion.button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div 
                          className="lg:col-span-2"
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Medication Name *
                          </label>
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="Enter medication name"
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                            required
                          />
                        </motion.div>
                        
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Dosage *
                          </label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                            required
                          />
                        </motion.div>
                        
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Frequency *
                          </label>
                          <select
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                            required
                          >
                            <option value="">Select frequency</option>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="Four times daily">Four times daily</option>
                            <option value="Every 4 hours">Every 4 hours</option>
                            <option value="Every 6 hours">Every 6 hours</option>
                            <option value="Every 8 hours">Every 8 hours</option>
                            <option value="As needed">As needed</option>
                          </select>
                        </motion.div>
                        
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                          />
                        </motion.div>
                        
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Refills
                          </label>
                          <input
                            type="number"
                            value={medication.refills}
                            onChange={(e) => updateMedication(index, 'refills', parseInt(e.target.value) || 0)}
                            min="0"
                            max="5"
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="lg:col-span-3"
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Special Instructions
                          </label>
                          <textarea
                            value={medication.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            rows={2}
                            placeholder="e.g., Take with food, avoid alcohol"
                            className="w-full px-4 py-4 bg-white/60 border border-purple-200/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button Section */}
              <motion.div 
                className="flex justify-end space-x-4 pt-8 border-t border-purple-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-2xl text-gray-700 hover:bg-gray-50/80 transition-all duration-300 font-semibold shadow-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || !formData.patientId}
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      ></motion.div>
                      Creating Prescription...
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                      Create Prescription
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
