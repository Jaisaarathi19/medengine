// src/hooks/useHighRiskPatientFilters.ts
'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeToHighRiskPatients, HighRiskPatient } from '@/lib/firestore/high-risk-patients';

interface FilterState {
  riskLevel: 'All' | 'High' | 'Medium';
  alertStatus: 'All' | 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
}

interface PatientCounts {
  total: number;
  high: number;
  medium: number;
  newAlerts: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
}

export function useHighRiskPatientFilters(maxDisplay: number = 50) {
  const [filters, setFilters] = useState<FilterState>({
    riskLevel: 'All',
    alertStatus: 'All'
  });
  const [allPatients, setAllPatients] = useState<HighRiskPatient[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToHighRiskPatients((patients) => {
      setAllPatients(patients);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Calculate patient counts
  const patientCounts: PatientCounts = useMemo(() => {
    const counts = {
      total: allPatients.length,
      high: allPatients.filter(p => p.riskLevel === 'High').length,
      medium: allPatients.filter(p => p.riskLevel === 'Medium').length,
      newAlerts: allPatients.filter(p => p.alertStatus === 'New').length,
      acknowledged: allPatients.filter(p => p.alertStatus === 'Acknowledged').length,
      inProgress: allPatients.filter(p => p.alertStatus === 'InProgress').length,
      resolved: allPatients.filter(p => p.alertStatus === 'Resolved').length,
    };
    return counts;
  }, [allPatients]);

  // Filter patients based on current filters
  const filteredPatients = useMemo(() => {
    let filtered = [...allPatients];

    // Apply risk level filter
    if (filters.riskLevel !== 'All') {
      filtered = filtered.filter(p => p.riskLevel === filters.riskLevel);
    }

    // Apply alert status filter
    if (filters.alertStatus !== 'All') {
      filtered = filtered.filter(p => p.alertStatus === filters.alertStatus);
    }

    // Return limited results
    return filtered.slice(0, maxDisplay);
  }, [allPatients, filters, maxDisplay]);

  return {
    filters,
    setFilters,
    filteredPatients,
    patientCounts,
    loading,
    hasActiveFilters: filters.riskLevel !== 'All' || filters.alertStatus !== 'All'
  };
}
