'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { UserPlusIcon, ArrowLeftIcon, SparklesIcon, HeartIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CreatePatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    phone: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Medical Info
    bloodType: '',
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    insuranceProvider: '',
    insuranceNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('First and last name are required');
      return false;
    }
    
    if (!formData.email) {
      toast.error('Email is required');
      return false;
    }
    
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required');
      return false;
    }
    
    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;

      // Create patient document in Firestore
      const patientData = {
        // User Info
        email: formData.email,
        role: 'patient',
        profile: {
          name: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          
          // Address
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          
          // Emergency Contact
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relation: formData.emergencyContactRelation
          },
          
          // Medical Information
          medical: {
            bloodType: formData.bloodType,
            allergies: formData.allergies,
            currentMedications: formData.currentMedications,
            medicalHistory: formData.medicalHistory,
            insuranceProvider: formData.insuranceProvider,
            insuranceNumber: formData.insuranceNumber
          }
        },
        createdAt: new Date(),
        lastLogin: null,
        isActive: true,
        patientId: `PAT-${Date.now()}` // Generate unique patient ID
      };

      // Save to users collection
      await setDoc(doc(db, 'users', user.uid), patientData);
      
      // Also save to patients collection for easy querying
      await setDoc(doc(db, 'patients', user.uid), {
        ...patientData,
        uid: user.uid
      });

      toast.success(`Patient ${formData.firstName} ${formData.lastName} created successfully!`);
      
      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        dateOfBirth: '', gender: '', phone: '', street: '', city: '', state: '', zipCode: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
        bloodType: '', allergies: '', currentMedications: '', medicalHistory: '',
        insuranceProvider: '', insuranceNumber: ''
      });

    } catch (error: any) {
      console.error('Error creating patient:', error);
      let errorMessage = 'Failed to create patient';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/30 to-cyan-100/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-conic from-indigo-200 via-cyan-200 to-blue-200 rounded-full opacity-10 animate-spin-slow"></div>
        </div>
        
        {/* Floating Medical Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-3 h-3 bg-cyan-400 rounded-full opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="floating-element absolute top-60 right-1/3 w-1 h-1 bg-teal-400 rounded-full opacity-70" style={{animationDelay: '0.5s'}}></div>
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
              className="flex items-center text-gray-700 hover:text-indigo-600 mb-6 group transition-all duration-300"
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
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                  <UserPlusIcon className="h-8 w-8 text-white" />
                  <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Create New Patient
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Add a new patient to the advanced medical system
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
              
              {/* Basic Information Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-2 rounded-xl mr-4">
                    <UserPlusIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                    Basic Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Account Information Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl mr-4">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-cyan-600 bg-clip-text text-transparent">
                    Account Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1-555-0123"
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      minLength={6}
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Personal Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl mr-4">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    Personal Details
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Blood Type
                    </label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </motion.div>
                </div>
              </motion.div>

              {/* Address Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl mr-4">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
                    Address Information
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                    </motion.div>
                    
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                    </motion.div>
                    
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Emergency Contact Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-xl mr-4">
                    <PhoneIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
                    Emergency Contact
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Relationship
                    </label>
                    <select
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </motion.div>
                </div>
              </motion.div>

              {/* Medical Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-xl mr-4">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-amber-600 bg-clip-text text-transparent">
                    Medical Information
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                    </motion.div>
                    
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Insurance Number
                      </label>
                      <input
                        type="text"
                        name="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Known Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="List any known allergies..."
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Current Medications
                    </label>
                    <textarea
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="List current medications..."
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Medical History
                    </label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Previous surgeries, chronic conditions, family history..."
                      className="w-full px-4 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg resize-none"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Submit Buttons Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex justify-end space-x-6 pt-8 border-t border-white/30"
              >
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/70 border-2 border-gray-300/50 rounded-2xl text-gray-700 font-semibold hover:bg-white/90 hover:border-gray-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.05, y: loading ? 0 : -2 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                      />
                      Creating Patient...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Create Patient
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
