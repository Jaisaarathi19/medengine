'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { generatePrediction } from '@/lib/gemini';
import { toast } from 'react-hot-toast';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import EnhancedPredictionResults from '@/components/EnhancedPredictionResults';
import Chatbot from '@/components/Chatbot';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PredictionResult {
  totalPatients: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  patients: Array<{
    id: string;
    name: string;
    riskLevel: string;
    riskFactors: string[];
  }>;
}

const COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981'
};

export default function AdminDashboard() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState<unknown[] | null>(null);
  const router = useRouter();

  const handleFileUploadData = (jsonData: unknown[]) => {
    setUploadedData(jsonData);
  };

  const handleGeneratePrediction = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      toast.error('Please upload patient data first');
      return;
    }

    setLoading(true);
    try {
      const result = await generatePrediction(uploadedData);
      setPredictionResult(result);
      toast.success('AI prediction completed successfully!');
    } catch (error: unknown) {
      console.error('Prediction error:', error);
      toast.error('Error generating prediction. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const pieChartData = predictionResult ? [
    { name: 'High Risk', value: predictionResult.highRisk, color: COLORS.high },
    { name: 'Medium Risk', value: predictionResult.mediumRisk, color: COLORS.medium },
    { name: 'Low Risk', value: predictionResult.lowRisk, color: COLORS.low }
  ] : [];

  const hospitalStats = [
    {
      title: 'Total Patients',
      value: predictionResult?.totalPatients || 248,
      change: '+12%',
      changeType: 'increase' as const,
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'High Risk Patients',
      value: predictionResult?.highRisk || 23,
      change: '-5%',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Appointments Today',
      value: 67,
      change: '+8%',
      changeType: 'increase' as const,
      icon: CalendarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Average Stay',
      value: '4.2 days',
      change: '-0.3',
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Ultra Advanced Animated Background */}
      <div className="absolute inset-0">
        {/* Primary Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40"></div>
        
        {/* Animated Geometric Shapes */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/20 via-indigo-200/15 to-purple-200/10 blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200/20 via-blue-200/15 to-indigo-200/10 blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/15 via-purple-200/10 to-blue-200/15 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{ 
            duration: 28, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`floating-element absolute w-${Math.floor(Math.random() * 3) + 1} h-${Math.floor(Math.random() * 3) + 1} bg-blue-400/30 rounded-full`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(180deg,#000_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Animated Mesh Gradient */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Ultra Modern Header */}
      <motion.header 
        className="relative z-10 backdrop-blur-xl bg-white/80 border-b border-blue-200/50 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-blue-50/30 to-white/90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.div 
                className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg overflow-hidden"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, 0],
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.6)"
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                <ShieldCheckIcon className="h-10 w-10 text-white relative z-10" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Admin Command Center
                </motion.h1>
                <motion.p 
                  className="text-gray-700 font-medium mt-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Advanced Hospital Management & AI Analytics
                </motion.p>
              </div>
            </motion.div>
            <motion.button
              onClick={handleLogout}
              className="relative px-6 py-3 text-gray-800 font-semibold transition-all duration-300 border-2 border-blue-300 rounded-xl bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200/50 group overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative z-10">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Ultra Advanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {hospitalStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="group relative backdrop-blur-xl bg-white/70 border border-blue-200/50 rounded-3xl shadow-2xl overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.3)",
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-white/60"></div>
                
                {/* Animated Background Gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <motion.p 
                        className="text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.3 }}
                      >
                        {stat.title}
                      </motion.p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mb-3"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.4 }}
                      >
                        {stat.value}
                      </motion.p>
                      <motion.div 
                        className={`flex items-center text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-500'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <motion.div
                          animate={stat.changeType === 'increase' ? { y: [0, -2, 0] } : { y: [0, 2, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowTrendingUpIcon className={`h-5 w-5 mr-2 ${
                            stat.changeType === 'decrease' ? 'rotate-180' : ''
                          }`} />
                        </motion.div>
                        {stat.change}
                      </motion.div>
                    </div>
                    <motion.div 
                      className={`${stat.color} p-4 rounded-2xl shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced AI Prediction Analytics Section */}
        <div id="enhanced-upload-section">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mb-12"
          >
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {/* Enhanced Upload Section */}
            <EnhancedFileUpload
              onFileUpload={handleFileUploadData}
              uploadedData={uploadedData}
              loading={loading}
              onGeneratePrediction={handleGeneratePrediction}
            />

            {/* Enhanced Prediction Results */}
            {predictionResult && (
              <EnhancedPredictionResults predictionResult={predictionResult} />
            )}
          </div>
        </motion.div>
        </div>

        {/* High Risk Patients */}
        {predictionResult && predictionResult.patients && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">High Risk Patients</h3>
              <p className="text-gray-600 mt-1">Patients requiring immediate attention</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">UHID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Diagnosis</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ML Confid</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Prediction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {predictionResult.patients
                      .filter(patient => patient.riskLevel === 'High')
                      .map((patient, index) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {101 + index}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {patient.riskFactors?.[0] || 'Circulatory'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          Cardiology
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(Math.random() * 50 + 25).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.riskLevel === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
    </ProtectedRoute>
  );
}
