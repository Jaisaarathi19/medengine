'use client';

import { useState } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePatientSummary } from '@/lib/gemini';
import { toast } from 'react-hot-toast';
import Chatbot from '@/components/Chatbot';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';

// Mock data
const mockPatients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 45,
    condition: 'Hypertension',
    riskLevel: 'Medium' as const,
    lastVisit: new Date('2025-08-25'),
    vitals: { bp: '140/90', hr: 78, temp: 98.6 }
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 67,
    condition: 'Diabetes',
    riskLevel: 'High' as const,
    lastVisit: new Date('2025-08-26'),
    vitals: { bp: '160/100', hr: 85, temp: 99.2 }
  },
  {
    id: '3',
    name: 'Emily Davis',
    age: 32,
    condition: 'Asthma',
    riskLevel: 'Low' as const,
    lastVisit: new Date('2025-08-27'),
    vitals: { bp: '120/80', hr: 72, temp: 98.4 }
  }
];

const mockAppointments = [
  { id: '1', patient: 'Sarah Johnson', time: '09:00 AM', type: 'Follow-up' },
  { id: '2', patient: 'Michael Chen', time: '10:30 AM', type: 'Check-up' },
  { id: '3', patient: 'Emily Davis', time: '02:00 PM', type: 'Consultation' },
  { id: '4', patient: 'Robert Wilson', time: '03:30 PM', type: 'Treatment' }
];

const vitalsTrend = [
  { name: 'Mon', bloodPressure: 120, heartRate: 72 },
  { name: 'Tue', bloodPressure: 125, heartRate: 75 },
  { name: 'Wed', bloodPressure: 130, heartRate: 78 },
  { name: 'Thu', bloodPressure: 135, heartRate: 80 },
  { name: 'Fri', bloodPressure: 140, heartRate: 85 },
  { name: 'Sat', bloodPressure: 138, heartRate: 82 },
  { name: 'Sun', bloodPressure: 142, heartRate: 88 }
];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Record<string, unknown> | null>(null);
  const [patientSummary, setPatientSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });
  const router = useRouter();

  const handleGenerateSummary = async (patient: Record<string, unknown>) => {
    setLoadingSummary(true);
    setSelectedPatient(patient);
    
    try {
      const summary = await generatePatientSummary(patient);
      setPatientSummary(summary);
    } catch (error: unknown) {
      toast.error('Error generating patient summary');
      setPatientSummary('Unable to generate summary at this time.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handlePrescribe = (patient: Record<string, unknown>) => {
    setSelectedPatient(patient);
    setShowPrescriptionForm(true);
  };

  const handleSubmitPrescription = () => {
    if (!prescriptionData.medication || !prescriptionData.dosage) {
      toast.error('Please fill in medication and dosage');
      return;
    }

    // In a real app, this would save to the database
    toast.success(`Prescription added for ${(selectedPatient as Record<string, unknown>)?.name as string}`);
    setShowPrescriptionForm(false);
    setPrescriptionData({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    });
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Total Patients',
      value: '24',
      change: '+2 this week',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Appointments',
      value: '8',
      change: '2 upcoming',
      icon: CalendarDaysIcon,
      color: 'bg-green-500'
    },
    {
      title: 'High Risk Patients',
      value: '3',
      change: 'Needs attention',
      icon: BellIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Average Recovery',
      value: '85%',
      change: '+5% this month',
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            
            <button className="flex items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group">
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-purple-900">View Reports</p>
                <p className="text-xs text-purple-700">Medical analytics</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Patients</h3>
              <p className="text-gray-600 mt-1">Manage your assigned patients</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.age} years old • {patient.condition}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel} Risk
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Last visit: {formatDate(patient.lastVisit)}</span>
                      <span>BP: {patient.vitals.bp} | HR: {patient.vitals.hr}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateSummary(patient)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        AI Summary
                      </button>
                      <button
                        onClick={() => handlePrescribe(patient)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Prescribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {appointment.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vitals Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Patient Vitals Trend</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={vitalsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bloodPressure" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="heartRate" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Summary Modal */}
        {selectedPatient && patientSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Summary: {selectedPatient?.name as string}
                  </h3>
                  <button
                    onClick={() => { setSelectedPatient(null); setPatientSummary(''); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loadingSummary ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Generating AI summary...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{patientSummary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prescription Form Modal */}
        {showPrescriptionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Prescribe Medication
                  </h3>
                  <button
                    onClick={() => setShowPrescriptionForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient: {selectedPatient?.name as string}
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
                    <input
                      type="text"
                      value={prescriptionData.medication}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter medication name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={prescriptionData.dosage}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={prescriptionData.frequency}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Twice daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={prescriptionData.duration}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 7 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={prescriptionData.notes}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional instructions..."
                    />
                  </div>

                  <button
                    onClick={handleSubmitPrescription}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
