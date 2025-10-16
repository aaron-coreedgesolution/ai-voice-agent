import React, { useEffect, useState } from "react";
import api from "../api";
import Table from "./ui/Table";
import Loader from "./ui/Loader";

// Define the shape of each call record
export interface CallRecord {
  id: string;
  driver_name: string;
  phone_number: string;
  load_number?: string;
  call_outcome?: string;
  transcript?: string;
  [key: string]: any;
}

// Define the expected API response
export interface GetCallRecordsResponse {
  calls?: CallRecord[];
  data?: CallRecord[];
}

const CallRecords: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await api.get<GetCallRecordsResponse>("/calls/");
        const data = res.data?.calls || res.data?.data || [];
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

  if (loading) return <Loader message="Loading call records..." />;

  if (error)
    return (
      <div className="text-center text-red-600 py-10 bg-red-50 rounded-xl shadow-inner mx-6">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Call Records</h2>

      {calls.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl shadow-inner">
          No call records found.
        </div>
      ) : (
        <Table
          headers={["Driver", "Phone", "Load #", "Outcome", "Transcript"]}
        >
          {calls.map((call) => (
            <tr
              key={call.id}
              className="border-t hover:bg-gray-50 text-sm transition"
            >
              <td className="p-3 font-medium text-gray-800">
                {call.driver_name}
              </td>
              <td className="p-3">{call.phone_number}</td>
              <td className="p-3">{call.load_number || "-"}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    call.call_outcome === "Completed"
                      ? "bg-green-100 text-green-700"
                      : call.call_outcome === "Failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {call.call_outcome || "Pending"}
                </span>
              </td>
              <td className="p-3 text-gray-600 max-w-sm truncate">
                {call.transcript || "—"}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default CallRecords;
