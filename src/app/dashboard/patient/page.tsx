'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  UserGroupIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClockIcon,
  DocumentTextIcon,
  BellIcon,
  PhoneIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Chatbot from '@/components/Chatbot';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatDate, formatTime } from '@/lib/utils';

// Mock patient data
const patientInfo = {
  id: 'P001',
  name: 'Alex Thompson',
  age: 34,
  gender: 'Male',
  bloodType: 'A+',
  allergies: ['Penicillin', 'Shellfish'],
  emergencyContact: {
    name: 'Sarah Thompson',
    relationship: 'Spouse',
    phone: '+1 (555) 123-4567'
  }
};

const mockVitals = [
  { date: '8/23', bloodPressure: 118, heartRate: 68, temperature: 98.4 },
  { date: '8/24', bloodPressure: 122, heartRate: 72, temperature: 98.6 },
  { date: '8/25', bloodPressure: 120, heartRate: 70, temperature: 98.5 },
  { date: '8/26', bloodPressure: 125, heartRate: 74, temperature: 98.8 },
  { date: '8/27', bloodPressure: 119, heartRate: 69, temperature: 98.3 }
];

const mockMedications = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    prescribedBy: 'Dr. Smith',
    status: 'active' as const,
    nextDose: new Date('2025-08-27T20:00:00'),
    notes: 'Take with food'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '90 days',
    prescribedBy: 'Dr. Johnson',
    status: 'active' as const,
    nextDose: new Date('2025-08-27T18:30:00'),
    notes: 'Take with meals'
  }
];

const mockAppointments = [
  {
    id: '1',
    doctor: 'Dr. Emily Smith',
    specialty: 'Cardiology',
    date: new Date('2025-08-30T10:00:00'),
    type: 'Follow-up',
    status: 'scheduled' as const,
    location: 'Building A, Floor 2, Room 205'
  },
  {
    id: '2',
    doctor: 'Dr. Michael Johnson',
    specialty: 'Internal Medicine',
    date: new Date('2025-09-05T14:30:00'),
    type: 'Check-up',
    status: 'scheduled' as const,
    location: 'Building B, Floor 1, Room 110'
  }
];

const mockLabResults = [
  {
    id: '1',
    test: 'Complete Blood Count',
    date: new Date('2025-08-25'),
    status: 'completed' as const,
    results: 'Normal ranges',
    orderedBy: 'Dr. Smith'
  },
  {
    id: '2',
    test: 'Lipid Panel',
    date: new Date('2025-08-20'),
    status: 'completed' as const,
    results: 'Cholesterol slightly elevated',
    orderedBy: 'Dr. Johnson'
  }
];

export default function PatientDashboard() {
  const router = useRouter();

  const handleContactDoctor = (appointment: Record<string, unknown>) => {
    toast(`Contacting ${appointment.doctor as string}...`);
  };

  const handleDownloadReport = (report: Record<string, unknown>) => {
    toast.success(`Downloading ${report.test as string} report...`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: unknown) {
      toast.error('Error logging out');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: mockAppointments.length.toString(),
      change: 'Next: Aug 30',
      icon: CalendarDaysIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Medications',
      value: mockMedications.filter(m => m.status === 'active').length.toString(),
      change: 'All up to date',
      icon: HeartIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Lab Reports',
      value: mockLabResults.length.toString(),
      change: 'Latest: Aug 25',
      icon: DocumentTextIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Health Score',
      value: '8.5/10',
      change: 'Excellent',
      icon: HeartIcon,
      color: 'bg-green-500'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -10, 10, 0],
                  boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)"
                }}
                transition={{ duration: 0.3 }}
              >
                <UserGroupIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Welcome, {patientInfo.name}!
                </motion.h1>
                <motion.p 
                  className="text-gray-600 font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Your Health Dashboard
                </motion.p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                href="/book-appointment"
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Book Appointment
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.5, 
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.p 
                    className="text-sm font-semibold text-gray-600 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                  >
                    {stat.title}
                  </motion.p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1 + 0.8,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {stat.value}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                  >
                    {stat.change}
                  </motion.p>
                </div>
                <motion.div 
                  className={`${stat.color} p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0], 
                    scale: 1.1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Left Column */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Current Medications */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-blue-50/50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Current Medications</h3>
                    <p className="text-gray-600 mt-1 font-medium">Your active prescriptions and reminders</p>
                  </div>
                </div>
              </motion.div>
              <div className="p-6">
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  {mockMedications.map((medication, index) => (
                    <motion.div
                      key={medication.id}
                      className="border border-gray-200/50 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Prescribed by {medication.prescribedBy} • Duration: {medication.duration}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medication.status)}`}>
                          {medication.status}
                        </span>
                      </div>
                      
                      {medication.nextDose && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center space-x-2">
                            <BellIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-900 font-medium">
                              Next dose: {formatDate(medication.nextDose)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {medication.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Note:</strong> {medication.notes}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Vitals Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Vitals</h3>
                <p className="text-gray-600 mt-1">Your health metrics over time</p>
              </div>
              <div className="p-6">
                {/* Simple Vitals Chart */}
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Heart Rate</span>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg">
                    {mockVitals.map((vital, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500 mb-2">{vital.date}</div>
                        <div className="space-y-2 flex flex-col items-center">
                          {/* Blood Pressure Bar */}
                          <div className="w-6 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-purple-500 rounded-full"
                              initial={{ height: 0 }}
                              animate={{ height: `${(vital.bloodPressure / 140) * 80}px` }}
                              transition={{ delay: index * 0.1, duration: 0.6 }}
                              title={`BP: ${vital.bloodPressure}`}
                            />
                          </div>
                          
                          {/* Heart Rate Bar */}
                          <div className="w-6 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-red-500 rounded-full"
                              initial={{ height: 0 }}
                              animate={{ height: `${(vital.heartRate / 100) * 60}px` }}
                              transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                              title={`HR: ${vital.heartRate}`}
                            />
                          </div>
                          
                          {/* Values */}
                          <div className="text-xs space-y-1">
                            <div className="text-purple-600 font-semibold">{vital.bloodPressure}</div>
                            <div className="text-red-600 font-semibold">{vital.heartRate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Latest Values */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500">Latest BP</div>
                      <div className="text-lg font-bold text-purple-600">
                        {mockVitals[mockVitals.length - 1].bloodPressure} mmHg
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500">Latest HR</div>
                      <div className="text-lg font-bold text-red-600">
                        {mockVitals[mockVitals.length - 1].heartRate} BPM
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500">Temperature</div>
                      <div className="text-lg font-bold text-blue-600">
                        {mockVitals[mockVitals.length - 1].temperature}°F
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900">{appointment.doctor}</h4>
                        <p className="text-sm text-gray-600">{appointment.specialty} • {appointment.type}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatTime(appointment.date)}</span>
                        </div>
                        <p className="text-xs">{appointment.location}</p>
                      </div>

                      <button
                        onClick={() => handleContactDoctor(appointment)}
                        className="w-full px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        <span>Contact Doctor</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lab Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Lab Reports</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {mockLabResults.map((report) => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{report.test}</p>
                        <p className="text-sm text-gray-600">{formatDate(report.date)}</p>
                        <p className="text-xs text-gray-500">{report.results}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-900">{patientInfo.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="font-medium text-gray-900">{patientInfo.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="font-medium text-gray-900">{patientInfo.allergies.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="font-medium text-gray-900">{patientInfo.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{patientInfo.emergencyContact.relationship}</p>
                    <p className="text-sm text-gray-600">{patientInfo.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Chatbot */}
        <Chatbot />
      </motion.main>
    </div>
    </ProtectedRoute>
  );
}
