import { useEffect, useState } from "react";
import api from "../api";
import { updateAgent, createAgent } from "../api/agentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RetellWebClient } from "retell-client-js-sdk";
import "./Dashboard.css";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCall, setExpandedCall] = useState(null);
  const [startingCall, setStartingCall] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // Track active call
  const [retellClient, setRetellClient] = useState(null); // Store client instance
  
  // Agent editing state
  const [editingAgent, setEditingAgent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    prompt: "",
    voice_settings: {
      voice_id: "11labs-Adrian",
      language: "en",
      backchanneling: true,
      filler_words: true,
      interruption_sensitivity: 0.7,
      response_delay: 0.8
    }
  });
  const [updatingAgent, setUpdatingAgent] = useState(false);

  // Scenario agent creation state
  const [scenarioAgent, setScenarioAgent] = useState({
    scenario_type: "",
    driver_name: "",
    load_number: "",
  });
  const [creatingScenarioAgent, setCreatingScenarioAgent] = useState(false);

  // Manual test call form
  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loadNumber, setLoadNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Custom agent creation form
  const [customAgent, setCustomAgent] = useState({
    name: "",
    description: "",
    prompt: ""
  });
  const [creatingCustomAgent, setCreatingCustomAgent] = useState(false);

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

  // --- End Active Call ---
  const handleEndCall = () => {
    if (retellClient && activeCall) {
      try {
        retellClient.endCall();
        setActiveCall(null);
        setRetellClient(null);
        toast.info("Call ended by user");
      } catch (err) {
        console.error("Error ending call:", err);
        toast.error("Failed to end call");
      }
    }
  };

  // --- Create Custom Agent ---
  const handleCreateCustomAgent = async (e) => {
    e.preventDefault();
    setCreatingCustomAgent(true);
    try {
      const agentData = {
        name: customAgent.name,
        description: customAgent.description,
        prompt: customAgent.prompt,
        settings: {
          advanced_settings: {
            voice_id: "11labs-Adrian",
            language: "en",
            backchanneling: true,
            filler_words: true,
            interruption_sensitivity: 0.7,
            response_delay: 0.8
          }
        }
      };

      const res = await createAgent(agentData);
      toast.success(`Custom agent "${customAgent.name}" created successfully!`);
      setAgents((prev) => [...prev, res.data.data]);
      setCustomAgent({
        name: "",
        description: "",
        prompt: ""
      });
    } catch (err) {
      console.error("Create custom agent error:", err);
      toast.error("Failed to create custom agent.");
    } finally {
      setCreatingCustomAgent(false);
    }
  };

  // --- Create Scenario Agent ---
  const handleCreateScenarioAgent = async (e) => {
    e.preventDefault();
    setCreatingScenarioAgent(true);
    try {
      const res = await api.post("/agents/scenario", scenarioAgent);
      toast.success(`Scenario agent created successfully!`);
      setAgents((prev) => [...prev, res.data.data]);
      setScenarioAgent({ scenario_type: "", driver_name: "", load_number: "" });
    } catch (err) {
      console.error("Create scenario agent error:", err);
      toast.error("Failed to create scenario agent.");
    } finally {
      setCreatingScenarioAgent(false);
    }
  };

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

  // --- Agent Editing Functions ---
  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    
    const newForm = {
      name: agent.name || "",
      description: agent.description || "",
      prompt: agent.prompt || "",
      voice_settings: {
        voice_id: agent.settings?.advanced_settings?.voice_id || "11labs-Adrian",
        language: agent.settings?.advanced_settings?.language || "en",
        backchanneling: agent.settings?.advanced_settings?.backchanneling ?? true,
        filler_words: agent.settings?.advanced_settings?.filler_words ?? true,
        interruption_sensitivity: agent.settings?.advanced_settings?.interruption_sensitivity ?? 0.7,
        response_delay: agent.settings?.advanced_settings?.response_delay ?? 0.8
      }
    };
    
    setEditForm(newForm);
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    setUpdatingAgent(true);
    
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        prompt: editForm.prompt,
        settings: {
          ...editingAgent.settings,
          advanced_settings: editForm.voice_settings
        }
      };

      const res = await updateAgent(editingAgent.id, updateData);
      toast.success("Agent updated successfully in both Retell AI and Supabase!");
      
      // Refresh agents list
      const agentsRes = await api.get("/agents/");
      setAgents(agentsRes.data?.data || []);
      
      // Close edit form
      setEditingAgent(null);
      setEditForm({
        name: "",
        description: "",
        prompt: "",
        voice_settings: {
          voice_id: "11labs-Adrian",
          language: "en",
          backchanneling: true,
          filler_words: true,
          interruption_sensitivity: 0.7,
          response_delay: 0.8
        }
      });
    } catch (err) {
      console.error("Update agent error:", err);
      toast.error("Failed to update agent.");
    } finally {
      setUpdatingAgent(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAgent(null);
    setEditForm({
      name: "",
      description: "",
      prompt: "",
      voice_settings: {
        voice_id: "11labs-Adrian",
        language: "en",
        backchanneling: true,
        filler_words: true,
        interruption_sensitivity: 0.7,
        response_delay: 0.8
      }
    });
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl text-indigo-600">
        ⏳ Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500 text-xl">
        ❌ {error}
      </div>
    );

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="dashboard-content">
        
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-logo">
            <span style={{ fontSize: '2.5rem' }}>🎯</span>
          </div>
          <h1 className="dashboard-title">
            AI Voice Agent Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Configure intelligent voice agents, conduct test calls, and analyze conversation results with ease
          </p>
        </div>

        {/* Active Call Status */}
        {activeCall && (
          <div className="active-call-banner">
            <div className="active-call-content">
              <div className="active-call-info">
                <div className="active-call-indicator"></div>
                <div>
                  <h3 style={{ color: '#2d5016', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    📞 Active Call
                  </h3>
                  <p style={{ color: '#2d5016', margin: 0, fontSize: '0.9rem' }}>
                    {activeCall.driver_name} • Load {activeCall.load_number}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEndCall}
                className="btn btn-danger"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="main-content-grid">
          
          {/* Create Custom Agent Section */}
          <div className="dashboard-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' }}>
                🤖
              </div>
              <h2 className="section-title">Create Custom Agent</h2>
            </div>
            
            <form onSubmit={handleCreateCustomAgent}>
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  placeholder="Enter agent name"
                  value={customAgent.name}
                  onChange={(e) => setCustomAgent({...customAgent, name: e.target.value})}
                  required
                  className="modal-form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="Enter agent description"
                  value={customAgent.description}
                  onChange={(e) => setCustomAgent({...customAgent, description: e.target.value})}
                  className="modal-form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Agent Prompt</label>
                <textarea
                  placeholder="Enter the agent's conversation prompt"
                  value={customAgent.prompt}
                  onChange={(e) => setCustomAgent({...customAgent, prompt: e.target.value})}
                  required
                  className="modal-form-textarea"
                  rows="4"
                  style={{ minHeight: '100px' }}
                />
              </div>

              
              <button
                type="submit"
                disabled={creatingCustomAgent}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {creatingCustomAgent ? (
                  <>
                    <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                    Creating...
                  </>
                ) : (
                  '🤖 Create Custom Agent'
                )}
              </button>
            </form>
          </div>

          {/* Agent Creation Section */}
          <div className="dashboard-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                🎯
              </div>
              <h2 className="section-title">Create Scenario Agent</h2>
            </div>
            
            <form onSubmit={handleCreateScenarioAgent}>
              <div className="form-group">
                <label className="form-label">Scenario Type</label>
                <select
                  value={scenarioAgent.scenario_type}
                  onChange={(e) =>
                    setScenarioAgent({ ...scenarioAgent, scenario_type: e.target.value })
                  }
                  required
                  className="modal-form-select"
                >
                  <option value="">Select Scenario Type</option>
                  <option value="dispatch_checkin">Dispatch Check-in Agent</option>
                  <option value="emergency_protocol">Emergency Protocol Agent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Driver Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter driver name for personalized prompts"
                  value={scenarioAgent.driver_name}
                  onChange={(e) =>
                    setScenarioAgent({ ...scenarioAgent, driver_name: e.target.value })
                  }
                  className="modal-form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Load Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter load number for context"
                  value={scenarioAgent.load_number}
                  onChange={(e) =>
                    setScenarioAgent({ ...scenarioAgent, load_number: e.target.value })
                  }
                  className="modal-form-input"
                />
              </div>
              
              <button
                type="submit"
                disabled={creatingScenarioAgent}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {creatingScenarioAgent ? (
                  <>
                    <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                    Creating...
                  </>
                ) : (
                  '🎯 Create Scenario Agent'
                )}
              </button>
            </form>
          </div>

          {/* Manual Test Call Section */}
          <div className="dashboard-card">
            <div className="section-header">
              <div className="section-icon" style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}>
                📞
              </div>
              <h2 className="section-title">Manual Test Call</h2>
            </div>
            
            <form onSubmit={handleStartTestCall}>
              <div className="form-group">
                <label className="form-label">Select Agent (Optional)</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="modal-form-select"
                >
                  <option value="">Use Default Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} {agent.settings?.scenario_type ? `(${agent.settings.scenario_type === 'dispatch_checkin' ? 'Dispatch Check-in' : 'Emergency Protocol'})` : '(Custom)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input
                  type="text"
                  placeholder="Enter driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Load Number</label>
                <input
                  type="text"
                  placeholder="Enter load number"
                  value={loadNumber}
                  onChange={(e) => setLoadNumber(e.target.value)}
                  required
                  className="modal-form-input"
                />
              </div>
              
              <button
                type="submit"
                disabled={startingCall || activeCall}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                {startingCall ? (
                  <>
                    <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                    Starting...
                  </>
                ) : activeCall ? (
                  'Call in Progress'
                ) : (
                  '🚀 Start Test Call'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Configured Agents Section */}
        <div className="dashboard-card">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}>
              🤖
            </div>
            <div className="section-title-container">
              <h2 className="section-title">Configured Agents</h2>
              <div className="agent-count">
                {agents.length} agent{agents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {agents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div>
              <h3>No agents configured yet</h3>
              <p>Create a scenario agent to get started with voice calls!</p>
            </div>
          ) : (
            <div className="agent-grid">
              {agents.map((agent) => {
                const scenarioType = agent.settings?.scenario_type;
                const isScenarioAgent = !!scenarioType;
                return (
                  <div
                    key={agent.id}
                    className={`agent-card ${isScenarioAgent ? 'scenario' : ''}`}
                  >
                    <div className="agent-header">
                      <h3 className="agent-name">{agent.name}</h3>
                      {isScenarioAgent && (
                        <span className="agent-badge">SCENARIO</span>
                      )}
                    </div>
                    <p className="agent-description">{agent.description}</p>
                    <p className="agent-type">
                      Type: {isScenarioAgent 
                        ? (scenarioType === 'dispatch_checkin' ? 'Dispatch Check-in' : 'Emergency Protocol')
                        : 'Custom'
                      }
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleStartWebCall(agent.id)}
                        disabled={startingCall || activeCall}
                        className={`btn ${isScenarioAgent ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '0.75rem' }}
                      >
                        {startingCall ? (
                          <>
                            <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                            Starting...
                          </>
                        ) : activeCall ? (
                          'Busy'
                        ) : (
                          'Start Call'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Call Records Section */}
        <div className="dashboard-card call-records">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' }}>
              📊
            </div>
            <div className="section-title-container">
              <h2 className="section-title">Recent Calls</h2>
              <button
                onClick={refreshCallRecords}
                className="btn refresh-btn"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {calls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📞</div>
              <h3>No calls yet</h3>
              <p>Start a test call to see results here!</p>
            </div>
          ) : (
            <div>
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="call-item"
                  onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                >
                  <div className="call-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="call-avatar">
                        {call.driver_name?.charAt(0) || "?"}
                      </div>
                      <div className="call-info">
                        <h3>{call.driver_name}</h3>
                        <p>{call.phone_number} • Load {call.load_number}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`status-badge ${
                        call.call_outcome === "Completed" || call.call_outcome === "In-Transit Update" || call.call_outcome === "Arrival Confirmation"
                          ? "status-completed"
                          : call.call_outcome === "Emergency Escalation"
                          ? "status-emergency"
                          : call.call_outcome === "Pending"
                          ? "status-pending"
                          : "status-failed"
                      }`}>
                        {call.call_outcome || "Pending"}
                      </span>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: '#f1f5f9', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <span style={{ color: '#718096', fontSize: '0.8rem' }}>
                          {expandedCall === call.id ? "▼" : "▶"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Call Details */}
                  {expandedCall === call.id && (
                    <div className="expandable-content">
                      {/* Transcript */}
                      {call.transcript && (
                        <div className="transcript-section">
                          <h4 style={{ 
                            fontWeight: '600', 
                            color: '#2d3748', 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ marginRight: '0.5rem' }}>📝</span>
                            Call Transcript
                          </h4>
                          <div className="transcript-content">
                            {call.transcript}
                          </div>
                        </div>
                      )}
                      
                      {/* Structured Data */}
                      {call.structured_data && Object.keys(call.structured_data).length > 0 && (
                        <div>
                          <h4 style={{ 
                            fontWeight: '600', 
                            color: '#2d3748', 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ marginRight: '0.5rem' }}>📊</span>
                            Structured Data
                          </h4>
                          <div className="structured-data">
                            <pre>{JSON.stringify(call.structured_data, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Edit Modal */}
        {editingAgent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>✏️</span>
                  Edit Agent: {editingAgent.name}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#718096',
                    padding: '0.5rem'
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAgent}>
                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                    className="modal-form-input"
                    placeholder="Enter agent name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="modal-form-input"
                    placeholder="Enter agent description"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Agent Prompt</label>
                  <textarea
                    value={editForm.prompt}
                    onChange={(e) => setEditForm({...editForm, prompt: e.target.value})}
                    required
                    className="modal-form-textarea"
                    placeholder="Enter the agent's conversation prompt"
                    rows="6"
                    style={{ minHeight: '120px' }}
                  />
                </div>

                {/* Voice Settings - Only show for custom agents, not scenario agents */}
                {!editingAgent?.settings?.scenario_type && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '1rem'
                    }}>
                      Voice Settings
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Voice ID</label>
                        <select
                          value={editForm.voice_settings.voice_id}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, voice_id: e.target.value}
                          })}
                          className="modal-form-select"
                        >
                          <option value="11labs-Adrian">Adrian (Male)</option>
                          <option value="11labs-Sarah">Sarah (Female)</option>
                          <option value="11labs-Michael">Michael (Male)</option>
                          <option value="11labs-Emma">Emma (Female)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Language</label>
                        <select
                          value={editForm.voice_settings.language}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, language: e.target.value}
                          })}
                          className="modal-form-select"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Interruption Sensitivity</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editForm.voice_settings.interruption_sensitivity}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, interruption_sensitivity: parseFloat(e.target.value)}
                          })}
                          className="modal-form-input"
                        />
                        <div style={{ fontSize: '0.8rem', color: '#718096', textAlign: 'center' }}>
                          {editForm.voice_settings.interruption_sensitivity}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Response Delay (seconds)</label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={editForm.voice_settings.response_delay}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, response_delay: parseFloat(e.target.value)}
                          })}
                          className="modal-form-input"
                        />
                        <div style={{ fontSize: '0.8rem', color: '#718096', textAlign: 'center' }}>
                          {editForm.voice_settings.response_delay}s
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editForm.voice_settings.backchanneling}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, backchanneling: e.target.checked}
                          })}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Backchanneling</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editForm.voice_settings.filler_words}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            voice_settings: {...editForm.voice_settings, filler_words: e.target.checked}
                          })}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Filler Words</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Scenario Agent Info - Show for scenario agents */}
                {editingAgent?.settings?.scenario_type && (
                  <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f7fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>🎯</span>
                      Scenario Agent Configuration
                    </h3>
                    <p style={{
                      color: '#718096',
                      fontSize: '0.9rem',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      This is a pre-configured scenario agent. Voice settings are optimized for the {editingAgent.settings.scenario_type === 'dispatch_checkin' ? 'Dispatch Check-in' : 'Emergency Protocol'} scenario and cannot be modified.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingAgent}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    {updatingAgent ? (
                      <>
                        <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                        Updating...
                      </>
                    ) : (
                      '💾 Update Agent'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
