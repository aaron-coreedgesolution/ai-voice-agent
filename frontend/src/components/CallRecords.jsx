import { useEffect, useState } from "react";
import api from "../api";

export default function CallRecords() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await api.get("/calls/");
        const data =
          res.data?.calls || res.data?.data || res.data || [];
        setCalls(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching call records:", err);
        setError("Failed to load call records.");
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading call records...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Call Records</h2>

      {calls.length === 0 ? (
        <p className="text-gray-600">No call records found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Driver</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Load #</th>
              <th className="p-2">Outcome</th>
              <th className="p-2">Transcript</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{call.driver_name}</td>
                <td className="p-2">{call.phone_number}</td>
                <td className="p-2">{call.load_number || "-"}</td>
                <td className="p-2">{call.call_outcome || "Pending"}</td>
                <td className="p-2 text-sm text-gray-700 max-w-md truncate">
                  {call.transcript || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
