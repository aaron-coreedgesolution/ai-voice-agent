import React, { useEffect, useState } from "react";
import api from "../api";
import Table from "./ui/Table";
import Loader from "./ui/Loader";

export interface CallRecord {
  id: string;
  driver_name: string;
  phone_number: string;
  load_number: string;
  call_outcome: string;
  transcript: string;
  structured_data: Record<string, any>;
}

export interface GetCallRecordsResponse {
  calls: CallRecord[];
}

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await api.get<GetCallRecordsResponse>("/calls/");
        setCalls(res.data.calls || []);
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  if (loading) return <Loader message="Loading call history..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📞 Call History</h2>

      {calls.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl shadow-inner">
          No call records found.
        </div>
      ) : (
        <Table
          headers={[
            "Driver",
            "Phone",
            "Load #",
            "Outcome",
            "Transcript",
            "Structured Data",
          ]}
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
              <td className="p-3">{call.call_outcome || "Pending"}</td>
              <td className="p-3 text-gray-600 max-w-sm truncate">
                {call.transcript || "—"}
              </td>
              <td className="p-3 font-mono text-xs bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(call.structured_data, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default CallHistory;
