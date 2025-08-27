import { db, auth } from './firebase';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * Get database instance with null check
 * Throws error if database is not initialized
 */
export function getDb(): Firestore {
  if (!db) {
    throw new Error('Database not initialized. Please check your Firebase configuration.');
  }
  return db;
}

/**
 * Get auth instance with null check
 * Throws error if auth is not initialized
 */
export function getAuth(): Auth {
  if (!auth) {
    throw new Error('Auth not initialized. Please check your Firebase configuration.');
  }
  return auth;
}

/**
 * Check if database is available
 */
export function isDbAvailable(): boolean {
  return db !== null;
}

/**
 * Check if auth is available
 */
export function isAuthAvailable(): boolean {
  return auth !== null;
}
