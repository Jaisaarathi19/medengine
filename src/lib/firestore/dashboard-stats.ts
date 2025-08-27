// src/lib/firestore/dashboard-stats.ts
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DashboardStats {
  totalPatients: number;
  totalPatientsChange: string;
  todayAppointments: number;
  appointmentsChange: string;
  highRiskPatients: number;
  highRiskChange: string;
  averageRecovery: number;
  recoveryChange: string;
}

// Get total patients count
export async function getTotalPatientsStats(): Promise<{count: number, change: string}> {
  try {
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    const totalCount = snapshot.size;

    // Calculate weekly change (patients created in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentPatientsQuery = query(
      patientsRef,
      where('createdAt', '>=', Timestamp.fromDate(weekAgo))
    );
    const recentSnapshot = await getDocs(recentPatientsQuery);
    const weeklyAdditions = recentSnapshot.size;

    return {
      count: totalCount,
      change: weeklyAdditions > 0 ? `+${weeklyAdditions} this week` : 'No new patients'
    };
  } catch (error) {
    console.error('Error getting total patients stats:', error);
    return { count: 0, change: 'Error loading data' };
  }
}

// Get today's appointments
export async function getTodayAppointmentsStats(): Promise<{count: number, change: string}> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const appointmentsRef = collection(db, 'appointments');
    const todayQuery = query(
      appointmentsRef,
      where('appointment.date', '==', today)
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todayCount = todaySnapshot.size;

    // Count upcoming appointments (not yet completed)
    const upcomingCount = todaySnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return status === 'scheduled' || status === 'confirmed';
    }).length;

    return {
      count: todayCount,
      change: upcomingCount > 0 ? `${upcomingCount} upcoming` : 'All completed'
    };
  } catch (error) {
    console.error('Error getting today appointments stats:', error);
    return { count: 0, change: 'Error loading data' };
  }
}

// Get high-risk patients stats (only High risk, not Medium)
export async function getHighRiskOnlyStats(): Promise<{count: number, change: string}> {
  try {
    const highRiskRef = collection(db, 'highRiskPatients');
    const highRiskQuery = query(
      highRiskRef,
      where('isActive', '==', true),
      where('riskLevel', '==', 'High') // Only High risk, not Medium
    );
    const snapshot = await getDocs(highRiskQuery);
    const highRiskCount = snapshot.size;

    // Count new alerts
    const newAlertsCount = snapshot.docs.filter(doc => {
      const status = doc.data().alertStatus;
      return status === 'New';
    }).length;

    // Count critical priority
    const criticalCount = snapshot.docs.filter(doc => {
      const priority = doc.data().priority;
      return priority === 'Critical';
    }).length;

    return {
      count: highRiskCount,
      change: newAlertsCount > 0 
        ? `${newAlertsCount} new alerts` 
        : criticalCount > 0 
          ? `${criticalCount} critical level`
          : 'All stable'
    };
  } catch (error) {
    console.error('Error getting high-risk stats:', error);
    return { count: 0, change: 'Error loading data' };
  }
}

// Get recovery rate stats (based on resolved high-risk patients)
export async function getRecoveryStats(): Promise<{rate: number, change: string}> {
  try {
    const highRiskRef = collection(db, 'highRiskPatients');
    
    // Get all high-risk patients from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuery = query(
      highRiskRef,
      where('uploadedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const recentSnapshot = await getDocs(recentQuery);
    const totalRecent = recentSnapshot.size;

    if (totalRecent === 0) {
      return { rate: 0, change: 'No recent data' };
    }

    // Count resolved cases
    const resolvedCount = recentSnapshot.docs.filter(doc => {
      const status = doc.data().alertStatus;
      return status === 'Resolved';
    }).length;

    const recoveryRate = Math.round((resolvedCount / totalRecent) * 100);

    // Calculate change from previous 30 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousQuery = query(
      highRiskRef,
      where('uploadedAt', '>=', Timestamp.fromDate(sixtyDaysAgo)),
      where('uploadedAt', '<', Timestamp.fromDate(thirtyDaysAgo))
    );
    const previousSnapshot = await getDocs(previousQuery);
    const totalPrevious = previousSnapshot.size;

    let change = 'New metric';
    if (totalPrevious > 0) {
      const previousResolved = previousSnapshot.docs.filter(doc => {
        const status = doc.data().alertStatus;
        return status === 'Resolved';
      }).length;
      
      const previousRate = Math.round((previousResolved / totalPrevious) * 100);
      const rateDiff = recoveryRate - previousRate;
      
      if (rateDiff > 0) {
        change = `+${rateDiff}% this month`;
      } else if (rateDiff < 0) {
        change = `${rateDiff}% this month`;
      } else {
        change = 'No change';
      }
    }

    return {
      rate: recoveryRate,
      change: change
    };
  } catch (error) {
    console.error('Error getting recovery stats:', error);
    return { rate: 0, change: 'Error loading data' };
  }
}

// Get all dashboard stats at once
export async function getAllDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      totalPatientsStats,
      appointmentsStats,
      highRiskStats,
      recoveryStats
    ] = await Promise.all([
      getTotalPatientsStats(),
      getTodayAppointmentsStats(),
      getHighRiskOnlyStats(),
      getRecoveryStats()
    ]);

    return {
      totalPatients: totalPatientsStats.count,
      totalPatientsChange: totalPatientsStats.change,
      todayAppointments: appointmentsStats.count,
      appointmentsChange: appointmentsStats.change,
      highRiskPatients: highRiskStats.count,
      highRiskChange: highRiskStats.change,
      averageRecovery: recoveryStats.rate,
      recoveryChange: recoveryStats.change
    };
  } catch (error) {
    console.error('Error getting all dashboard stats:', error);
    return {
      totalPatients: 0,
      totalPatientsChange: 'Error',
      todayAppointments: 0,
      appointmentsChange: 'Error',
      highRiskPatients: 0,
      highRiskChange: 'Error',
      averageRecovery: 0,
      recoveryChange: 'Error'
    };
  }
}
