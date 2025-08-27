// src/components/HighRiskPatientsWithFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import HighRiskPatientsPanel from './HighRiskPatientsPanel';
import HighRiskPatientFilters from './HighRiskPatientFilters';
import { subscribeToHighRiskPatients, HighRiskPatient } from '@/lib/firestore/high-risk-patients';

interface FilterState {
  riskLevel: 'All' | 'High' | 'Medium';
  alertStatus: 'All' | 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
}

interface HighRiskPatientsWithFiltersProps {
  maxDisplay?: number;
  showFilters?: boolean;
}

export default function HighRiskPatientsWithFilters({ 
  maxDisplay = 8,
  showFilters = true
}: HighRiskPatientsWithFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    riskLevel: 'All',
    alertStatus: 'All'
  });
  
  const [allPatients, setAllPatients] = useState<HighRiskPatient[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to all patients for counting
  useEffect(() => {
    const unsubscribe = subscribeToHighRiskPatients((patients) => {
      setAllPatients(patients);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Calculate patient counts for filter display
  const patientCounts = {
    total: allPatients.length,
    high: allPatients.filter(p => p.riskLevel === 'High').length,
    medium: allPatients.filter(p => p.riskLevel === 'Medium').length,
    newAlerts: allPatients.filter(p => p.alertStatus === 'New').length,
    acknowledged: allPatients.filter(p => p.alertStatus === 'Acknowledged').length,
    inProgress: allPatients.filter(p => p.alertStatus === 'InProgress').length,
    resolved: allPatients.filter(p => p.alertStatus === 'Resolved').length,
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <HighRiskPatientFilters
          filters={filters}
          onFilterChange={setFilters}
          patientCounts={patientCounts}
        />
      )}
      
      <HighRiskPatientsPanel
        maxDisplay={maxDisplay}
        riskLevelFilter={filters.riskLevel}
        alertStatusFilter={filters.alertStatus}
      />
    </div>
  );
}
