import { useEffect, useState } from "react";
import api from "../api";

export default function CallRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);

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
    recordsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '2rem',
      marginTop: '2rem'
    },
    recordCard: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden'
    },
    recordCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      borderColor: '#667eea'
    },
    recordCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #f1f5f9'
    },
    driverInfo: {
      flex: '1'
    },
    driverName: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    driverDetails: {
      fontSize: '0.95rem',
      color: '#718096',
      lineHeight: '1.5'
    },
    statusBadge: {
      padding: '0.6rem 1.2rem',
      borderRadius: '25px',
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      alignSelf: 'flex-start'
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
    recordMeta: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    metaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    metaLabel: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#718096',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    metaValue: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2d3748'
    },
    expandButton: {
      width: '100%',
      padding: '0.875rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    },
    expandButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)'
    },
    expandedContent: {
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '3px solid #e2e8f0',
      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: '12px',
      padding: '1.5rem'
    },
    transcriptSection: {
      marginBottom: '2rem'
    },
    sectionLabel: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#2d3748',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    transcript: {
      background: '#f7fafc',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      color: '#4a5568',
      fontStyle: 'italic'
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
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      maxHeight: '400px'
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
    emptyState: {
      textAlign: 'center',
      padding: '4rem',
      color: '#a0aec0',
      fontSize: '1.2rem',
      fontStyle: 'italic'
    },
    icon: {
      fontSize: '1.2rem',
      marginRight: '0.5rem'
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'space-around',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '1.5rem',
      borderRadius: '16px',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#667eea',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#718096',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/calls/");
        setRecords(res.data?.calls || res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch call records:", err);
        setError("Failed to load call records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const getOutcomeBadge = (outcome) => {
    const baseStyle = styles.statusBadge;
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

  const getCallStats = () => {
    const total = records.length;
    const completed = records.filter(r => r.call_outcome === "Completed" || r.call_outcome === "Emergency Escalation" || r.call_outcome === "In-Transit Update" || r.call_outcome === "Arrival Confirmation").length;
    const failed = records.filter(r => r.call_outcome === "Failed").length;
    const pending = records.filter(r => !r.call_outcome || r.call_outcome === "Pending").length;
    
    return { total, completed, failed, pending };
  };

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
        Loading call records...
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

  const stats = getCallStats();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <h1 style={styles.title}>📊 Call Records</h1>
          <p style={styles.subtitle}>Review and Analyze Voice Agent Call History</p>
        </div>

        {/* Stats Bar */}
        {records.length > 0 && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Calls</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.failed}</div>
              <div style={styles.statLabel}>Failed</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.pending}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>
        )}

        {/* Call Records Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>📋</span>
            Call History
          </h2>
          
          {records.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📞</div>
              No call records found yet.<br />
              Start a test call to see records here!
            </div>
          ) : (
            <div style={styles.recordsGrid}>
              {records.map((record) => (
                <div
                  key={record.id}
                  style={styles.recordCard}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, styles.recordCardHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, styles.recordCard);
                  }}
                >
                  {/* Record Header */}
                  <div style={styles.recordCardHeader}>
                    <div style={styles.driverInfo}>
                      <div style={styles.driverName}>{record.driver_name}</div>
                      <div style={styles.driverDetails}>
                        📞 {record.phone_number}<br />
                        🚛 Load: {record.load_number || "N/A"}
                      </div>
                    </div>
                    {getOutcomeBadge(record.call_outcome)}
                  </div>

                  {/* Record Meta */}
                  <div style={styles.recordMeta}>
                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Driver</div>
                      <div style={styles.metaValue}>{record.driver_name}</div>
                    </div>
                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Phone</div>
                      <div style={styles.metaValue}>{record.phone_number}</div>
                    </div>
                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Load Number</div>
                      <div style={styles.metaValue}>{record.load_number || "N/A"}</div>
                    </div>
                    <div style={styles.metaItem}>
                      <div style={styles.metaLabel}>Status</div>
                      <div style={styles.metaValue}>{record.call_outcome || "Pending"}</div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    style={styles.expandButton}
                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                    onMouseEnter={(e) => Object.assign(e.target.style, styles.expandButtonHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, styles.expandButton)}
                  >
                    {expandedRecord === record.id ? "🔽 Hide Details" : "📖 View Details"}
                  </button>

                  {/* Expanded Content */}
                  {expandedRecord === record.id && (
                    <div style={styles.expandedContent}>
                      {/* Transcript Section */}
                      <div style={styles.transcriptSection}>
                        <div style={styles.sectionLabel}>
                          <span style={styles.icon}>📝</span>
                          Call Transcript
                        </div>
                        <div style={styles.transcript}>
                          {record.transcript || "No transcript available."}
                        </div>
                      </div>

                      {/* Structured Data Section */}
                      {record.structured_data && (
                        <div style={styles.transcriptSection}>
                          <div style={styles.sectionLabel}>
                            <span style={styles.icon}>📊</span>
                            Structured Data
                          </div>
                          <pre style={styles.jsonData}>
                            {JSON.stringify(record.structured_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}