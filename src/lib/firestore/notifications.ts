// src/lib/firestore/notifications.ts
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create notification
export const createNotification = async (notificationData: any) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    userId: notificationData.userId,
    type: notificationData.type, // 'appointment_booked', 'prescription_created', 'vital_alert'
    priority: notificationData.priority, // 'low', 'medium', 'high'
    title: notificationData.title,
    message: notificationData.message,
    appointmentId: notificationData.appointmentId || null,
    prescriptionId: notificationData.prescriptionId || null,
    vitalRecordId: notificationData.vitalRecordId || null,
    patientId: notificationData.patientId || null,
    read: false,
    createdAt: new Date()
  });
  
  return docRef.id;
};

// Get user notifications
export const getUserNotifications = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
    readAt: new Date()
  });
};

// Get unread notifications count
export const getUnreadCount = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};
