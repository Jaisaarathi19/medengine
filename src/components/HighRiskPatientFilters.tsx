'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface FilterState {
  riskLevel: 'All' | 'High' | 'Medium';
  alertStatus: 'All' | 'New' | 'Acknowledged' | 'InProgress' | 'Resolved';
}

interface HighRiskPatientFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  patientCounts?: {
    total: number;
    high: number;
    medium: number;
    newAlerts: number;
    acknowledged: number;
    inProgress: number;
    resolved: number;
  };
}

export default function HighRiskPatientFilters({
  filters,
  onFilterChange,
  patientCounts
}: HighRiskPatientFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskLevelOptions = [
    { value: 'All' as const, label: 'All Risk Levels', count: patientCounts?.total || 0, color: 'text-gray-600' },
    { value: 'High' as const, label: 'High Risk', count: patientCounts?.high || 0, color: 'text-red-600' },
    { value: 'Medium' as const, label: 'Medium Risk', count: patientCounts?.medium || 0, color: 'text-orange-600' }
  ];

  const statusOptions = [
    { 
      value: 'All' as const, 
      label: 'All Statuses', 
      count: patientCounts?.total || 0, 
      icon: EyeIcon,
      color: 'text-gray-600' 
    },
    { 
      value: 'New' as const, 
      label: 'New Alerts', 
      count: patientCounts?.newAlerts || 0, 
      icon: ExclamationTriangleIcon,
      color: 'text-red-600' 
    },
    { 
      value: 'Acknowledged' as const, 
      label: 'Acknowledged', 
      count: patientCounts?.acknowledged || 0, 
      icon: CheckCircleIcon,
      color: 'text-blue-600' 
    },
    { 
      value: 'InProgress' as const, 
      label: 'In Progress', 
      count: patientCounts?.inProgress || 0, 
      icon: ClockIcon,
      color: 'text-yellow-600' 
    },
    { 
      value: 'Resolved' as const, 
      label: 'Resolved', 
      count: patientCounts?.resolved || 0, 
      icon: CheckCircleIcon,
      color: 'text-green-600' 
    }
  ];

  const handleRiskLevelChange = (value: FilterState['riskLevel']) => {
    onFilterChange({ ...filters, riskLevel: value });
  };

  const handleStatusChange = (value: FilterState['alertStatus']) => {
    onFilterChange({ ...filters, alertStatus: value });
  };

  const resetFilters = () => {
    onFilterChange({ riskLevel: 'All', alertStatus: 'All' });
  };

  const hasActiveFilters = filters.riskLevel !== 'All' || filters.alertStatus !== 'All';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filter High-Risk Patients</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {filters.riskLevel !== 'All' || filters.alertStatus !== 'All' ? 'Active' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          {/* Risk Level Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Level</h4>
            <div className="flex flex-wrap gap-2">
              {riskLevelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRiskLevelChange(option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                    filters.riskLevel === option.value
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{option.label}</span>
                    <span className={`text-xs font-semibold ${option.color}`}>
                      ({option.count})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Alert Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      filters.alertStatus === option.value
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                      <span className={`text-xs font-semibold ${option.color}`}>
                        ({option.count})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Filter Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing: <span className="font-semibold text-gray-900">
              {filters.riskLevel !== 'All' ? `${filters.riskLevel} Risk` : 'All Risk Levels'}
            </span>
            {filters.riskLevel !== 'All' && filters.alertStatus !== 'All' && ' • '}
            {filters.alertStatus !== 'All' && (
              <span className="font-semibold text-gray-900">{filters.alertStatus}</span>
            )}
          </div>
          <div className="text-gray-500">
            Total: {patientCounts?.total || 0} patients
          </div>
        </div>
      </div>
    </div>
  );
}
