import React, { useState } from 'react';

const BioDashboard = () => {
  const [dna, setDna] = useState("ATGCGATCGATCGATCGATC");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runEvolution = async () => {
    setLoading(true);
    try {
      // Points to your LIVE Render backend
      const response = await fetch("https://genome-lab.onrender.com/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna: dna,
          mutation_rate: 2.5,
          temp: 37,
          ph: 7.0
        })
      });
      
      if (!response.ok) throw new Error("Backend response error");
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Evolution failed:", error);
      alert("Could not connect to the Evolution Engine. Ensure the Render service is awake!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
        <h1>🧬 GenomeLab Phase 2</h1>
        <p style={{ color: '#94a3b8' }}>Integrated React Frontend x Render Backend</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <label>Input DNA Sequence:</label>
        <textarea 
          value={dna} 
          onChange={(e) => setDna(e.target.value)}
          style={{ width: '100%', height: '100px', margin: '10px 0', background: '#1e293b', color: '#10b981', border: '1px solid #334155', borderRadius: '4px', padding: '10px', fontSize: '1.2rem' }}
        />
        
        <button 
          onClick={runEvolution}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? "SIMULATING EVOLUTION..." : "START EVOLUTION ENGINE"}
        </button>

        {results && (
          <div style={{ marginTop: '30px', background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
            <h3 style={{ color: '#3b82f6' }}>Champion Sequence (Gen 1)</h3>
            <code style={{ wordBreak: 'break-all', color: '#10b981' }}>{results.dna}</code>
            
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ padding: '10px', background: '#0f172a', borderRadius: '4px' }}>
                <small>Alpha Helix</small>
                <div style={{ fontSize: '1.5rem' }}>{results.analysis.helix.toFixed(1)}%</div>
              </div>
              <div style={{ padding: '10px', background: '#0f172a', borderRadius: '4px' }}>
                <small>Stability Index</small>
                <div style={{ fontSize: '1.5rem', color: results.analysis.stability < 40 ? '#10b981' : '#ef4444' }}>
                  {results.analysis.stability.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BioDashboard;
