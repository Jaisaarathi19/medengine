'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  BellIcon,
  HeartIcon,
  UserPlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Mock data for nurse dashboard
const mockPatients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    room: '205A',
    condition: 'Post-surgery recovery',
    priority: 'Medium',
    nextMedication: '10:30 AM',
    vitalsStatus: 'stable'
  },
  {
    id: '2',
    name: 'Michael Chen',
    room: '301B',
    condition: 'Diabetes monitoring',
    priority: 'High',
    nextMedication: '11:00 AM',
    vitalsStatus: 'attention'
  },
  {
    id: '3',
    name: 'Emily Davis',
    room: '108C',
    condition: 'Asthma treatment',
    priority: 'Low',
    nextMedication: '2:00 PM',
    vitalsStatus: 'stable'
  }
];

const mockMedications = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    medication: 'Ibuprofen 600mg',
    time: '10:30 AM',
    status: 'pending'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    medication: 'Insulin injection',
    time: '11:00 AM',
    status: 'overdue'
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    medication: 'Albuterol inhaler',
    time: '2:00 PM',
    status: 'scheduled'
  }
];

export default function NurseDashboard() {
  const router = useRouter();
  const [showShiftBooking, setShowShiftBooking] = useState(false);

  const handleMedicationAdministered = (medication: any, patient: any) => {
    toast.success(`${medication.medication} administered to ${patient.name}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: any) {
      toast.error('Error logging out');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalsStatusColor = (status: string) => {
    switch (status) {
      case 'attention': return 'bg-red-100 text-red-800';
      case 'stable': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Assigned Patients',
      value: mockPatients.length.toString(),
      change: 'Current shift',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Medications Due',
      value: '2',
      change: 'Next 2 hours',
      icon: BellIcon,
      color: 'bg-orange-500'
    },
    {
      title: 'Vitals Updates',
      value: '3',
      change: 'Completed today',
      icon: HeartIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Next Shift',
      value: '14:00',
      change: 'Emergency Dept',
      icon: ClockIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/25 to-pink-200/25 blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.18, 1],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.22, 1],
          }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200/20 to-purple-200/20 blur-3xl"
          animate={{ 
            scale: [1, 1.12, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ 
            duration: 22, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/85 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
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
                className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -10, 10, 0],
                  boxShadow: "0 15px 30px -5px rgba(147, 51, 234, 0.4)"
                }}
                transition={{ duration: 0.3 }}
              >
                <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Nurse Dashboard
                </motion.h1>
                <motion.p 
                  className="text-gray-600 font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Patient Care & Shift Management
                </motion.p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.button
                onClick={() => setShowShiftBooking(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 15px 30px -5px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Book Shift
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors border border-red-200 hover:border-red-300 rounded-xl hover:bg-red-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/create-patient"
              className="flex items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="text-center">
                <UserPlusIcon className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-blue-900">Add Patient</p>
                <p className="text-xs text-blue-700">Register new patient</p>
              </div>
            </Link>
            
            <Link
              href="/book-appointment"
              className="flex items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="text-center">
                <CalendarDaysIcon className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-green-900">Schedule Visit</p>
                <p className="text-xs text-green-700">Book appointment</p>
              </div>
            </Link>
            
            <Link
              href="/upload-vitals"
              className="flex items-center justify-center p-4 bg-pink-50 border-2 border-pink-200 rounded-lg hover:bg-pink-100 transition-colors group"
            >
              <div className="text-center">
                <HeartIcon className="h-8 w-8 text-pink-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-pink-900">Record Vitals</p>
                <p className="text-xs text-pink-700">Upload vital signs</p>
              </div>
            </Link>
            
            <Link
              href="/create-prescription"
              className="flex items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="text-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-purple-900">Create Prescription</p>
                <p className="text-xs text-purple-700">Add medication order</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Patients</h3>
              <p className="text-gray-600 mt-1">Patients under your care</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {mockPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">Room {patient.room} • {patient.condition}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                          {patient.priority} Priority
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVitalsStatusColor(patient.vitalsStatus)}`}>
                          {patient.vitalsStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Next medication: <span className="font-medium">{patient.nextMedication}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link 
                          href="/book-appointment"
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                        >
                          Book Appointment
                        </Link>
                        <Link 
                          href="/upload-vitals"
                          className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                        >
                          Update Vitals
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medication Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Medication Schedule</h3>
              <p className="text-gray-600 mt-1">Upcoming medications</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockMedications.map((med) => (
                  <div
                    key={med.id}
                    className={`p-4 rounded-lg border-2 ${
                      med.status === 'overdue' 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{med.patientName}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        med.status === 'overdue' 
                          ? 'bg-red-100 text-red-800' 
                          : med.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {med.status}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{med.medication}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{med.time}</div>
                      <button 
                        onClick={() => handleMedicationAdministered(med, { name: med.patientName })}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                      >
                        Administer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
