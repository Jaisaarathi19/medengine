// src/hooks/useHighRiskPatientNotifications.ts
'use client';

import { useEffect, useState } from 'react';
import { subscribeToHighRiskPatients, HighRiskPatient } from '@/lib/firestore/high-risk-patients';
import { toast } from 'react-hot-toast';

interface NotificationHookOptions {
  enabled?: boolean;
  notifyNewPatients?: boolean;
  notifyStatusChanges?: boolean;
  autoMarkAsRead?: boolean;
}

export function useHighRiskPatientNotifications({
  enabled = true,
  notifyNewPatients = true,
  notifyStatusChanges = false,
  autoMarkAsRead = true
}: NotificationHookOptions = {}) {
  const [patients, setPatients] = useState<HighRiskPatient[]>([]);
  const [newPatientCount, setNewPatientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToHighRiskPatients((updatedPatients) => {
      const previousPatients = patients;
      setPatients(updatedPatients);
      setIsLoading(false);

      // Check for new patients (only after initial load)
      if (notifyNewPatients && previousPatients.length > 0) {
        const newPatients = updatedPatients.filter(patient => 
          patient.alertStatus === 'New' && 
          !previousPatients.some(prev => prev.id === patient.id)
        );

        newPatients.forEach(patient => {
          toast.error(
            `🚨 New High-Risk Patient: ${patient.name}`,
            {
              duration: 8000,
              position: 'top-right',
              style: {
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B'
              }
            }
          );
        });

        if (newPatients.length > 0) {
          setNewPatientCount(prev => prev + newPatients.length);
        }
      }

      // Check for status changes
      if (notifyStatusChanges && previousPatients.length > 0) {
        updatedPatients.forEach(patient => {
          const previousPatient = previousPatients.find(prev => prev.id === patient.id);
          if (previousPatient && previousPatient.alertStatus !== patient.alertStatus) {
            if (patient.alertStatus === 'Resolved') {
              toast.success(`✅ ${patient.name} status updated to Resolved`);
            } else if (patient.alertStatus === 'InProgress') {
              toast.success(`📋 ${patient.name} is now being monitored`);
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [enabled, notifyNewPatients, notifyStatusChanges, patients]);

  const markNotificationsAsRead = () => {
    setNewPatientCount(0);
  };

  const getHighRiskCount = () => {
    return patients.filter(p => p.riskLevel === 'High' && p.alertStatus === 'New').length;
  };

  const getCriticalCount = () => {
    return patients.filter(p => p.priority === 'Critical' && p.alertStatus === 'New').length;
  };

  return {
    patients,
    newPatientCount,
    isLoading,
    highRiskCount: getHighRiskCount(),
    criticalCount: getCriticalCount(),
    markNotificationsAsRead
  };
}
