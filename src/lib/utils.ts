import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely parse dates from Firestore
export function safeParseDate(date: any): Date | null {
  if (!date) return null;
  
  if (date instanceof Date) return date;
  
  // Handle Firestore Timestamp objects
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // Handle Firestore Timestamp-like objects with seconds and nanoseconds
  if (date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
  }
  
  // Handle strings and numbers
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date: Date | string | null | undefined | any): string {
  if (!date) return 'N/A';
  
  // Use safeParseDate to handle all date types including Firestore Timestamps
  const dateObj = safeParseDate(date);
  
  if (!dateObj) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatTime(date: Date | string | null | undefined | any): string {
  if (!date) return 'N/A';
  
  // Use safeParseDate to handle all date types including Firestore Timestamps
  const dateObj = safeParseDate(date);
  
  if (!dateObj) {
    return 'Invalid Time';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function getRiskLevelColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}
