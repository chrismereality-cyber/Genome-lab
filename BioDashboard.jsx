import React, { useState, useEffect } from 'react';

const BioDashboard = () => {
  const [dna, setDna] = useState("ATGCGATCGATCGATCGATC");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  const runEvolution = async () => {
    setLoading(true);
    // Start showing the "Wake-up" message after 2 seconds of waiting
    const wakeTimer = setTimeout(() => setIsWaking(true), 2000);

    try {
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
      
      if (!response.ok) throw new Error("Backend offline");
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Evolution failed:", error);
      alert("Engine connection failed. Please try again in 30 seconds while the server initializes.");
    } finally {
      clearTimeout(wakeTimer);
      setLoading(false);
      setIsWaking(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0', color: '#60a5fa' }}>🧬 GenomeLab</h1>
        <p style={{ color: '#94a3b8' }}>Real-time Biophysics Simulation</p>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#cbd5e1' }}>Sequence DNA</label>
        <textarea 
          value={dna} 
          onChange={(e) => setDna(e.target.value)}
          style={{ width: '100%', height: '80px', background: '#0f172a', color: '#10b981', border: '1px solid #334155', borderRadius: '8px', padding: '12px', fontSize: '1rem', marginBottom: '20px', resize: 'none' }}
        />
        
        <button 
          onClick={runEvolution}
          disabled={loading}
          style={{ 
            width: '100%', padding: '15px', background: loading ? '#334155' : '#3b82f6', 
            color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div className="spinner"></div> {isWaking ? "WAKING UP ENGINE..." : "EVOLVING..."}
            </span>
          ) : "RUN SIMULATION"}
        </button>

        {isWaking && (
          <p style={{ fontSize: '0.8rem', color: '#fbbf24', textAlign: 'center', marginTop: '10px' }}>
            ⚠️ Render Free Tier detected. Initializing container (this may take 30s)...
          </p>
        )}

        {results && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Simulated Outcome</h3>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <strong>Resulting Protein:</strong> {results.analysis.protein}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div style={{ textAlign: 'center', background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>HELIX %</div>
                <div style={{ fontSize: '1.4rem', color: '#60a5fa' }}>{results.analysis.helix.toFixed(1)}%</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>STABILITY</div>
                <div style={{ fontSize: '1.4rem', color: results.analysis.stability < 40 ? '#10b981' : '#f87171' }}>
                  {results.analysis.stability.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BioDashboard;
