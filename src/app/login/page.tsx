'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  HeartIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/types';

const roleConfig = {
  doctor: {
    title: 'Doctor',
    icon: HeartIcon,
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  nurse: {
    title: 'Nurse',
    icon: ClipboardDocumentListIcon,
    color: 'bg-green-600',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  patient: {
    title: 'Patient',
    icon: UserGroupIcon,
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  admin: {
    title: 'Admin',
    icon: ShieldCheckIcon,
    color: 'bg-red-600',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600'
  }
};

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole || 'patient';

  const config = roleConfig[role] || roleConfig.patient;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === role) {
            toast.success(`Welcome back, ${userData.profile?.name || userData.name || 'User'}!`);
            router.push(`/dashboard/${role}`);
          } else {
            toast.error('You do not have permission to access this role.');
            await auth.signOut();
          }
        } else {
          // User document doesn't exist, create it based on email
          console.log('Creating user document for:', userCredential.user.email);
          
          let userRole = role;
          let profile: any = { name: 'Unknown User' };
          
          // Determine role and profile based on email
          if (userCredential.user.email === 'admin@medengine.com') {
            userRole = 'admin';
            profile = {
              name: 'Dr. Sarah Johnson',
              department: 'Administration',
              phone: '+1-555-0101',
              specialization: 'Hospital Administration'
            };
          } else if (userCredential.user.email === 'doctor@medengine.com') {
            userRole = 'doctor';
            profile = {
              name: 'Dr. Michael Chen',
              department: 'Cardiology',
              phone: '+1-555-0102',
              specialization: 'Cardiologist',
              licenseNumber: 'MD-12345'
            };
          } else if (userCredential.user.email === 'nurse@medengine.com') {
            userRole = 'nurse';
            profile = {
              name: 'Emily Rodriguez',
              department: 'Emergency',
              phone: '+1-555-0103',
              shift: 'Day Shift',
              licenseNumber: 'RN-67890'
            };
          } else if (userCredential.user.email === 'patient@medengine.com') {
            userRole = 'patient';
            profile = {
              name: 'John Smith',
              dateOfBirth: '1985-06-15',
              phone: '+1-555-0104',
              address: '123 Main St, City, State 12345',
              emergencyContact: 'Jane Smith - +1-555-0105'
            };
          }
          
          // Create user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            role: userRole,
            profile: profile,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
          });
          
          if (userRole === role) {
            toast.success(`Welcome, ${profile.name}! Your profile has been created.`);
            router.push(`/dashboard/${role}`);
          } else {
            toast.error('You do not have permission to access this role.');
            await auth.signOut();
          }
        }
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          email,
          name,
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        toast.success('Account created successfully!');
        router.push(`/dashboard/${role}`);
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-blue-100/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-conic from-blue-200 via-purple-200 to-pink-200 rounded-full opacity-10 animate-spin-slow"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="floating-element absolute top-60 right-1/3 w-2 h-2 bg-indigo-400 rounded-full opacity-70" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/" 
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </motion.div>

        {/* Demo Credentials Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> admin@medengine.ai / medengine123</div>
            <div><strong>Doctor:</strong> doctor@medengine.com / medengine123</div>
            <div><strong>Nurse:</strong> nurse@medengine.ai / medengine123</div>
            <div><strong>Patient:</strong> patient@medengine.ai / medengine123</div>
          </div>
        </motion.div>

        {/* Glassmorphism Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/50 to-transparent"></div>
          
          {/* Header */}
          <div className="relative z-10 text-center mb-10">
            <motion.div 
              className={`${config.lightColor} p-6 rounded-3xl w-24 h-24 mx-auto mb-6 relative`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <config.icon className={`w-12 h-12 ${config.textColor} mx-auto mt-1`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {config.title} {isLogin ? 'Login' : 'Sign Up'}
            </motion.h1>
            <motion.p 
              className="text-gray-600 mt-3 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create your account to get started.'}
            </motion.p>
          </div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="relative z-10 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
              >
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-5 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  placeholder="Enter your full name"
                />
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 pr-14 bg-white/60 border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm text-gray-900 font-medium shadow-lg"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 px-6 bg-gradient-to-r ${config.color} text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl backdrop-blur-sm`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                  />
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </motion.form>

          {/* Toggle */}
          <motion.div 
            className="relative z-10 mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <motion.button
                onClick={() => setIsLogin(!isLogin)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`font-semibold ${config.textColor} hover:underline transition-all duration-300`}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </motion.button>
            </p>
          </motion.div>

          {/* Enhanced Demo Credentials */}
          <motion.div 
            className="relative z-10 mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <p className="text-sm text-gray-700 font-semibold mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Demo Credentials:
            </p>
            <div className="text-sm text-gray-600 bg-white/50 rounded-xl p-3">
              <p className="font-mono">Email: <span className="font-semibold">{role}@medengine.com</span></p>
              <p className="font-mono">Password: <span className="font-semibold">demo123</span></p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
