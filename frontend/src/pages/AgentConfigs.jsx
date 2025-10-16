import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AgentConfigs() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const navigate = useNavigate();

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
    return <p style={{ padding: '1.5rem', color: '#4b5563' }}>Loading agent configurations...</p>;
  }

  if (error) {
    return <p style={{ padding: '1.5rem', color: '#ef4444' }}>{error}</p>;
  }

  const handleStartCall = async (agentId) => {
    setStartingId(agentId);
    try {
      await api.post("/calls/start", {
        driver_name: "Mike",
        load_number: "TEST-LOAD",
        agent_id: agentId,
      });
    } catch (e) {
      // no-op UI, Dashboard handles call flow; this triggers backend validation
    } finally {
      setStartingId(null);
    }
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '3rem', padding: '3rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '24px', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' },
    headerPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.3 },
    title: { fontSize: '3rem', fontWeight: 900, margin: '0 0 1rem 0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 },
    subtitle: { fontSize: '1.2rem', opacity: 0.95, fontWeight: 300, position: 'relative', zIndex: 1 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
    card: { background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' },
    cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9' },
    badge: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
    actionBtn: { padding: '0.875rem', background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <h1 style={styles.title}>🤖 Agents</h1>
          <p style={styles.subtitle}>Create and manage your custom agents</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate("/agents/create")} style={{ padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>+ Create Agent</button>
        </div>

        {configs.length === 0 ? (
          <p style={{ color: '#475569' }}>No agents configured yet.</p>
        ) : (
          <div style={styles.grid}>
            {configs.map((agent) => {
              const scenarioType = agent.settings?.scenario_type;
              const isScenarioAgent = !!scenarioType;
              return (
                <div key={agent.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontWeight: 700, color: '#2d3748' }}>{agent.name}</h3>
                    {isScenarioAgent && <span style={styles.badge}>SCENARIO</span>}
                  </div>
                  <p style={{ color: '#718096', margin: 0 }}>{agent.description}</p>
                  <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Type: {isScenarioAgent ? (scenarioType === 'dispatch_checkin' ? 'Dispatch Check-in' : 'Emergency Protocol') : 'Custom'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.75rem' }}>
                    <button onClick={() => handleStartCall(agent.id)} disabled={startingId === agent.id} style={styles.actionBtn}>
                      {startingId === agent.id ? 'Starting...' : 'Start Call'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
