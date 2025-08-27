'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';

export default function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState<{
    auth: string;
    firestore: string;
    config: Record<string, string | undefined>;
  }>({
    auth: 'Checking...',
    firestore: 'Checking...',
    config: {}
  });

  useEffect(() => {
    async function checkFirebaseConnection() {
      try {
        // Check Firebase config
        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
        };

        // Check Auth connection
        let authStatus = 'Not connected';
        try {
          if (auth) {
            authStatus = `✅ Connected to ${auth.app.options.projectId}`;
          }
        } catch (error) {
          authStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        // Check Firestore connection  
        let firestoreStatus = 'Not connected';
        try {
          if (db) {
            firestoreStatus = `✅ Connected to ${db.app.options.projectId}`;
          }
        } catch (error) {
          firestoreStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        setFirebaseStatus({
          auth: authStatus,
          firestore: firestoreStatus,
          config
        });
      } catch (error) {
        console.error('Firebase connection test failed:', error);
        setFirebaseStatus({
          auth: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          firestore: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          config: {}
        });
      }
    }

    checkFirebaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔥 Firebase Configuration Test
          </h1>
          
          <div className="grid gap-6">
            {/* Environment Variables */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📝 Environment Variables
              </h2>
              <div className="grid gap-2 font-mono text-sm">
                {firebaseStatus.config && Object.entries(firebaseStatus.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-700">{key}:</span>
                    <span>{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Firebase Auth Status */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                🔐 Firebase Authentication
              </h2>
              <p className="font-mono text-sm">{firebaseStatus.auth}</p>
            </div>

            {/* Firestore Status */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                🗄️ Firestore Database
              </h2>
              <p className="font-mono text-sm">{firebaseStatus.firestore}</p>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-4">
                📋 Next Steps
              </h2>
              <ul className="text-sm space-y-2 text-yellow-800">
                <li>1. Create a Firebase project at https://console.firebase.google.com/</li>
                <li>2. Enable Authentication with Email/Password</li>
                <li>3. Create a Firestore database</li>
                <li>4. Get your config from Project Settings</li>
                <li>5. Update your .env.local file with real values</li>
                <li>6. Restart your development server</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/login?role=admin"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
