'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { model } from '@/lib/gemini';

interface DiagnosticInfo {
  environment: {
    nodeEnv: string;
    isClient: boolean;
    isProduction: boolean;
    userAgent?: string;
  };
  firebase: {
    hasDb: boolean;
    hasAuth: boolean;
    projectId: string;
    apiKeySet: boolean;
  };
  gemini: {
    hasModel: boolean;
    apiKeySet: boolean;
    canMakeRequest: boolean;
  };
  network: {
    online: boolean;
    effectiveType?: string;
  };
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const info: DiagnosticInfo = {
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        isClient: typeof window !== 'undefined',
        isProduction: process.env.NODE_ENV === 'production',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      },
      firebase: {
        hasDb: !!db,
        hasAuth: !!auth,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',
        apiKeySet: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key'
      },
      gemini: {
        hasModel: !!model,
        apiKeySet: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY && 
                   process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'AIzaSyExample_YourGeminiApiKeyHere',
        canMakeRequest: false
      },
      network: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        effectiveType: typeof navigator !== 'undefined' && 'connection' in navigator ? 
          (navigator as any).connection?.effectiveType : undefined
      }
    };

    setDiagnostics(info);
  }, []);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Simple data processing
      const sampleData = [
        { id: 1, name: 'Test Patient', age: 65, diagnosis: 'diabetes' }
      ];

      results.tests.dataProcessing = {
        input: sampleData,
        processed: true,
        length: sampleData.length
      };

      // Test 2: Gemini API test
      if (model) {
        try {
          console.log('🧪 Testing Gemini API...');
          const { generatePrediction } = await import('@/lib/gemini');
          const prediction = await generatePrediction(sampleData);
          
          results.tests.geminiApi = {
            success: true,
            response: prediction,
            usedMockData: !process.env.NEXT_PUBLIC_GEMINI_API_KEY
          };
        } catch (error) {
          results.tests.geminiApi = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            usedMockData: true
          };
        }
      } else {
        results.tests.geminiApi = {
          success: false,
          error: 'Gemini model not initialized',
          usedMockData: true
        };
      }

      // Test 3: Firebase connectivity
      if (db) {
        try {
          results.tests.firebase = {
            success: true,
            hasDb: true,
            projectId: diagnostics?.firebase.projectId
          };
        } catch (error) {
          results.tests.firebase = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setTestResults(results);
    setLoading(false);
  };

  if (!diagnostics) {
    return <div className="p-8">Loading diagnostics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Diagnostics</h1>
        
        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Node Environment:</span>
                <span className={`font-mono ${diagnostics.environment.isProduction ? 'text-red-600' : 'text-green-600'}`}>
                  {diagnostics.environment.nodeEnv}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Client Side:</span>
                <span className={`font-mono ${diagnostics.environment.isClient ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.environment.isClient ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Online:</span>
                <span className={`font-mono ${diagnostics.network.online ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.network.online ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Firebase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className={`font-mono ${diagnostics.firebase.hasDb ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.firebase.hasDb ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auth:</span>
                <span className={`font-mono ${diagnostics.firebase.hasAuth ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.firebase.hasAuth ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Project ID:</span>
                <span className="font-mono text-blue-600">
                  {diagnostics.firebase.projectId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Key:</span>
                <span className={`font-mono ${diagnostics.firebase.apiKeySet ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.firebase.apiKeySet ? 'Configured' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gemini AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className={`font-mono ${diagnostics.gemini.hasModel ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.gemini.hasModel ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Key:</span>
                <span className={`font-mono ${diagnostics.gemini.apiKeySet ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.gemini.apiKeySet ? 'Configured' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Run Tests</h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
