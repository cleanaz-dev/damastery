// components/AdminTimeBlocker.tsx
"use client";

import { useState } from "react";
import { addAdminBlock } from "@/app/(auth)/admin/schedule/actions";

export default function AdminTimeBlocker({ resourceId }: { resourceId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const localStart = (form.elements.namedItem("startsAtLocal") as HTMLInputElement).value;
    const localEnd = (form.elements.namedItem("endsAtLocal") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const note = (form.elements.namedItem("note") as HTMLInputElement).value;

    if (!localStart || !localEnd) {
      setMessage({ type: "error", text: "Please select both start and end times." });
      setLoading(false);
      return;
    }

    // Convert local HTML Datetime inputs to standard strict ISO-8601 Strings for Hapio API
    const formData = new FormData();
    formData.append("resourceId", resourceId);
    formData.append("startsAt", new Date(localStart).toISOString());
    formData.append("endsAt", new Date(localEnd).toISOString());
    formData.append("category", category);
    formData.append("note", note);

    const response = await addAdminBlock(formData);
    
    if (response.success) {
      setMessage({ type: "success", text: "Time blocked successfully!" });
      form.reset();
      // Optionally trigger a router.refresh() here to update your calendar view
    } else {
      setMessage({ type: "error", text: response.error || "Failed to block time." });
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white border shadow-sm rounded-xl p-6 max-w-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Block Out Admin Time</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input 
            type="datetime-local" 
            name="startsAtLocal" 
            required 
            className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input 
            type="datetime-local" 
            name="endsAtLocal" 
            required 
            className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            name="category" 
            required 
            className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="work">Work Block / Busy</option>
            <option value="meeting">Meeting</option>
            <option value="personal">Personal Time</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (Optional)</label>
          <input 
            type="text" 
            name="note" 
            placeholder="e.g. Out for lunch, Doctor appt..."
            className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Blocking Time..." : "Block Time"}
        </button>
      </form>
    </div>
  );
}