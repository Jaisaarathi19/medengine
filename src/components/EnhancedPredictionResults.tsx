'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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

interface PredictionResultsProps {
  predictionResult: PredictionResult;
}

export default function EnhancedPredictionResults({ predictionResult }: PredictionResultsProps) {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          text: 'text-red-700',
          bgLight: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-yellow-600',
          text: 'text-amber-700',
          bgLight: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-500'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'text-green-700',
          bgLight: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-700',
          bgLight: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500'
        };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return ExclamationTriangleIcon;
      case 'medium':
        return ClockIcon;
      case 'low':
        return ShieldCheckIcon;
      default:
        return HeartIcon;
    }
  };

  const calculatePercentage = (count: number) => {
    return ((count / predictionResult.totalPatients) * 100).toFixed(1);
  };

  const riskData = [
    {
      level: 'High Risk',
      count: predictionResult.highRisk,
      percentage: calculatePercentage(predictionResult.highRisk),
      color: getRiskColor('high'),
      icon: ExclamationTriangleIcon,
      description: 'Require immediate attention'
    },
    {
      level: 'Medium Risk',
      count: predictionResult.mediumRisk,
      percentage: calculatePercentage(predictionResult.mediumRisk),
      color: getRiskColor('medium'),
      icon: ClockIcon,
      description: 'Need regular monitoring'
    },
    {
      level: 'Low Risk',
      count: predictionResult.lowRisk,
      percentage: calculatePercentage(predictionResult.lowRisk),
      color: getRiskColor('low'),
      icon: ShieldCheckIcon,
      description: 'Stable condition'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-xl"
        >
          <SparklesIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Prediction Results</h2>
        <p className="text-gray-600">Advanced machine learning analysis of patient risk factors</p>
      </div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white to-red-50/30 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Analysis Overview</h3>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <ArrowTrendingUpIcon className="h-5 w-5" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{predictionResult.totalPatients}</div>
            <div className="text-sm text-blue-600">Total Patients</div>
          </div>
          {riskData.map((risk, index) => {
            const IconComponent = risk.icon;
            return (
              <motion.div
                key={risk.level}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`text-center p-4 ${risk.color.bgLight} rounded-xl border ${risk.color.border}`}
              >
                <IconComponent className={`h-8 w-8 ${risk.color.icon} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${risk.color.text}`}>{risk.count}</div>
                <div className={`text-sm ${risk.color.text} font-medium`}>{risk.percentage}%</div>
                <div className="text-xs text-gray-600 mt-1">{risk.level}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Risk Distribution Visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-white to-red-50/30 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-red-500" />
          Risk Distribution
        </h3>

        {/* Visual Bar Chart */}
        <div className="space-y-4">
          {riskData.map((risk, index) => {
            const IconComponent = risk.icon;
            return (
              <motion.div
                key={risk.level}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${risk.color.icon}`} />
                    <span className="font-semibold text-gray-900">{risk.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${risk.color.text}`}>{risk.count}</span>
                    <span className="text-gray-500">({risk.percentage}%)</span>
                  </div>
                </div>
                
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${risk.color.bg} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.percentage}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-sm text-gray-600">{risk.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      
    </motion.div>
  );
}
