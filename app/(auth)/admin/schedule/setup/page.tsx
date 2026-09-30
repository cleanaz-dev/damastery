"use client";

import { useState } from "react";
import { runHapioSetup } from "./actions";


export default function HapioSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    locationId: string;
    serviceId: string;
    resourceId: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const response = await runHapioSetup(formData);
    
    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || "Something went wrong.");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hapio Initial Setup</h1>
        <p className="text-gray-600">
          Run this once to generate the base Location, Service, and Resource for your new Hapio environment.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white border shadow-sm rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input 
              name="locationName" 
              type="text" 
              defaultValue="Main Office"
              required 
              className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input 
              name="serviceName" 
              type="text" 
              defaultValue="Standard Booking"
              required 
              className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Resource Name</label>
            <input 
              name="resourceName" 
              type="text" 
              defaultValue="Admin Worker"
              required 
              className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Generating Hapio Records..." : "Run Setup"}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Setup Successful!
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">1. Update your code (lib/hapio/index.ts)</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                export const HAPIO_LOCATION_ID = "{result.locationId}";{"\n"}
                export const HAPIO_SERVICE_ID = "{result.serviceId}";
              </pre>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">2. Save to your Admin User in the Database</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                hapioResourceId: "{result.resourceId}"
              </pre>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-green-700">
            Once you've updated your code, you can safely ignore or delete this setup page!
          </p>
        </div>
      )}
    </div>
  );
}