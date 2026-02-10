import React, { useState, useEffect } from 'react';

const BioDashboard = () => {
  const [dna, setDna] = useState("ATGCGATCGATCGATCGATC");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  // Stats for the "Lab Report"
  const getAverageStability = () => history.length ? (history.reduce((acc, curr) => acc + curr.analysis.stability, 0) / history.length).toFixed(2) : 0;

  const runEvolution = async () => {
    setLoading(true);
    const wakeTimer = setTimeout(() => setIsWaking(true), 2000);

    try {
      const response = await fetch("https://genome-lab.onrender.com/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, mutation_rate: 5.0, temp: 37, ph: 7.0 })
      });
      
      const data = await response.json();
      setDna(data.dna);
      setHistory(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        gen: prev.length + 1,
        ...data
      }, ...prev]);

    } catch (error) {
      console.error("Evolution failed:", error);
    } finally {
      clearTimeout(wakeTimer);
      setLoading(false);
      setIsWaking(false);
    }
  };

  const downloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "genomelab_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{ padding: '20px', background: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: 'monospace' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#3b82f6', margin: 0 }}>🧬 GENOMELAB V2.5</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Integrated Biophysics & Mutation Tracker</p>
        </div>
        <button onClick={downloadData} style={{ background: '#1e293b', color: '#60a5fa', border: '1px solid #3b82f6', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>
          EXPORT DATA (.JSON)
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        
        {/* WORKSTATION */}
        <main>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '1rem', color: '#94a3b8' }}>LIVE SEQUENCE</h2>
            <div style={{ background: '#020617', padding: '15px', color: '#10b981', borderRadius: '4px', wordBreak: 'break-all', border: '1px solid #334155', marginBottom: '20px' }}>
              {dna}
            </div>
            
            <button 
              onClick={runEvolution} 
              disabled={loading}
              style={{ width: '100%', padding: '20px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {loading ? (isWaking ? "WAKING ENGINE..." : "SIMULATING...") : "EXECUTE MUTATION STEP"}
            </button>
          </div>

          {/* QUICK ANALYTICS BARS */}
          {history.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
              <StatCard label="Avg Stability" value={getAverageStability()} color="#10b981" />
              <StatCard label="Latest Helix" value={history[0].analysis.helix.toFixed(1) + "%"} color="#3b82f6" />
              <StatCard label="Total Gens" value={history.length} color="#a855f7" />
            </div>
          )}
        </main>

        {/* LAB LOGS */}
        <aside style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', padding: '20px', height: '80vh', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1rem', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>MUTATION LOG</h2>
          {history.map((log, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>[{log.timestamp}]</span> <span style={{ color: '#3b82f6' }}>Gen {log.gen}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span>Stability: <b style={{ color: log.analysis.stability < 40 ? '#10b981' : '#ef4444' }}>{log.analysis.stability.toFixed(2)}</b></span>
                <span>Isoelectric: {log.analysis.isoelectric_point?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: `1px solid ${color}33`, borderTop: `4px solid ${color}` }}>
    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{value}</div>
  </div>
);

export default BioDashboard;
