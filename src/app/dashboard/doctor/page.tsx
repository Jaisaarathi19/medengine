'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  UsersIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon,
  ClockIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Chatbot from '@/components/Chatbot';
import HighRiskPatientsWithFilters from '@/components/HighRiskPatientsWithFilters';
import { getHighRiskPatientStats } from '@/lib/firestore/high-risk-patients';
import { getAllDashboardStats, DashboardStats } from '@/lib/firestore/dashboard-stats';
import { getTodayAppointments, TodayAppointment } from '@/lib/firestore/appointments';
import { getWeeklyVitalsTrend } from '@/lib/firestore/vitals';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DoctorDashboard() {
  const router = useRouter();
  
  // Real-time appointments state
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  
  // Real-time vitals trend state
  const [vitalsTrend, setVitalsTrend] = useState([
    { name: 'Sun', bloodPressure: 120, heartRate: 72 },
    { name: 'Mon', bloodPressure: 125, heartRate: 75 },
    { name: 'Tue', bloodPressure: 130, heartRate: 78 },
    { name: 'Wed', bloodPressure: 135, heartRate: 80 },
    { name: 'Thu', bloodPressure: 140, heartRate: 85 },
    { name: 'Fri', bloodPressure: 138, heartRate: 82 },
    { name: 'Sat', bloodPressure: 142, heartRate: 88 }
  ]);
  const [vitalsLoading, setVitalsLoading] = useState(true);
  
  // Dashboard statistics
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
    total: 0,
    critical: 0,
    high: 0,
    newAlerts: 0,
    acknowledged: 0,
    resolved: 0
  });
  
  const [statsLoading, setStatsLoading] = useState(true);

  // Load all dashboard statistics
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setStatsLoading(true);
        setAppointmentsLoading(true);
        setVitalsLoading(true);
        
        // Load dashboard stats, high-risk stats, appointments, and vitals trend
        const [allStats, detailedHighRisk, appointments, weeklyVitals] = await Promise.all([
          getAllDashboardStats(),
          getHighRiskPatientStats(),
          getTodayAppointments(),
          getWeeklyVitalsTrend()
        ]);
        
        setDashboardStats(allStats);
        setHighRiskStats(detailedHighRisk);
        setTodayAppointments(appointments);
        setVitalsTrend(weeklyVitals);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setStatsLoading(false);
        setAppointmentsLoading(false);
        setVitalsLoading(false);
      }
    };

    loadAllData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(loadAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      // Navigate to home page first, before signing out
      router.push('/');
      
      // Then sign out after a small delay to ensure navigation happens first
      setTimeout(async () => {
        await signOut(auth);
        toast.success('Logged out successfully');
      }, 100);
    } catch (error: unknown) {
      toast.error('Error logging out');
      // Fallback: ensure we still go to home page even if logout fails
      router.push('/');
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
      title: 'Today\'s Appointments',
      value: statsLoading ? '...' : dashboardStats.todayAppointments.toString(),
      change: statsLoading ? 'Loading...' : dashboardStats.appointmentsChange,
      icon: CalendarDaysIcon,
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
      icon: ChartBarIcon,
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
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-200/25 to-blue-200/25 blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.15, 1],
          }}
          transition={{ 
            duration: 28, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/25 to-teal-200/25 blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{ 
            duration: 32, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-200/20 to-green-200/20 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 20, 
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
                className="bg-gradient-to-br from-blue-500 to-green-600 p-3 rounded-xl shadow-lg"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -10, 10, 0],
                  boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.4)"
                }}
                transition={{ duration: 0.3 }}
              >
                <HeartIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Doctor Dashboard
                </motion.h1>
                <motion.p 
                  className="text-gray-600 font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Patient Management & Medical Records
                </motion.p>
              </div>
            </motion.div>
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors border border-red-200 hover:border-red-300 rounded-xl hover:bg-red-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Logout
            </motion.button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              href="/create-prescription"
              className="flex items-center justify-center p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
            >
              <div className="text-center">
                <ClipboardDocumentIcon className="h-8 w-8 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-red-900">Write Prescription</p>
                <p className="text-xs text-red-700">Prescribe medication</p>
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
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {appointmentsLoading ? 'Loading...' : `${todayAppointments.length} appointments scheduled`}
                </p>
              </div>
              <div className="p-6">
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment) => (
                      <motion.div 
                        key={appointment.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              appointment.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No appointments today</p>
                    <p className="text-sm">Your schedule is clear</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vitals Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Patient Vitals Trend</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {vitalsLoading ? 'Loading...' : 'Weekly average vitals from real patient data'}
                </p>
              </div>
              <div className="p-6">
                {vitalsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                ) : (
                  /* Custom Line Chart */
                  <div className="space-y-4">
                    {/* Chart Legend */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Blood Pressure</span>
                      </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Heart Rate</span>
                    </div>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="relative h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 400 160">
                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={`grid-${i}`}
                          x1="40"
                          y1={30 + i * 25}
                          x2="380"
                          y2={30 + i * 25}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Y-axis labels */}
                      <text x="10" y="35" className="text-xs fill-gray-500">160</text>
                      <text x="10" y="60" className="text-xs fill-gray-500">140</text>
                      <text x="10" y="85" className="text-xs fill-gray-500">120</text>
                      <text x="10" y="110" className="text-xs fill-gray-500">100</text>
                      <text x="10" y="135" className="text-xs fill-gray-500">80</text>
                      
                      {/* Blood Pressure Line */}
                      <motion.path
                        d={`M 60,${150 - (vitalsTrend[0].bloodPressure - 80)} ${vitalsTrend
                          .slice(1)
                          .map((point, index) => 
                            `L ${60 + (index + 1) * 50},${150 - (point.bloodPressure - 80)}`
                          )
                          .join(' ')}`}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                      
                      {/* Heart Rate Line */}
                      <motion.path
                        d={`M 60,${150 - (vitalsTrend[0].heartRate - 60)} ${vitalsTrend
                          .slice(1)
                          .map((point, index) => 
                            `L ${60 + (index + 1) * 50},${150 - (point.heartRate - 60)}`
                          )
                          .join(' ')}`}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
                      />
                      
                      {/* Data Points */}
                      {vitalsTrend.map((point, index) => (
                        <g key={`points-${index}`}>
                          {/* Blood Pressure Point */}
                          <motion.circle
                            cx={60 + index * 50}
                            cy={150 - (point.bloodPressure - 80)}
                            r="4"
                            fill="#EF4444"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5 + index * 0.1 }}
                            className="hover:r-6 cursor-pointer"
                          />
                          
                          {/* Heart Rate Point */}
                          <motion.circle
                            cx={60 + index * 50}
                            cy={150 - (point.heartRate - 60)}
                            r="4"
                            fill="#3B82F6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.7 + index * 0.1 }}
                            className="hover:r-6 cursor-pointer"
                          />
                          
                          {/* Day Label */}
                          <text
                            x={60 + index * 50}
                            y="170"
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                          >
                            {point.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  {/* Current Values */}
                  <div className="flex justify-between mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Latest BP</div>
                      <div className="text-lg font-semibold text-red-600">
                        {vitalsTrend[vitalsTrend.length - 1]?.bloodPressure || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Latest HR</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {vitalsTrend[vitalsTrend.length - 1]?.heartRate || 'N/A'}
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>

            {/* High-Risk Patients with Filters */}
            <HighRiskPatientsWithFilters maxDisplay={8} />
          </div>
        </div>
      </motion.main>

      {/* Chatbot */}
      <Chatbot />
    </div>
    </ProtectedRoute>
  );
}
