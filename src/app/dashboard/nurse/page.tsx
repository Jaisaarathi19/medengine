'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  BellIcon,
  HeartIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Chatbot from '@/components/Chatbot';
import HighRiskPatientsWithFilters from '@/components/HighRiskPatientsWithFilters';
import { getHighRiskPatientStats } from '@/lib/firestore/high-risk-patients';
import { getAllDashboardStats, DashboardStats } from '@/lib/firestore/dashboard-stats';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

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
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalPatientsChange: 'Loading...',
    todayAppointments: 0,
    appointmentsChange: 'Loading...',
    highRiskPatients: 0,
    highRiskChange: 'Loading...',
    averageRecovery: 0,
    recoveryChange: 'Loading...'
  });
  
  // High-risk patient statistics (for detailed breakdown)
  const [highRiskStats, setHighRiskStats] = useState({
    critical: 0,
    high: 0,
    newAlerts: 0
  });
  
  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);

  // Load real-time dashboard data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setStatsLoading(true);
        
        // Load dashboard stats and high-risk stats
        const [allStats, detailedHighRisk] = await Promise.all([
          getAllDashboardStats(),
          getHighRiskPatientStats()
        ]);
        
        setDashboardStats(allStats);
        setHighRiskStats(detailedHighRisk);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setStatsLoading(false);
      }
    };

    loadAllData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(loadAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  const [showShiftBooking, setShowShiftBooking] = useState(false);

  const handleMedicationAdministered = (medication: any, patient: any) => {
    toast.success(`${medication.medication} administered to ${patient.name}`);
  };

  const handleLogout = async () => {
    try {
      // Navigate to home page first, before signing out
      router.push('/');
      
      // Then sign out after a small delay to ensure navigation happens first
      setTimeout(async () => {
        await signOut(auth);
        toast.success('Logged out successfully');
      }, 100);
    } catch (error: any) {
      toast.error('Error logging out');
      // Fallback: ensure we still go to home page even if logout fails
      router.push('/');
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
      title: 'Total Patients',
      value: statsLoading ? '...' : dashboardStats.totalPatients.toString(),
      change: statsLoading ? 'Loading...' : dashboardStats.totalPatientsChange,
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Care Tasks',
      value: statsLoading ? '...' : dashboardStats.todayAppointments.toString(),
      change: statsLoading ? 'Loading...' : dashboardStats.appointmentsChange,
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500'
    },
    {
      title: 'High Risk Patients',
      value: statsLoading ? '...' : dashboardStats.highRiskPatients.toString(),
      change: statsLoading ? 'Loading...' : dashboardStats.highRiskChange,
      icon: BellIcon,
      color: statsLoading 
        ? 'bg-gray-400'
        : highRiskStats.newAlerts > 0 
          ? 'bg-red-500' 
          : dashboardStats.highRiskPatients > 0 
            ? 'bg-red-500' 
            : 'bg-green-500'
    },
    {
      title: 'Recovery Rate',
      value: statsLoading ? '...' : `${dashboardStats.averageRecovery}%`,
      change: statsLoading ? 'Loading...' : dashboardStats.recoveryChange,
      icon: HeartIcon,
      color: statsLoading 
        ? 'bg-gray-400'
        : dashboardStats.averageRecovery >= 80 
          ? 'bg-green-500'
          : dashboardStats.averageRecovery >= 60
            ? 'bg-yellow-500'
            : 'bg-red-500'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['nurse']}>
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
              className={`bg-white p-6 rounded-xl shadow-sm border ${
                stat.title === 'High Risk Patients' && dashboardStats.highRiskPatients > 0
                  ? 'border-red-200 ring-2 ring-red-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${
                    stat.title === 'High Risk Patients' && dashboardStats.highRiskPatients > 0
                      ? 'text-red-600 font-medium'
                      : stat.title === 'Recovery Rate' && dashboardStats.averageRecovery >= 80
                        ? 'text-green-600 font-medium'
                        : stat.title === 'Recovery Rate' && dashboardStats.averageRecovery < 60
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl ${
                  stat.title === 'High Risk Patients' && highRiskStats.newAlerts > 0
                    ? 'animate-pulse'
                    : ''
                }`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
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
          </div>
        </motion.div>

        {/* Main Grid */}

        {/* High-Risk Patients Section */}
        <div className="mt-8">
          <HighRiskPatientsWithFilters />
        </div>
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
    </ProtectedRoute>
  );
}
