import { useEffect, useState } from "react";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCall, setExpandedCall] = useState(null);
  const [startingCall, setStartingCall] = useState(false);

  // Form state for manual test call
  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loadNumber, setLoadNumber] = useState("");
  const [triggerStatus, setTriggerStatus] = useState(null);

  // Inline styles for modern design
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      margin: '0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '3rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      color: 'white',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden'
    },
    headerPattern: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      opacity: '0.3'
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: '900',
      margin: '0 0 1rem 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      position: 'relative',
      zIndex: '1'
    },
    subtitle: {
      fontSize: '1.3rem',
      opacity: '0.95',
      fontWeight: '300',
      position: 'relative',
      zIndex: '1'
    },
    section: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem',
      marginBottom: '2rem',
      boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    sectionHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
    },
    sectionTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      paddingBottom: '1rem',
      borderBottom: '3px solid #f7fafc'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
      background: 'white'
    },
    tableHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1.25rem 1rem',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '0.95rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableRow: {
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    tableRowHover: {
      background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
      transform: 'translateX(5px)'
    },
    tableCell: {
      padding: '1.25rem 1rem',
      fontSize: '0.95rem',
      color: '#4a5568'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '450px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    input: {
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      color: '#2d3748',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
      outline: 'none',
      transform: 'translateY(-2px)',
      color: '#2d3748'
    },
    button: {
      padding: '1rem 2.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    buttonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.6)'
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 20px rgba(72, 187, 120, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    },
    badge: {
      padding: '0.6rem 1.2rem',
      borderRadius: '25px',
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    badgeSuccess: {
      background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      color: 'white'
    },
    badgeError: {
      background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
      color: 'white'
    },
    badgeWarning: {
      background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
      color: 'white'
    },
    badgePending: {
      background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
      color: 'white'
    },
    expandedContent: {
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '3px solid #e2e8f0',
      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: '12px',
      padding: '1.5rem'
    },
    transcript: {
      background: '#f7fafc',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      color: '#4a5568'
    },
    jsonData: {
      background: '#1a202c',
      color: '#e2e8f0',
      padding: '1.5rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      overflow: 'auto',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      border: '1px solid #2d3748',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.3rem',
      color: '#667eea',
      fontWeight: '500'
    },
    error: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.3rem',
      color: '#f56565',
      fontWeight: '500'
    },
    icon: {
      fontSize: '1.4rem',
      marginRight: '0.75rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#a0aec0',
      fontSize: '1.1rem',
      fontStyle: 'italic'
    },
    statusMessage: {
      padding: '1rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginTop: '1rem'
    },
    statusSuccess: {
      background: 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)',
      color: '#22543d',
      border: '1px solid #48bb78'
    },
    statusError: {
      background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
      color: '#742a2a',
      border: '1px solid #f56565'
    },
    statusPending: {
      background: 'linear-gradient(135deg, #fef5e7 0%, #fbd38d 100%)',
      color: '#744210',
      border: '1px solid #ed8936'
    }
  };

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

  // --- Manual Test Call (Form) ---
  const handleStartTestCall = async (e) => {
    e.preventDefault();
    setStartingCall(true);
    setTriggerStatus("pending");
  
    try {
      const res = await api.post("/calls/start", {
        driver_name: driverName,
        phone_number: phoneNumber,
        load_number: loadNumber,
      });
  
      setTriggerStatus("success: Call initiated successfully!");
      toast.success("Call initiated successfully!");
  
      // Open the mock session URL in a new tab
      if (res.data.call.session_url) {
        window.open(res.data.call.session_url, "_blank");
      }
  
      // Refresh calls list
      const callsRes = await api.get("/calls/");
      setCalls(callsRes.data?.calls || []);

      // Clear form
      setDriverName("");
      setPhoneNumber("");
      setLoadNumber("");
    } catch (err) {
      console.error("Start test call error:", err);
      setTriggerStatus("error: Failed to start call.");
      toast.error("Failed to start call.");
    } finally {
      setStartingCall(false);
    }
  };  

  // --- Web Call Button ---
  const handleStartWebCall = async (agentId) => {
    setStartingCall(true);
    try {
      const res = await api.post("/calls/start", {
        driver_name: "Mike",
        load_number: "7891-B",
        agent_id: agentId,
      });
  
      const sessionUrl = res.data.call?.session_url;
      if (sessionUrl) {
        window.open(sessionUrl, "_blank");
        toast.success("Web call started!");
      } else {
        toast.warning("Web call started but no session URL returned.");
      }
      
      // Refresh calls list
      const callsRes = await api.get("/calls/");
      setCalls(callsRes.data?.calls || []);
    } catch (err) {
      console.error("Failed to start web call:", err);
      toast.error("Could not start web call.");
    } finally {
      setStartingCall(false);
    }
  };

  const getOutcomeBadge = (outcome) => {
    const baseStyle = styles.badge;
    let statusStyle = styles.badgePending;
    
    if (outcome === "Completed" || outcome === "Emergency Escalation" || outcome === "In-Transit Update" || outcome === "Arrival Confirmation") {
      statusStyle = styles.badgeSuccess;
    } else if (outcome === "Failed") {
      statusStyle = styles.badgeError;
    } else if (outcome === "Pending" || outcome === "In Progress") {
      statusStyle = styles.badgeWarning;
    }
    
    return (
      <span style={{...baseStyle, ...statusStyle}}>
        {outcome || "Pending"}
      </span>
    );
  };

  const getStatusMessageStyle = (status) => {
    if (status?.includes("success")) return styles.statusSuccess;
    if (status?.includes("error")) return styles.statusError;
    return styles.statusPending;
  };

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
        Loading dashboard...
      </div>
    </div>
  );
  
  if (error) return (
    <div style={styles.container}>
      <div style={styles.error}>
        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>❌</div>
        {error}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        style={{ fontSize: '14px' }}
      />
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <h1 style={styles.title}>🎯 AI Voice Agent Dashboard</h1>
          <p style={styles.subtitle}>Configure, Test & Analyze Voice Agent Calls</p>
        </div>

        {/* Agent Configurations Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>🤖</span>
            Agent Configurations
          </h2>
          {agents.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
              No agents configured yet.
            </div>
          ) : (
            <div style={{overflow: 'auto', borderRadius: '16px'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Description</th>
                    <th style={styles.tableHeader}>Prompt</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr 
                      key={agent.id} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.target.closest('tr').style.background = 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)'}
                      onMouseLeave={(e) => e.target.closest('tr').style.background = 'white'}
                    >
                      <td style={{...styles.tableCell, fontWeight: '600'}}>{agent.name}</td>
                      <td style={styles.tableCell}>{agent.description}</td>
                      <td style={{...styles.tableCell, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {agent.prompt}
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          disabled={startingCall}
                          onClick={() => handleStartWebCall(agent.id)}
                          style={{
                            ...styles.secondaryButton,
                            ...(startingCall ? styles.buttonDisabled : {})
                          }}
                          onMouseEnter={(e) => !startingCall && (e.target.style.transform = 'translateY(-2px)')}
                          onMouseLeave={(e) => !startingCall && (e.target.style.transform = 'translateY(0)')}
                        >
                          {startingCall ? "Starting..." : "🚀 Start Web Call"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Test Call Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>📞</span>
            Start Manual Test Call
          </h2>
          <form onSubmit={handleStartTestCall} style={styles.form}>
            <input
              type="text"
              placeholder="Driver Name (e.g., Mike Johnson)"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
            <input
              type="text"
              placeholder="Phone Number (e.g., +1234567890)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
            <input
              type="text"
              placeholder="Load Number (e.g., 7891-B)"
              value={loadNumber}
              onChange={(e) => setLoadNumber(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
            <button
              type="submit"
              disabled={startingCall}
              style={{
                ...styles.button,
                ...(startingCall ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => !startingCall && Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => !startingCall && Object.assign(e.target.style, styles.button)}
            >
              {startingCall ? "⏳ Starting..." : "🚀 Start Test Call"}
            </button>
          </form>
          {triggerStatus && (
            <div style={{...styles.statusMessage, ...getStatusMessageStyle(triggerStatus)}}>
              {triggerStatus}
            </div>
          )}
        </div>

        {/* Recent Calls Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>📊</span>
            Recent Call Records
          </h2>
          {calls.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
              No call records yet. Start a test call to see results here!
            </div>
          ) : (
            <div style={{overflow: 'auto', borderRadius: '16px'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Driver</th>
                    <th style={styles.tableHeader}>Phone</th>
                    <th style={styles.tableHeader}>Load</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <>
                      <tr
                        key={call.id}
                        style={styles.tableRow}
                        onMouseEnter={(e) => e.target.closest('tr').style.background = 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)'}
                        onMouseLeave={(e) => e.target.closest('tr').style.background = 'white'}
                      >
                        <td style={{...styles.tableCell, fontWeight: '600'}}>{call.driver_name}</td>
                        <td style={styles.tableCell}>{call.phone_number}</td>
                        <td style={styles.tableCell}>{call.load_number || "N/A"}</td>
                        <td style={styles.tableCell}>{getOutcomeBadge(call.call_outcome)}</td>
                        <td 
                          style={{...styles.tableCell, color: '#667eea', cursor: 'pointer', fontWeight: '500'}}
                          onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                        >
                          {expandedCall === call.id ? "🔽 Hide Details" : "📖 View Details"}
                        </td>
                      </tr>
                      {expandedCall === call.id && (
                        <tr key={`${call.id}-details`}>
                          <td colSpan="5" style={{padding: '0'}}>
                            <div style={styles.expandedContent}>
                              <div style={{display: 'grid', gap: '1.5rem'}}>
                                <div>
                                  <h4 style={{fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748'}}>📝 Transcript:</h4>
                                  <div style={styles.transcript}>
                                    {call.transcript || "No transcript available."}
                                  </div>
                                </div>
                                {call.structured_data && (
                                  <div>
                                    <h4 style={{fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748'}}>📊 Structured Data:</h4>
                                    <pre style={styles.jsonData}>
                                      {JSON.stringify(call.structured_data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}