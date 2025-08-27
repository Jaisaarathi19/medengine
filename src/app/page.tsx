'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

const roles = [
  {
    title: 'Patient Portal',
    subtitle: 'Your Health Journey',
    description: 'Access your medical records, book appointments, and manage your health information securely.',
    href: '/login?role=patient',
    color: 'blue',
  },
  {
    title: 'Doctor Dashboard',
    subtitle: 'Clinical Excellence',
    description: 'Comprehensive patient management, treatment planning, and AI-powered insights.',
    href: '/login?role=doctor',
    color: 'green',
  },
  {
    title: 'Nurse Station',
    subtitle: 'Care Coordination',
    description: 'Patient monitoring, medication management, and seamless care coordination.',
    href: '/login?role=nurse',
    color: 'purple',
  },
  {
    title: 'Admin Control',
    subtitle: 'System Management',
    description: 'Hospital operations, staff management, and comprehensive system oversight.',
    href: '/login?role=admin',
    color: 'red',
  },
];

const features = [
  {
    title: 'AI-Powered Diagnostics',
    description: 'Advanced machine learning algorithms provide intelligent insights and recommendations.',
    icon: '🧠',
    gradient: 'from-blue-400 to-purple-600',
  },
  {
    title: 'Real-Time Monitoring',
    description: 'Continuous patient monitoring with instant alerts and automated responses.',
    icon: '📊',
    gradient: 'from-green-400 to-blue-500',
  },
  {
    title: 'Secure Data Management',
    description: 'HIPAA-compliant data storage with end-to-end encryption and backup systems.',
    icon: '🔒',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    title: 'Seamless Integration',
    description: 'Connect with existing hospital systems and third-party medical devices.',
    icon: '🔗',
    gradient: 'from-orange-400 to-red-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/30 to-blue-200/30 blur-3xl"
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedEngine AI
              </span>
            </motion.div>
            
            <motion.div
              className="hidden sm:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center space-x-6 text-sm font-medium text-gray-600">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </span>
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The Future of{' '}
              <motion.span
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Healthcare
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Advanced AI-powered hospital management system revolutionizing patient care, 
              streamlining operations, and empowering healthcare professionals.
            </motion.p>
          </motion.div>
        </div>
      </section>

                {/* Role Selection Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Portal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access your personalized dashboard with role-based features and capabilities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Link href={role.href}>
                  <motion.div
                    className="group h-full p-8 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                    whileHover={{ 
                      scale: 1.03, 
                      y: -8,
                      borderColor: role.color === 'blue' ? 'rgb(59 130 246)' :
                                   role.color === 'green' ? 'rgb(34 197 94)' :
                                   role.color === 'purple' ? 'rgb(147 51 234)' :
                                   'rgb(239 68 68)',
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)"
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex flex-col h-full">
                      {/* Icon */}
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg transition-all duration-300 ${
                          role.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700' :
                          role.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700' :
                          role.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700' :
                          'bg-gradient-to-br from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700'
                        }`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <HeartIcon className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {role.title}
                        </h3>
                        <p className={`text-sm font-semibold mb-4 ${
                          role.color === 'blue' ? 'text-blue-600' :
                          role.color === 'green' ? 'text-green-600' :
                          role.color === 'purple' ? 'text-purple-600' :
                          'text-red-600'
                        }`}>
                          {role.subtitle}
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {role.description}
                        </p>
                      </div>

                      {/* Animated Button */}
                      <motion.div
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                        whileHover={{ 
                          scale: 1.05,
                          backgroundImage: role.color === 'blue' ? 'linear-gradient(to right, rgb(59 130 246), rgb(37 99 235))' :
                                          role.color === 'green' ? 'linear-gradient(to right, rgb(34 197 94), rgb(22 163 74))' :
                                          role.color === 'purple' ? 'linear-gradient(to right, rgb(147 51 234), rgb(126 34 206))' :
                                          'linear-gradient(to right, rgb(239 68 68), rgb(220 38 38))'
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Access Portal
                        <motion.svg
                          className="ml-2 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how our advanced technology transforms healthcare delivery
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      

      {/* Footer */}
      <motion.footer 
        className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div 
              className="flex items-center justify-center space-x-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedEngine AI
              </span>
            </motion.div>
            <p className="text-gray-600 mb-4">
              © 2025 MedEngine AI -Predict Prevent Protect.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}