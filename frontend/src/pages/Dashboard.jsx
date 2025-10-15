import { useEffect, useState } from "react";
import api from "../api";
import { createAgent } from "../api/agentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RetellWebClient } from "retell-client-js-sdk";
// legacy styles removed; using global App.css classes

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCall, setExpandedCall] = useState(null);
  const [startingCall, setStartingCall] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // Track active call
  const [retellClient, setRetellClient] = useState(null); // Store client instance
  const [expandedCallId, setExpandedCallId] = useState(null);
  
  // Edit functionality removed

  // Scenario agent creation removed

  // Manual test call form
  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loadNumber, setLoadNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Custom agent creation moved to dedicated page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, callsRes] = await Promise.all([
          api.get("/agents/"),
          api.get("/calls/"),
        ]);
        setAgents(agentsRes.data?.data || []);
        setCalls(callsRes.data?.calls || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Inline styles aligned with CallRecords.jsx aesthetic
  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '3rem', padding: '3rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '24px', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' },
    headerPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.3 },
    title: { fontSize: '3rem', fontWeight: 900, margin: '0 0 1rem 0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 },
    subtitle: { fontSize: '1.2rem', opacity: 0.95, fontWeight: 300, position: 'relative', zIndex: 1 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' },
    card: { background: '#ffffff', borderRadius: '20px', padding: '2rem', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '3px solid #f7fafc' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' },
    input: { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', background: '#ffffff' },
    select: { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', background: '#ffffff' },
    primaryBtn: { padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
    secondaryBtn: { padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
    tableWrap: { background: '#ffffff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' },
    tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }
  };

  // --- End Active Call ---
  const handleEndCall = async () => {
    if (!retellClient) {
      setActiveCall(null);
      return;
    }
    try {
      if (typeof retellClient.endCall === 'function') {
        await retellClient.endCall();
      } else if (typeof retellClient.hangUp === 'function') {
        await retellClient.hangUp();
      } else if (typeof retellClient.stopCall === 'function') {
        await retellClient.stopCall();
      } else if (typeof retellClient.disconnect === 'function') {
        await retellClient.disconnect();
      }
      toast.info("Call ended by user");
    } catch (err) {
      console.error("Error ending call:", err);
      toast.error("Failed to end call");
    } finally {
      try {
        if (typeof retellClient.removeAllListeners === 'function') {
          retellClient.removeAllListeners();
        }
      } catch {}
      setActiveCall(null);
      setRetellClient(null);
      // Ensure records refresh shortly after end
      setTimeout(() => {
        refreshCallRecords();
      }, 500);
    }
  };

  // Custom agent creation handled on /agents/create

  // Scenario creation removed

  // --- Start Manual Call ---
  const handleStartTestCall = async (e) => {
    e.preventDefault();
    setStartingCall(true);

    try {
      const res = await api.post("/calls/start", {
        driver_name: driverName,
        phone_number: phoneNumber,
        load_number: loadNumber,
        agent_id: selectedAgentId || null,
      });

      if (res.data.status === "success" && res.data.access_token) {
        toast.success("Call initiated successfully!");

        // Use Retell Web SDK to start the call
        const retellWebClient = new RetellWebClient();
        setRetellClient(retellWebClient);
        
        // Set up event listeners
        retellWebClient.on('call_started', () => {
          toast.success("Call started - speak now!");
          setActiveCall({
            driver_name: driverName,
            load_number: loadNumber,
            phone_number: phoneNumber
          });
        });
        
        retellWebClient.on('call_ended', () => {
          toast.info("Call ended");
          setActiveCall(null);
          setRetellClient(null);
          // Refresh call records
          refreshCallRecords();
        });
        
        retellWebClient.on('error', (error) => {
          console.error('Retell call error:', error);
          toast.error(`Call error: ${error.message}`);
          setActiveCall(null);
          setRetellClient(null);
        });
        
        // Start the call using the access token
        await retellWebClient.startCall({
          accessToken: res.data.access_token
        });

        setDriverName("");
        setPhoneNumber("");
        setLoadNumber("");
      } else {
        throw new Error(res.data.error || "Failed to create web call");
      }

    } catch (err) {
      console.error("Start test call error:", err);
      toast.error("Failed to start call.");
    } finally {
      setStartingCall(false);
    }
  };

  const handleStartWebCall = async (agentId) => {
    setStartingCall(true);
    try {
      const res = await api.post("/calls/start", {
        driver_name: "Mike",
        load_number: "7891-B",
        agent_id: agentId,
      });

      if (res.data.status === "success" && res.data.access_token) {
        // Use Retell Web SDK to start the call
        const retellWebClient = new RetellWebClient();
        setRetellClient(retellWebClient);
        
        // Set up event listeners
        retellWebClient.on('call_started', () => {
          toast.success("Web call started - speak now!");
          setActiveCall({
            driver_name: "Mike",
            load_number: "7891-B",
            phone_number: "WEB_CALL",
            agent_id: agentId
          });
        });
        
        retellWebClient.on('call_ended', () => {
          toast.info("Web call ended");
          setActiveCall(null);
          setRetellClient(null);
          refreshCallRecords();
        });
        
        retellWebClient.on('error', (error) => {
          console.error('Retell call error:', error);
          toast.error(`Call error: ${error.message}`);
          setActiveCall(null);
          setRetellClient(null);
        });
        
        // Start the call using the access token
        await retellWebClient.startCall({
          accessToken: res.data.access_token
        });
      } else {
        throw new Error(res.data.error || "Failed to create web call");
      }
    } catch (err) {
      console.error("Failed to start web call:", err);
      toast.error("Could not start web call.");
    } finally {
      setStartingCall(false);
    }
  };

  // --- Refresh Call Records ---
  const refreshCallRecords = async () => {
    try {
      const callsRes = await api.get("/calls/");
      setCalls(callsRes.data?.calls || []);
    } catch (err) {
      console.error("Failed to refresh call records:", err);
    }
  };

  // Edit functionality removed

  if (loading)
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.3rem', color: '#667eea', fontWeight: 500 }}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
          Loading dashboard...
        </div>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.3rem', color: '#f56565', fontWeight: 500 }}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>❌</div>
          {error}
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <h1 style={styles.title}>🎯 AI Voice Agent Dashboard</h1>
          <p style={styles.subtitle}>Configure agents, run test calls, and review results</p>
        </div>

      {/* Active Call Status */}
      {activeCall && (
        <div style={{ background: 'linear-gradient(135deg, rgba(72,187,120,0.2), rgba(56,161,105,0.2))', border: '2px solid rgba(72,187,120,0.3)', borderRadius: 16, padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#48bb78', display: 'inline-block' }} />
              <div>
                <h3 style={{ color: '#22543d', fontWeight: 700, margin: 0 }}>📞 Active Call</h3>
                <p style={{ color: '#22543d', fontSize: 14, margin: 0 }}>{activeCall.driver_name} • Load {activeCall.load_number}</p>
              </div>
            </div>
            <button onClick={handleEndCall} style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' }}>End Call</button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📞 Manual Test Call</h2>
          <form onSubmit={handleStartTestCall}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Agent (Required)</label>
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} required style={styles.select}>
                <option value="" disabled>Select an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.settings?.scenario_type ? `(${agent.settings.scenario_type === 'dispatch_checkin' ? 'Dispatch Check-in' : 'Emergency Protocol'})` : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Driver Name</label>
              <input type="text" placeholder="Enter driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input type="text" placeholder="Enter phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Load Number</label>
              <input type="text" placeholder="Enter load number" value={loadNumber} onChange={(e) => setLoadNumber(e.target.value)} required style={styles.input} />
            </div>
            <button type="submit" disabled={startingCall || activeCall || !selectedAgentId} style={{ ...styles.secondaryBtn, width: '100%' }}>
              {startingCall ? 'Starting...' : activeCall ? 'Call in Progress' : '🚀 Start Test Call'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Calls - redesigned list, sorted latest first */}
      <div style={styles.tableWrap}>
        <div style={styles.tableHeader}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#2d3748' }}>Recent Calls</h2>
          <button onClick={refreshCallRecords} style={styles.secondaryBtn}>Refresh</button>
        </div>
        {calls.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No calls yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {[...calls]
              .sort((a, b) => {
                const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bd - ad;
              })
              .map((call) => {
                const outcome = call.call_outcome || 'Pending';
                const badgeStyle = outcome === 'Completed' || outcome === 'In-Transit Update' || outcome === 'Arrival Confirmation'
                  ? { background: '#dcfce7', color: '#166534' }
                  : outcome === 'Emergency Escalation'
                  ? { background: '#fee2e2', color: '#991b1b' }
                  : outcome === 'Pending'
                  ? { background: '#fef9c3', color: '#854d0e' }
                  : { background: '#e2e8f0', color: '#334155' };
                const created = call.created_at ? new Date(call.created_at).toLocaleString() : '';
                const transcriptPreview = (call.transcript || '').slice(0, 160);
                return (
                  <div key={call.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{call.driver_name || 'Unknown Driver'}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>{call.phone_number || 'Unknown'} • Load {call.load_number || 'N/A'}</div>
                        {created && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{created}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...badgeStyle, padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{outcome}</span>
                        <button onClick={() => setExpandedCallId(expandedCallId === call.id ? null : call.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: 700 }} aria-label="Toggle details">
                          {expandedCallId === call.id ? '▾' : '▸'}
                        </button>
                      </div>
                    </div>
                    {transcriptPreview && (
                      <div style={{ color: '#334155', fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px' }}>
                        {transcriptPreview}{(call.transcript || '').length > 160 ? '…' : ''}
                      </div>
                    )}
                    {call.structured_data && (
                      <div style={{ marginTop: '8px', color: '#64748b', fontSize: 12 }}>
                        retell_call_id: {call.structured_data.retell_call_id || '—'}
                      </div>
                    )}
                    {expandedCallId === call.id && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {call.structured_data?.recording_url && (
                            <a href={call.structured_data.recording_url} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#3730a3', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Recording</a>
                          )}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Transcript</div>
                          <div style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, color: '#334155', fontSize: 14 }}>
                            {call.transcript || 'No transcript available.'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Structured Data</div>
                          <div style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, overflowX: 'auto' }}>
                            <pre style={{ margin: 0 }}>{JSON.stringify(call.structured_data || {}, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
