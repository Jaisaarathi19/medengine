// src/lib/firestore/users.ts
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create user document
export const createUser = async (userId: string, userData: any) => {
  await setDoc(doc(db, 'users', userId), {
    uid: userId,
    email: userData.email,
    role: userData.role || 'patient',
    profile: {
      name: userData.name,
      phone: userData.phone,
      specialization: userData.specialization // for medical staff
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Get user by ID
export const getUser = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
