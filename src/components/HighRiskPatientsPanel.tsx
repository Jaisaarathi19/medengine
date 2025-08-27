// src/components/HighRiskPatientsPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  HeartIcon,
  CheckCircleIcon,
  EyeIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  getHighRiskPatients, 
  updatePatientAlertStatus, 
  subscribeToHighRiskPatients,
  HighRiskPatient,
  getHighRiskPatientStats
} from '@/lib/firestore/high-risk-patients';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface HighRiskPatientsPanelProps {
  showOnlyHigh?: boolean;
  maxDisplay?: number;
  riskLevelFilter?: 'All' | 'High' | 'Medium';
  alertStatusFilter?: 'All' | 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
  onFilterChange?: (filters: {
    riskLevel: 'All' | 'High' | 'Medium';
    alertStatus: 'All' | 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
  }) => void;
}

export default function HighRiskPatientsPanel({ 
  showOnlyHigh = false, 
  maxDisplay = 10,
  riskLevelFilter = 'All',
  alertStatusFilter = 'All',
  onFilterChange
}: HighRiskPatientsPanelProps) {
  const [patients, setPatients] = useState<HighRiskPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<HighRiskPatient[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    newAlerts: 0,
    acknowledged: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<HighRiskPatient | null>(null);
  const { user } = useAuth();

  // Load patients and stats
  useEffect(() => {
    loadPatients();
    loadStats();

    // Set up real-time listener
    const unsubscribe = subscribeToHighRiskPatients((updatedPatients) => {
      setPatients(updatedPatients.slice(0, maxDisplay));
      loadStats(); // Refresh stats when data changes
    }, showOnlyHigh ? 'High' : undefined);

    return () => unsubscribe();
  }, [showOnlyHigh, maxDisplay]);

  // Filter patients based on selected filters
  useEffect(() => {
    let filtered = [...patients];

    // Apply risk level filter
    if (riskLevelFilter !== 'All') {
      filtered = filtered.filter(p => p.riskLevel === riskLevelFilter);
    }

    // Apply alert status filter  
    if (alertStatusFilter !== 'All') {
      filtered = filtered.filter(p => p.alertStatus === alertStatusFilter);
    }

    // Apply showOnlyHigh filter (legacy support)
    if (showOnlyHigh) {
      filtered = filtered.filter(p => p.riskLevel === 'High');
    }

    setFilteredPatients(filtered.slice(0, maxDisplay));
  }, [patients, riskLevelFilter, alertStatusFilter, showOnlyHigh, maxDisplay]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getHighRiskPatients(
        showOnlyHigh ? 'High' : undefined,
        true // Order by priority
      );
      setPatients(data.slice(0, maxDisplay));
    } catch (error) {
      console.error('Error loading high-risk patients:', error);
      toast.error('Failed to load high-risk patients');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getHighRiskPatientStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAcknowledge = async (patient: HighRiskPatient) => {
    if (!user) return;

    try {
      await updatePatientAlertStatus(
        patient.id!,
        'Acknowledged',
        user.uid,
        'Reviewed by doctor'
      );
      toast.success(`✅ Acknowledged ${patient.name}`);
      loadPatients();
    } catch (error) {
      console.error('Error acknowledging patient:', error);
      toast.error('Failed to acknowledge patient');
    }
  };

  const handleMarkInProgress = async (patient: HighRiskPatient) => {
    if (!user) return;

    try {
      await updatePatientAlertStatus(
        patient.id!,
        'InProgress',
        user.uid,
        'Patient under active monitoring'
      );
      toast.success(`📋 ${patient.name} marked as in progress`);
      loadPatients();
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Failed to update patient status');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-red-100 text-red-800 border-red-300';
      case 'Acknowledged': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            High-Risk Patients {showOnlyHigh ? '(Critical Only)' : ''}
          </h3>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical + stats.high}</div>
            <div className="text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.newAlerts}</div>
            <div className="text-gray-600">New</div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No high-risk patients at the moment</p>
            <p className="text-gray-500 text-sm">Great news! All patients are stable.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel} Risk
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getAlertStatusColor(patient.alertStatus)}`}>
                        {patient.alertStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-3">
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>Readmission: {(patient.readmissionProbability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>Uploaded: {formatDate(patient.uploadedAt.toDate())}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {patient.riskFactors.slice(0, 3).map((factor, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 rounded-full text-blue-800"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>

                    {patient.medicalInfo && (
                      <div className="text-xs text-gray-500 mb-2">
                        {patient.medicalInfo.specialty && `Specialty: ${patient.medicalInfo.specialty}`}
                        {patient.medicalInfo.timeInHospital && ` • Hospital Stay: ${patient.medicalInfo.timeInHospital} days`}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {patient.alertStatus === 'New' && (
                      <button
                        onClick={() => handleAcknowledge(patient)}
                        className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        Acknowledge
                      </button>
                    )}
                    
                    {patient.alertStatus === 'Acknowledged' && (
                      <button
                        onClick={() => handleMarkInProgress(patient)}
                        className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                      >
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        In Progress
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Patient Details</h3>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedPatient.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRiskColor(selectedPatient.riskLevel)}`}>
                      {selectedPatient.riskLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Readmission Probability:</span>
                    <span className="ml-2 text-gray-900 font-semibold">
                      {(selectedPatient.readmissionProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Risk Factors</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.riskFactors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-blue-100 rounded-full text-blue-800"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPatient.diagnosisInfo && (
                <div>
                  <h5 className="font-semibold text-white mb-2">Diagnosis Information</h5>
                  <div className="text-sm text-white/70 space-y-1">
                    {selectedPatient.diagnosisInfo.primary && (
                      <p><span className="text-white/50">Primary:</span> {selectedPatient.diagnosisInfo.primary}</p>
                    )}
                    {selectedPatient.diagnosisInfo.secondary && (
                      <p><span className="text-white/50">Secondary:</span> {selectedPatient.diagnosisInfo.secondary}</p>
                    )}
                    {selectedPatient.diagnosisInfo.tertiary && (
                      <p><span className="text-white/50">Tertiary:</span> {selectedPatient.diagnosisInfo.tertiary}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedPatient.medicalInfo && (
                <div>
                  <h5 className="font-semibold text-white mb-2">Medical Information</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    {selectedPatient.medicalInfo.timeInHospital && (
                      <p><span className="text-white/50">Hospital Stay:</span> {selectedPatient.medicalInfo.timeInHospital} days</p>
                    )}
                    {selectedPatient.medicalInfo.medications && (
                      <p><span className="text-white/50">Medications:</span> {selectedPatient.medicalInfo.medications}</p>
                    )}
                    {selectedPatient.medicalInfo.labProcedures && (
                      <p><span className="text-white/50">Lab Procedures:</span> {selectedPatient.medicalInfo.labProcedures}</p>
                    )}
                    {selectedPatient.medicalInfo.specialty && (
                      <p><span className="text-white/50">Specialty:</span> {selectedPatient.medicalInfo.specialty}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-white/40">
                <p>Uploaded: {formatDate(selectedPatient.uploadedAt.toDate())}</p>
                <p>Last Updated: {formatDate(selectedPatient.lastUpdated.toDate())}</p>
                {selectedPatient.notes && <p>Notes: {selectedPatient.notes}</p>}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
