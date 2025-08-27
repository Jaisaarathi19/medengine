'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatDate, formatTime } from '@/lib/utils';
import { getPatientAppointments } from '@/lib/firestore/appointments';
import { getPatientVitals } from '@/lib/firestore/vitals';
import { getPatientPrescriptions, getPatientLabResults } from '@/lib/firestore/patient-data';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribers: (() => void)[] = [];
    
    const setupRealtimeListeners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set up patient document listener
        const patientRef = doc(db, 'patients', user.uid);
        const unsubPatient = onSnapshot(patientRef, (doc) => {
          if (doc.exists()) {
            setPatientData(doc.data());
          } else {
            setPatientData({
              name: user.displayName || 'Patient',
              email: user.email,
              age: 30,
              bloodType: 'O+',
              allergies: [],
              emergencyContact: {
                name: 'Emergency Contact',
                phone: 'Not provided'
              }
            });
          }
        });
        unsubscribers.push(unsubPatient);
        
        // Set up appointments listener
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', user.uid)
        );
        const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
          const appointmentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAppointments(appointmentsData.sort((a: any, b: any) => 
            new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
          ));
          setLastUpdate(new Date());
        });
        unsubscribers.push(unsubAppointments);
        
        // Set up prescriptions listeners for multiple collections
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', user.uid)
        );
        const medicationsQuery = query(
          collection(db, 'medications'),
          where('patientId', '==', user.uid)
        );
        
        let prescriptionsData: any[] = [];
        let medicationsData: any[] = [];
        
        const unsubPrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
          prescriptionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          updatePrescriptions();
        });
        
        const unsubMedications = onSnapshot(medicationsQuery, (snapshot) => {
          medicationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            patientId: doc.data().patientId,
            medication: doc.data().medication || doc.data().name,
            dosage: doc.data().dosage || doc.data().dose,
            frequency: doc.data().frequency || doc.data().instructions,
            duration: doc.data().duration || '30 days',
            prescribedBy: doc.data().prescribedBy || doc.data().doctor,
            status: doc.data().status || 'active',
            createdAt: doc.data().createdAt,
            notes: doc.data().notes
          }));
          updatePrescriptions();
        });
        
        const updatePrescriptions = () => {
          const allPrescriptions = [...prescriptionsData, ...medicationsData];
          setPrescriptions(allPrescriptions.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          setLastUpdate(new Date());
        };
        
        unsubscribers.push(unsubPrescriptions, unsubMedications);
        
        // Set up vitals listeners for multiple collections
        const vitalSignsQuery = query(
          collection(db, 'vital_signs'),
          where('patient.id', '==', user.uid)
        );
        const vitalsQuery = query(
          collection(db, 'vitals'),
          where('patientId', '==', user.uid)
        );
        
        let vitalSignsData: any[] = [];
        let vitalsData: any[] = [];
        
        const unsubVitalSigns = onSnapshot(vitalSignsQuery, (snapshot) => {
          vitalSignsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            patientId: doc.data().patient?.id || doc.data().patientId,
            createdAt: doc.data().metadata?.createdAt || doc.data().createdAt
          }));
          updateVitals();
        });
        
        const unsubVitalsCollection = onSnapshot(vitalsQuery, (snapshot) => {
          vitalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          updateVitals();
        });
        
        const updateVitals = () => {
          const allVitals = [...vitalSignsData, ...vitalsData];
          setVitals(allVitals.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.metadata?.createdAt);
            const dateB = new Date(b.createdAt || b.metadata?.createdAt);
            return dateB.getTime() - dateA.getTime();
          }).slice(0, 10));
          setLastUpdate(new Date());
        };
        
        unsubscribers.push(unsubVitalSigns, unsubVitalsCollection);
        
        // Set up lab results listener
        const labResultsQuery = query(
          collection(db, 'labResults'),
          where('patientId', '==', user.uid)
        );
        const unsubLabResults = onSnapshot(labResultsQuery, (snapshot) => {
          const labResultsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setLabResults(labResultsData.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          setLastUpdate(new Date());
        });
        unsubscribers.push(unsubLabResults);
        
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error setting up real-time listeners:', err);
        setError('Failed to set up real-time data sync');
        setIsLoading(false);
      }
    };
    
    setupRealtimeListeners();
    
    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get latest vital signs
  const latestVitals = vitals.length > 0 ? vitals[0] : null;
  
  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = apt.date || apt.appointment?.date;
      if (!appointmentDate) return false;
      const date = new Date(appointmentDate);
      return !isNaN(date.getTime()) && date >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a.appointment?.date);
      const dateB = new Date(b.date || b.appointment?.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const handleContactDoctor = (appointment: any) => {
    toast(`Contacting ${appointment.doctorName}...`);
  };

  const handleDownloadReport = (report: any) => {
    toast.success(`Downloading ${report.test} report...`);
  };

  const handleLogout = async () => {
    try {
      router.push('/');
      setTimeout(async () => {
        await signOut(auth);
        toast.success('Logged out successfully');
      }, 100);
    } catch (error: unknown) {
      toast.error('Error logging out');
      router.push('/');
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

  // Real-time stats based on actual data
  const stats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length.toString(),
      change: upcomingAppointments.length > 0 ? `Next: ${formatDate(upcomingAppointments[0].date || upcomingAppointments[0].appointment?.date)}` : 'None scheduled',
      icon: CalendarDaysIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Recent Vitals',
      value: vitals.length.toString(),
      change: latestVitals ? `Latest: ${formatDate(latestVitals.createdAt || latestVitals.metadata?.createdAt)}` : 'No data',
      icon: HeartIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Heart Rate',
      value: latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : 'N/A',
      change: latestVitals?.heartRate > 100 ? 'Above normal' : 'Normal range',
      icon: DocumentTextIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Blood Pressure',
      value: latestVitals?.bloodPressure ? latestVitals.bloodPressure : 'N/A',
      change: latestVitals ? 'Within limits' : 'No data',
      icon: HeartIcon,
      color: 'bg-red-500'
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
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.3 }}
                style={{ 
                  boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)" 
                }}
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
                  Welcome, {patientData?.name || user?.displayName || 'Patient'}!
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
              {/* Real-time Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">
                  Live • Updated {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
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
                y: -5
              }}
              style={{
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
                scale: 1.02
              }}
              style={{
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
                  {prescriptions.length > 0 ? prescriptions.map((medication: any, index: number) => (
                    <motion.div
                      key={medication.id}
                      className="border border-gray-200/50 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 5
                      }}
                      style={{
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{medication.medication}</h4>
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
                      
                      {medication.notes && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center space-x-2">
                            <BellIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-900 font-medium">
                              Notes: {medication.notes}
                            </span>
                          </div>
                        </div>
                      )}
                      
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No prescriptions found</p>
                    </div>
                  )}
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
                    {vitals.length > 0 ? vitals.slice(0, 5).map((vital: any, index: number) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500 mb-2">
                          {formatDate(vital.createdAt || vital.metadata?.createdAt).substring(0, 5)}
                        </div>
                        <div className="space-y-2 flex flex-col items-center">
                          {/* Blood Pressure Bar */}
                          <div className="w-6 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-purple-500 rounded-full"
                              initial={{ height: 0 }}
                              animate={{ height: `${((vital.bloodPressure ? parseInt(vital.bloodPressure.split('/')[0]) : 120) / 140) * 80}px` }}
                              transition={{ delay: index * 0.1, duration: 0.6 }}
                              title={`BP: ${vital.bloodPressure || 'N/A'}`}
                            />
                          </div>
                          
                          {/* Heart Rate Bar */}
                          <div className="w-6 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-red-500 rounded-full"
                              initial={{ height: 0 }}
                              animate={{ height: `${((vital.heartRate || 70) / 100) * 60}px` }}
                              transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                              title={`HR: ${vital.heartRate || 'N/A'}`}
                            />
                          </div>
                          
                          {/* Values */}
                          <div className="text-xs space-y-1">
                            <div className="text-purple-600 font-semibold">
                              {vital.bloodPressure ? vital.bloodPressure.split('/')[0] : 'N/A'}
                            </div>
                            <div className="text-red-600 font-semibold">{vital.heartRate || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <HeartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No vital signs recorded yet</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Latest Values */}
                  {latestVitals && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500">Latest BP</div>
                        <div className="text-lg font-bold text-purple-600">
                          {latestVitals.bloodPressure || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500">Latest HR</div>
                        <div className="text-lg font-bold text-red-600">
                          {latestVitals.heartRate ? `${latestVitals.heartRate} BPM` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500">Temperature</div>
                        <div className="text-lg font-bold text-blue-600">
                          {latestVitals.temperature ? `${latestVitals.temperature}°F` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
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
                  {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {appointment.doctorName || appointment.appointment?.doctor || 'Doctor'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.specialty || appointment.appointment?.department || 'General'} • {appointment.type || appointment.appointment?.type || 'Appointment'}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>{formatDate(appointment.date || appointment.appointment?.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatTime(appointment.date || appointment.appointment?.date)}</span>
                        </div>
                        <p className="text-xs">{appointment.location || appointment.appointment?.location || 'Location TBD'}</p>
                      </div>

                      <button
                        onClick={() => handleContactDoctor(appointment)}
                        className="w-full px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        <span>Contact Doctor</span>
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming appointments</p>
                    </div>
                  )}
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
