import { useEffect, useState } from "react";
import api from "../api";

export default function AgentConfigs() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await api.get("/agents/");
        // Handle flexible response shape
        const data =
          res.data?.data || res.data?.agents || res.data || [];
        setConfigs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching agent configs:", err);
        setError("Failed to load agent configurations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading agent configurations...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Agent Configurations</h2>

      {configs.length === 0 ? (
        <p className="text-gray-600">No agent configurations found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Prompt</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{cfg.name}</td>
                <td className="p-2">{cfg.description}</td>
                <td className="p-2 text-gray-700 text-sm max-w-md truncate">
                  {cfg.prompt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
