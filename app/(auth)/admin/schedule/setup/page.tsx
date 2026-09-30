"use client";

import { useState } from "react";
import { runHapioSetup } from "../actions";
import Link from "next/link"; // <-- ADDED THIS

export default function HapioSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ locationId: string; serviceId: string; resourceId: string; } | null>(null);

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
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hapio Initial Setup</h1>
        <p className="text-gray-600">Configure your business rules and generate your environment.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white border shadow-sm rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
              <input name="locationName" type="text" defaultValue="Main Office" required className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input name="serviceName" type="text" defaultValue="Standard Booking" required className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Worker Name</label>
              <input name="resourceName" type="text" defaultValue="Admin Worker" required className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <hr className="border-gray-200" />

          <h2 className="text-lg font-bold text-gray-800">Booking Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Length</label>
              <select name="duration" defaultValue="PT1H" className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="PT15M">15 Minutes</option>
                <option value="PT30M">30 Minutes</option>
                <option value="PT45M">45 Minutes</option>
                <option value="PT1H">1 Hour</option>
                <option value="PT2H">2 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots frequency</label>
              <select name="interval" defaultValue="PT30M" className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="PT15M">Every 15 mins</option>
                <option value="PT30M">Every 30 mins</option>
                <option value="PT1H">Every Hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buffer / Clean-up Time</label>
              <select name="buffer" defaultValue="PT0M" className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="PT0M">None</option>
                <option value="PT15M">15 Minutes</option>
                <option value="PT30M">30 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Notice</label>
              <select name="advanceNotice" defaultValue="PT2H" className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="PT0H">Immediate</option>
                <option value="PT2H">2 Hours before</option>
                <option value="PT24H">24 Hours before</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Future Limit</label>
              <select name="futureLimit" defaultValue="P30D" className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500">
                <option value="P7D">7 Days out</option>
                <option value="P10D">10 Days out</option>
                <option value="P14D">14 Days out</option>
                <option value="P30D">30 Days out</option>
              </select>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
            {loading ? "Generating..." : "Run Setup"}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-green-800 mb-2">Setup Successful!</h2>
          <p className="text-green-700 mb-6 font-medium">Your Resource ID has been saved directly to your Database.</p>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Please add the remaining IDs to your .env file:</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                HAPIO_LOCATION_ID="{result.locationId}"{"\n"}
                HAPIO_SERVICE_ID="{result.serviceId}"
              </pre>
            </div>

            {/* Added link to route them back to the calendar safely */}
            <div className="mt-8 pt-4 border-t border-green-200 flex justify-end">
              <Link 
                href="/admin/schedule"
                className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Go to Schedule
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}