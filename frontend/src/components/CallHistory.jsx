import { useEffect, useState } from "react";
import api from "../api";

export default function CallHistory() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    api.get("/calls/").then((res) => setCalls(res.data.calls || []));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Call History</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Driver</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Load #</th>
            <th className="p-2">Outcome</th>
            <th className="p-2">Transcript</th>
            <th className="p-2">Structured Data</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id} className="border-t text-sm">
              <td className="p-2">{call.driver_name}</td>
              <td className="p-2">{call.phone_number}</td>
              <td className="p-2">{call.load_number}</td>
              <td className="p-2">{call.call_outcome}</td>
              <td className="p-2">{call.transcript}</td>
              <td className="p-2">
                <pre>{JSON.stringify(call.structured_data, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
