'use client';

import { useState, useRef } from 'react';
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
import * as XLSX from 'xlsx';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setUploadedData(jsonData);
        toast.success(`Successfully uploaded ${jsonData.length} patient records`);
      } catch (error: unknown) {
        console.error('File upload error:', error);
        toast.error('Error reading file. Please ensure it\'s a valid Excel/CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
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

        {/* Advanced Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative backdrop-blur-xl bg-white/70 border border-blue-200/50 rounded-3xl shadow-2xl overflow-hidden mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent"></div>
          
          <div className="relative z-10 p-8">
            <motion.h3 
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Administrative Command Center
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  href="/create-patient"
                  className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-blue-50/70 hover:border-blue-500/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <UserPlusIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">Create Patient</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Add new patient</p>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  href="/book-appointment"
                  className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-emerald-50/70 hover:border-emerald-500/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CalendarIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">Schedule</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Book appointment</p>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  href="/create-prescription"
                  className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-red-50/70 hover:border-red-500/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">Prescription</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Write prescription</p>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  href="/upload-vitals"
                  className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-pink-50/70 hover:border-pink-500/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <HeartIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">Upload Vitals</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Record vital signs</p>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <button className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-purple-50/70 hover:border-purple-500/70 transition-all duration-300 shadow-lg hover:shadow-xl w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <ArrowUpTrayIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">Upload Data</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Import records</p>
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <button 
                  className="group flex flex-col items-center justify-center p-6 backdrop-blur-md bg-white/60 border-2 border-blue-300/50 rounded-2xl hover:bg-indigo-50/70 hover:border-indigo-500/70 transition-all duration-300 shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGeneratePrediction}
                  disabled={loading || !uploadedData}
                >
                  <motion.div
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl mb-3 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    animate={loading ? { rotate: 360 } : {}}
                  >
                    <Cog6ToothIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-900 text-center">AI Predict</p>
                  <p className="text-xs text-gray-600 text-center mt-1">Generate insights</p>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* AI Prediction Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Patient Data</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload Excel/CSV file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
              
              {uploadedData && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ {uploadedData.length} patient records uploaded
                  </p>
                </div>
              )}

              <button
                onClick={handleGeneratePrediction}
                disabled={loading || !uploadedData}
                className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Prediction...' : 'Generate AI Prediction'}
              </button>
            </div>
          </motion.div>

          {/* Results Summary */}
          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Patients:</span>
                  <span className="font-semibold">{predictionResult.totalPatients}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600">High Risk:</span>
                  <span className="font-semibold text-red-600">{predictionResult.highRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600">Medium Risk:</span>
                  <span className="font-semibold text-yellow-600">{predictionResult.mediumRisk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600">Low Risk:</span>
                  <span className="font-semibold text-green-600">{predictionResult.lowRisk}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Distribution Chart */}
          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="flex items-center justify-center">
                {/* Custom Donut Chart */}
                <div className="relative w-48 h-48">
                  {/* Background Circle */}
                  <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                  
                  {/* Donut Segments */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                      let currentAngle = 0;
                      
                      return pieChartData.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const startAngleRad = (currentAngle * Math.PI) / 180;
                        const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
                        
                        const innerRadius = 20;
                        const outerRadius = 40;
                        
                        const x1 = 50 + outerRadius * Math.cos(startAngleRad);
                        const y1 = 50 + outerRadius * Math.sin(startAngleRad);
                        const x2 = 50 + outerRadius * Math.cos(endAngleRad);
                        const y2 = 50 + outerRadius * Math.sin(endAngleRad);
                        
                        const x3 = 50 + innerRadius * Math.cos(endAngleRad);
                        const y3 = 50 + innerRadius * Math.sin(endAngleRad);
                        const x4 = 50 + innerRadius * Math.cos(startAngleRad);
                        const y4 = 50 + innerRadius * Math.sin(startAngleRad);
                        
                        const pathData = [
                          `M ${x1} ${y1}`,
                          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                          'Z'
                        ].join(' ');
                        
                        currentAngle += angle;
                        
                        return (
                          <motion.path
                            key={`segment-${index}`}
                            d={pathData}
                            fill={item.color}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {pieChartData.reduce((sum, item) => sum + item.value, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="ml-8 space-y-3">
                  {pieChartData.map((item, index) => (
                    <motion.div
                      key={`legend-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex items-center"
                    >
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-gray-600">{item.value} patients</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Level</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Factors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {predictionResult.patients
                      .filter(patient => patient.riskLevel === 'High')
                      .map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            High Risk
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {patient.riskFactors?.join(', ') || 'Multiple factors'}
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
