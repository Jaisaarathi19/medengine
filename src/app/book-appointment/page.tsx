'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { CalendarIcon, ArrowLeftIcon, UserIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientResults, setPatientResults] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    doctorId: user?.uid || '',
    doctorName: user?.displayName || 'Dr. Current User',
    appointmentDate: '',
    appointmentTime: '',
    duration: '30', // minutes
    type: 'consultation',
    department: 'general',
    reason: '',
    notes: '',
    status: 'scheduled',
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
      // Search in patients collection
      const patientsRef = collection(db, 'patients');
      const snapshot = await getDocs(patientsRef);
      
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((patient: any) => 
          patient.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 results

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

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    if (!formData.appointmentDate) {
      toast.error('Please select appointment date');
      return false;
    }
    if (!formData.appointmentTime) {
      toast.error('Please select appointment time');
      return false;
    }
    if (!formData.reason) {
      toast.error('Please provide reason for appointment');
      return false;
    }
    return true;
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
      // Create appointment ID
      const appointmentId = `APT-${Date.now()}`;
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      // Appointment data structure
      const appointmentData = {
        appointmentId,
        patient: {
          id: formData.patientId,
          name: formData.patientName,
          email: formData.patientEmail
        },
        doctor: {
          id: formData.doctorId,
          name: formData.doctorName
        },
        schedule: {
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          dateTime: appointmentDateTime,
          duration: parseInt(formData.duration),
          endTime: new Date(appointmentDateTime.getTime() + parseInt(formData.duration) * 60000)
        },
        details: {
          type: formData.type,
          department: formData.department,
          reason: formData.reason,
          notes: formData.notes,
          priority: formData.priority
        },
        status: formData.status,
        createdAt: new Date(),
        createdBy: user?.uid,
        updatedAt: new Date()
      };

      // Save to appointments collection
      await addDoc(collection(db, 'appointments'), appointmentData);

      // Also create a notification for the patient
      await addDoc(collection(db, 'notifications'), {
        userId: formData.patientId,
        type: 'appointment_scheduled',
        title: 'New Appointment Scheduled',
        message: `Your appointment with ${formData.doctorName} is scheduled for ${formData.appointmentDate} at ${formData.appointmentTime}`,
        appointmentId,
        read: false,
        createdAt: new Date()
      });

      toast.success(`Appointment scheduled successfully for ${formData.patientName}`);
      
      // Reset form
      setFormData({
        patientId: '', patientName: '', patientEmail: '', 
        doctorId: user?.uid || '', doctorName: user?.displayName || 'Dr. Current User',
        appointmentDate: '', appointmentTime: '', duration: '30', type: 'consultation',
        department: 'general', reason: '', notes: '', status: 'scheduled', priority: 'normal'
      });

    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-conic from-blue-200 via-purple-200 to-pink-200 rounded-full opacity-10 animate-spin-slow"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="floating-element absolute top-60 right-1/3 w-1 h-1 bg-indigo-400 rounded-full opacity-70" style={{animationDelay: '0.5s'}}></div>
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
              className="flex items-center text-gray-700 hover:text-blue-600 mb-6 group transition-all duration-300"
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
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <CalendarIcon className="h-8 w-8 text-white" />
                  <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Book Appointment
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Schedule a new patient appointment with advanced booking system
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
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl mr-4">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
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
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                      {searchingPatients && (
                        <motion.div 
                          className="absolute right-4 top-4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
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
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              transition: { duration: 0.2 }
                            }}
                            className="w-full text-left px-6 py-4 border-b border-gray-100/50 last:border-b-0 flex items-center transition-all duration-300 rounded-2xl"
                          >
                            <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-2 rounded-full mr-4">
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
                      className="bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm p-6 rounded-2xl border border-green-200/50 shadow-lg"
                    >
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full mr-4"
                        >
                          <UserIcon className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                          <div className="font-bold text-green-900 text-lg">Selected: {formData.patientName}</div>
                          <div className="text-green-700 font-medium">{formData.patientEmail}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

            {/* Appointment Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl mr-4">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                  Appointment Details
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    required
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    required
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Appointment Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="checkup">Regular Checkup</option>
                    <option value="emergency">Emergency</option>
                    <option value="procedure">Procedure</option>
                    <option value="surgery">Surgery</option>
                  </select>
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  >
                    <option value="general">General Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="emergency">Emergency</option>
                    <option value="surgery">Surgery</option>
                  </select>
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
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </motion.div>
              </div>
            </motion.div>

            {/* Additional Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-2 rounded-xl mr-4">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Additional Information
                </h2>
              </div>
              
              <div className="space-y-8">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Reason for Appointment *
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Brief description of the appointment purpose"
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    required
                  />
                </motion.div>
                
                <motion.div
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
                    rows={5}
                    placeholder="Any additional information or special instructions..."
                    className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Animated Submit Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
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
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-2xl backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-6 w-6 mr-3" />
                    Book Appointment
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
