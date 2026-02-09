import React, { useState } from 'react';

const BioDashboard = () => {
  const [dna, setDna] = useState("ATGCGATCGATCGATCGATC");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runEvolution = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://your-render-app.onrender.com/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna: dna,
          mutation_rate: 2.5,
          temp: 37,
          ph: 7.2
        })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Evolution failed:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1a1a1a', color: 'white', borderRadius: '8px' }}>
      <h2>🧬 GenomeLab Dashboard</h2>
      <textarea 
        value={dna} 
        onChange={(e) => setDna(e.target.value)}
        style={{ width: '100%', height: '80px', backgroundColor: '#333', color: '#00ff00', border: '1px solid #555' }}
      />
      <button 
        onClick={runEvolution}
        disabled={loading}
        style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', border: 'none', color: 'white' }}
      >
        {loading ? "Evolving..." : "Run Phase 2 Evolution"}
      </button>

      {results && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
          <h3>Champion Analysis</h3>
          <p><strong>Protein:</strong> {results.analysis.protein}</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, backgroundColor: '#222', padding: '15px', borderRadius: '5px' }}>
              <h4>Helix Content</h4>
              <div style={{ height: '20px', width: '100%', backgroundColor: '#444' }}>
                <div style={{ height: '100%', width: `${results.analysis.helix}%`, backgroundColor: '#2196F3' }}></div>
              </div>
              <p>{results.analysis.helix.toFixed(2)}%</p>
            </div>
            <div style={{ flex: 1, backgroundColor: '#222', padding: '15px', borderRadius: '5px' }}>
              <h4>Stability Index</h4>
              <p style={{ fontSize: '24px', color: results.analysis.stability < 40 ? '#4CAF50' : '#f44336' }}>
                {results.analysis.stability.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioDashboard;
