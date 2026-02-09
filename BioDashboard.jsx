import React, { useState } from 'react';

const BioDashboard = () => {
  const [dna, setDna] = useState("ATGCGATCGATCGATCGATC");
  const [history, setHistory] = useState([]); // Stores previous generations
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  const runEvolution = async () => {
    setLoading(true);
    const wakeTimer = setTimeout(() => setIsWaking(true), 2000);

    try {
      const response = await fetch("https://genome-lab.onrender.com/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna: dna,
          mutation_rate: 5.0, // Increased for visible changes
          temp: 37,
          ph: 7.0
        })
      });
      
      if (!response.ok) throw new Error("Backend offline");
      
      const data = await response.json();
      
      // Update the current DNA to the new mutated one for the next click
      setDna(data.dna);
      
      // Add the result to the beginning of the history array
      setHistory(prev => [{
        timestamp: new Date().toLocaleTimeString(),
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

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#60a5fa', margin: '0' }}>🧬 GenomeLab Phase 2</h1>
        <p style={{ color: '#94a3b8' }}>Tracking Evolutionary Stability</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Left Column: Controls & Current DNA */}
        <section style={{ background: '#1e293b', padding: '25px', borderRadius: '12px' }}>
          <label style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Current DNA Sequence (Auto-updates on Evolve):</label>
          <textarea 
            value={dna} 
            onChange={(e) => setDna(e.target.value)}
            style={{ width: '100%', height: '80px', background: '#0f172a', color: '#10b981', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginTop: '10px', fontFamily: 'monospace' }}
          />
          
          <button 
            onClick={runEvolution}
            disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}
          >
            {loading ? (isWaking ? "WAKING UP ENGINE..." : "MUTATING...") : "STEP EVOLUTION (GEN +1)"}
          </button>

          {history.length > 0 && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>Current Champion Stats</h3>
              <p><strong>Protein:</strong> {history[0].analysis.protein}</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>Stability: <span style={{ color: history[0].analysis.stability < 40 ? '#10b981' : '#f87171' }}>{history[0].analysis.stability.toFixed(2)}</span></div>
                <div>Helix: {history[0].analysis.helix.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Mutation History Log */}
        <aside style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', height: '600px', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>Mutation History</h3>
          {history.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No data yet. Run a simulation to see history.</p>}
          {history.map((entry, idx) => (
            <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #334155', fontSize: '0.85rem' }}>
              <div style={{ color: '#94a3b8' }}>[{entry.timestamp}] Gen {history.length - idx}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span>Stability: <strong>{entry.analysis.stability.toFixed(1)}</strong></span>
                <span style={{ color: '#60a5fa' }}>Helix: {entry.analysis.helix.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </aside>

      </div>
    </div>
  );
};

export default BioDashboard;
