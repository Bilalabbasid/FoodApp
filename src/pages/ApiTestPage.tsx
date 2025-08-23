import React, { useState } from 'react';
import { api, handleApiError, handleApiSuccess } from '../utils/api';

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      test: async () => {
        const response = await fetch('http://localhost:3001/health');
        return await response.json();
      }
    },
    {
      name: 'Get Stores',
      method: 'GET',
      endpoint: '/stores',
      test: async () => {
        const response = await api.stores.getAll();
        return response.data;
      }
    },
    {
      name: 'Get Categories',
      method: 'GET',
      endpoint: '/categories',
      test: async () => {
        const response = await api.categories.getAll();
        return response.data;
      }
    },
    {
      name: 'Get Items',
      method: 'GET',
      endpoint: '/items',
      test: async () => {
        const response = await api.items.getAll();
        return response.data;
      }
    },
    {
      name: 'Test Payment Intent (Mock)',
      method: 'POST',
      endpoint: '/payments/intent',
      test: async () => {
        const response = await api.payments.createPaymentIntent(100);
        return response.data;
      }
    },
    {
      name: 'Test Maps Geocoding (Mock)',
      method: 'POST',
      endpoint: '/maps/geocode',
      test: async () => {
        const response = await api.maps.geocodeAddress('123 Main St, New York, NY');
        return response.data;
      }
    }
  ];

  const runTest = async (testItem: typeof testEndpoints[0]) => {
    setLoading(true);
    try {
      const result = await testItem.test();
      const newResult = {
        name: testItem.name,
        method: testItem.method,
        endpoint: testItem.endpoint,
        status: 'success',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      };
      setResults(prev => [newResult, ...prev]);
      handleApiSuccess(`${testItem.name} test passed!`);
    } catch (error) {
      const newResult = {
        name: testItem.name,
        method: testItem.method,
        endpoint: testItem.endpoint,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      setResults(prev => [newResult, ...prev]);
      handleApiError(error, `${testItem.name} test failed`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    for (const test of testEndpoints) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
          
          <div className="mb-6 flex gap-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Run All Tests'}
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {testEndpoints.map((test, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{test.method}</span> {test.endpoint}
                </p>
                <button
                  onClick={() => runTest(test)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run All Tests" or test individual endpoints.</p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.status === 'success' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{result.method}</span> {result.endpoint}
                    </p>
                    <div
                      className={`text-sm font-medium ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Status: {result.status.toUpperCase()}
                    </div>
                    {result.status === 'success' && result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.status === 'error' && (
                      <div className="mt-2 p-2 bg-red-100 rounded">
                        <p className="text-sm text-red-700">Error: {result.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
