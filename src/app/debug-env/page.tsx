'use client';

import { useEffect, useState } from 'react';

interface EnvDebugInfo {
  firebaseApiKey: string;
  firebaseProjectId: string;
  geminiApiKey: string;
  environment: string;
  isClient: boolean;
}

export default function EnvDebugPage() {
  const [envInfo, setEnvInfo] = useState<EnvDebugInfo | null>(null);

  useEffect(() => {
    const info: EnvDebugInfo = {
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
        `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...` : 'NOT_SET',
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 
        `${process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10)}...` : 'NOT_SET',
      environment: process.env.NODE_ENV || 'unknown',
      isClient: typeof window !== 'undefined'
    };
    
    setEnvInfo(info);
    console.log('🔍 Environment Debug Info:', info);
  }, []);

  if (!envInfo) {
    return <div className="p-8">Loading environment info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Environment Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
              <span className="font-medium">Firebase API Key:</span>
              <span className={`font-mono ${envInfo.firebaseApiKey === 'NOT_SET' ? 'text-red-600' : 'text-green-600'}`}>
                {envInfo.firebaseApiKey}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
              <span className="font-medium">Firebase Project ID:</span>
              <span className={`font-mono ${envInfo.firebaseProjectId === 'NOT_SET' ? 'text-red-600' : 'text-green-600'}`}>
                {envInfo.firebaseProjectId}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
              <span className="font-medium">Gemini API Key:</span>
              <span className={`font-mono ${envInfo.geminiApiKey === 'NOT_SET' ? 'text-red-600' : 'text-green-600'}`}>
                {envInfo.geminiApiKey}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
              <span className="font-medium">Environment:</span>
              <span className="font-mono text-blue-600">{envInfo.environment}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded">
              <span className="font-medium">Client Side:</span>
              <span className={`font-mono ${envInfo.isClient ? 'text-green-600' : 'text-red-600'}`}>
                {envInfo.isClient ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> This page shows your environment configuration. 
                If values show "NOT_SET", you need to configure environment variables 
                in your deployment platform (Vercel, Firebase, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
