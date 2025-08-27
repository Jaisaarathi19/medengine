'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading MedEngine AI...</p>
      </motion.div>
    </div>
  );
}

function UnauthorizedAccess({ userRole }: { userRole?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
          <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          {userRole 
            ? `Your role (${userRole}) does not have permission to access this page.`
            : 'You need to be logged in to access this page.'
          }
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Go to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login',
  fallback
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!user) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
        router.push(loginUrl);
        return;
      }

      // User exists but no role found - this shouldn't happen in normal flow
      if (!userRole) {
        console.error('User authenticated but no role found');
        router.push('/login');
        return;
      }

      // Check role permissions
      if (!allowedRoles.includes(userRole.role)) {
        console.warn(`Access denied for role: ${userRole.role}. Allowed roles: ${allowedRoles.join(', ')}`);
        // Don't redirect, just show unauthorized message
        return;
      }
    }
  }, [user, userRole, loading, router, allowedRoles, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // No user role found
  if (!userRole) {
    return <UnauthorizedAccess />;
  }

  // Check role permissions
  if (!allowedRoles.includes(userRole.role)) {
    return <UnauthorizedAccess userRole={userRole.role} />;
  }

  // All checks passed - render children
  return <>{children}</>;
}

// Higher-order component for easier use
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role protections for common use cases
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}

export function MedicalStaffOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>{children}</ProtectedRoute>;
}

export function DoctorOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin', 'doctor']}>{children}</ProtectedRoute>;
}

export function PatientOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['patient']}>{children}</ProtectedRoute>;
}
